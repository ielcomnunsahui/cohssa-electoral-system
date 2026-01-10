import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface RegistrationAnalyticsProps {
  registrationsByDate: { date: string; count: number }[];
  registrationsByDevice: { device: string; count: number }[];
  registrationsByDepartment: { department: string; count: number }[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const RegistrationAnalytics = ({
  registrationsByDate,
  registrationsByDevice,
  registrationsByDepartment
}: RegistrationAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Registrations Over Time */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Voter Registrations Over Time</CardTitle>
          <CardDescription>Daily registration trends for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationsByDate}>
                <defs>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                  formatter={(value: number) => [value, "Registrations"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorRegistrations)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Device Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registrations by Device Type</CardTitle>
          <CardDescription>Distribution of device fingerprints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={registrationsByDevice}
                  dataKey="count"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ device, percent }) => `${device} (${(typeof percent === 'number' ? (percent * 100).toFixed(0) : 0)}%)`}
                >
                  {registrationsByDevice.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registrations by Department</CardTitle>
          <CardDescription>Top departments by voter registration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationsByDepartment} layout="vertical">
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="department" 
                  width={100} 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
                />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to process registration data
export const processRegistrationData = (voters: { created_at: string | null; department: string; device_fingerprint: string | null }[]) => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  
  // Generate all dates in range
  const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
  const dateCounts: Record<string, number> = {};
  dateRange.forEach(date => {
    dateCounts[format(startOfDay(date), "yyyy-MM-dd")] = 0;
  });

  // Count registrations by date
  voters.forEach(voter => {
    if (voter.created_at) {
      const date = format(startOfDay(new Date(voter.created_at)), "yyyy-MM-dd");
      if (dateCounts[date] !== undefined) {
        dateCounts[date]++;
      }
    }
  });

  const registrationsByDate = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count
  }));

  // Count registrations by device type (based on fingerprint patterns)
  const deviceCounts: Record<string, number> = {
    "Mobile": 0,
    "Desktop": 0,
    "Unknown": 0
  };

  voters.forEach(voter => {
    if (voter.device_fingerprint) {
      // Simple heuristic: shorter fingerprints tend to be mobile
      // In reality, you'd parse the user agent from the fingerprint
      const fpLength = voter.device_fingerprint.length;
      if (fpLength < 40) {
        deviceCounts["Mobile"]++;
      } else {
        deviceCounts["Desktop"]++;
      }
    } else {
      deviceCounts["Unknown"]++;
    }
  });

  const registrationsByDevice = Object.entries(deviceCounts)
    .filter(([_, count]) => count > 0)
    .map(([device, count]) => ({ device, count }));

  // Count registrations by department
  const deptCounts: Record<string, number> = {};
  voters.forEach(voter => {
    if (voter.department) {
      deptCounts[voter.department] = (deptCounts[voter.department] || 0) + 1;
    }
  });

  const registrationsByDepartment = Object.entries(deptCounts)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { registrationsByDate, registrationsByDevice, registrationsByDepartment };
};
