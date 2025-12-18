import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Vote, Settings, Calendar, BarChart3, UserCheck, UserPlus, FileCheck, Trophy, Loader2, ArrowUpRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTour, adminDashboardTourSteps } from "@/hooks/useAdminTour";
import { Progress } from "@/components/ui/progress";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import SEO from "@/components/SEO";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { startTour, hasSeenTour } = useAdminTour({
    tourKey: 'admin_dashboard',
    steps: adminDashboardTourSteps,
    autoStart: true,
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    registeredVoters: 0,
    submittedApplications: 0,
    activeCandidates: 0,
    votingTurnout: 0,
    votedCount: 0
  });
  const [chartData, setChartData] = useState({
    voterTurnoutData: [] as { name: string; value: number }[],
    applicationStatusData: [] as { name: string; value: number }[],
    timelineData: [] as { stage: string; progress: number }[],
    departmentData: [] as { department: string; voters: number; applications: number }[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadChartData();

    const channels = [
      supabase.channel('student-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => { loadStats(); loadChartData(); }).subscribe(),
      supabase.channel('voter-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, () => { loadStats(); loadChartData(); }).subscribe(),
      supabase.channel('application-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'aspirants' }, () => { loadStats(); loadChartData(); }).subscribe(),
      supabase.channel('candidate-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => { loadStats(); loadChartData(); }).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const loadStats = async () => {
    try {
      const [studentsRes, votersRes, applicationsRes, candidatesRes, votesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('voters').select('id', { count: 'exact', head: true }),
        supabase.from('aspirants').select('id', { count: 'exact', head: true }),
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('voters').select('has_voted', { count: 'exact' }).eq('has_voted', true)
      ]);

      const totalVoters = votersRes.count || 0;
      const votedCount = votesRes.count || 0;
      const turnout = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;

      setStats({
        totalStudents: studentsRes.count || 0,
        registeredVoters: totalVoters,
        submittedApplications: applicationsRes.count || 0,
        activeCandidates: candidatesRes.count || 0,
        votingTurnout: Math.round(turnout),
        votedCount
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const { data: voters } = await supabase.from('voters').select('has_voted, verified');
      const verified = voters?.filter(v => v.verified) || [];
      const voted = verified.filter(v => v.has_voted).length;
      const notVoted = verified.length - voted;

      const { data: applications } = await supabase.from('aspirants').select('status');
      const statusCounts = applications?.reduce((acc, app) => {
        acc[app.status || 'pending'] = (acc[app.status || 'pending'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const { data: timeline } = await supabase.from('election_timeline').select('*').order('start_time');
      const now = new Date();
      const timelineProgress = (timeline || []).map(stage => {
        const start = new Date(stage.start_time || stage.start_date);
        const end = new Date(stage.end_time || stage.end_date);
        let progress = 0;
        if (now >= end) progress = 100;
        else if (now >= start) {
          const total = end.getTime() - start.getTime();
          const elapsed = now.getTime() - start.getTime();
          progress = Math.round((elapsed / total) * 100);
        }
        return { stage: (stage.stage_name || stage.title).replace(' ', '\n'), progress };
      });

      const { data: studentDepts } = await supabase.from('students').select('department');
      const { data: appDepts } = await supabase.from('aspirants').select('department');

      const deptStats: Record<string, { voters: number; applications: number }> = {};
      (studentDepts || []).forEach(s => {
        if (!deptStats[s.department]) deptStats[s.department] = { voters: 0, applications: 0 };
      });
      (appDepts || []).forEach(a => {
        if (deptStats[a.department]) deptStats[a.department].applications++;
      });

      setChartData({
        voterTurnoutData: [
          { name: 'Voted', value: voted },
          { name: 'Not Voted', value: notVoted }
        ],
        applicationStatusData: Object.entries(statusCounts).map(([name, value]) => ({
          name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value
        })),
        timelineData: timelineProgress,
        departmentData: Object.entries(deptStats).slice(0, 6).map(([dept, data]) => ({
          department: dept.split(' ').map(w => w[0]).join(''),
          voters: data.voters,
          applications: data.applications
        }))
      });
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, [navigate]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
    } catch (error) {
      console.error("Access check error:", error);
      navigate("/admin/login");
    }
  };

  const statsCards = [
    { title: "Total Students", value: stats.totalStudents, icon: Users, color: "from-blue-500 to-blue-600", change: "+12%" },
    { title: "Registered Voters", value: stats.registeredVoters, icon: UserPlus, color: "from-green-500 to-green-600", change: "+8%" },
    { title: "Applications", value: stats.submittedApplications, icon: FileCheck, color: "from-orange-500 to-orange-600", change: "+5%" },
    { title: "Active Candidates", value: stats.activeCandidates, icon: Trophy, color: "from-purple-500 to-purple-600", change: null },
    { title: "Voter Turnout", value: `${stats.votingTurnout}%`, icon: UserCheck, color: "from-pink-500 to-pink-600", progress: stats.votingTurnout },
  ];

  const dashboardCards = [
    { title: "Student List", description: "Manage voter verification records", icon: Users, link: "/admin/students", gradient: "from-blue-500/10 to-cyan-500/10", iconColor: "text-blue-500" },
    { title: "Aspirant Review", description: "Review applications & screening", icon: FileText, link: "/admin/aspirants", gradient: "from-purple-500/10 to-pink-500/10", iconColor: "text-purple-500" },
    { title: "Candidate Management", description: "Manage election candidates", icon: Vote, link: "/admin/candidates", gradient: "from-green-500/10 to-emerald-500/10", iconColor: "text-green-500" },
    { title: "Position Management", description: "Configure positions & eligibility", icon: Settings, link: "/admin/positions", gradient: "from-orange-500/10 to-amber-500/10", iconColor: "text-orange-500" },
    { title: "Election Timeline", description: "Control election stages", icon: Calendar, link: "/admin/timeline", gradient: "from-indigo-500/10 to-violet-500/10", iconColor: "text-indigo-500" },
    { title: "Live Control", description: "Monitor voting & results", icon: BarChart3, link: "/admin/live-control", gradient: "from-red-500/10 to-rose-500/10", iconColor: "text-red-500" }
  ];

  return (
    <AdminLayout onStartTour={startTour}>
      <SEO 
        title="Admin Dashboard" 
        description="ISECO Admin Dashboard - Manage elections, voters, candidates, and monitor live results for COHSSA elections."
      />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your election overview.</p>
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {/* Stats Grid */}
        <div 
          data-tour="dashboard-stats"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.title} 
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">{stat.title}</span>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  {stat.progress !== undefined && (
                    <Progress value={stat.progress} className="h-1.5 mt-2" />
                  )}
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Cards Grid */}
        <div className="space-y-4" data-tour="quick-actions">
          <h2 className="text-xl font-semibold animate-fade-in" style={{ animationDelay: '200ms' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={card.title}
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${(index + 5) * 50}ms` }}
                  onClick={() => navigate(card.link)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-muted ${card.iconColor} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                    <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4" data-tour="dashboard-charts">
          <h2 className="text-xl font-semibold animate-fade-in" style={{ animationDelay: '250ms' }}>Analytics & Insights</h2>
          <DashboardCharts {...chartData} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
