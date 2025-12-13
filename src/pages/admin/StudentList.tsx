import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--secondary))', 'hsl(var(--destructive))'];

const StudentList = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const { logAction } = useAuditLog();

  useEffect(() => {
    loadStudents();
  }, []);

  const downloadTemplate = () => {
    const csvContent = "matric,name,department,level\n21/08nus001,John Doe,Nursing Sciences,200L\n21/08mls002,Jane Smith,Medical Laboratory Sciences,300L";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_list_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['matric', 'name', 'department', 'level'];
      
      if (!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error('CSV must contain: matric, name, department, level');
      }

      const students = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });
        return student;
      });

      const { error } = await supabase
        .from('student_list')
        .upsert(students, { onConflict: 'matric' });

      if (error) throw error;

      await logAction({
        action: 'student_upload',
        entity_type: 'student_list',
        details: { count: students.length }
      });

      toast.success(`Successfully uploaded ${students.length} student records`);
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from('student_list')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setStudents(data);
    }
  };

  const departmentStats = students.reduce((acc, student) => {
    const dept = student.department;
    if (!acc[dept]) {
      acc[dept] = { total: 0, levels: {} };
    }
    acc[dept].total++;
    
    const level = student.level || 'Unknown';
    acc[dept].levels[level] = (acc[dept].levels[level] || 0) + 1;
    return acc;
  }, {} as Record<string, { total: number; levels: Record<string, number> }>);

  const departmentChartData = Object.entries(departmentStats).map(([name, data]: [string, { total: number; levels: Record<string, number> }]) => ({
    name: name.replace(' Sciences', '').replace(' and ', ' & '),
    students: data.total,
  }));

  const levelDistribution = students.reduce((acc, student) => {
    const level = student.level || 'Unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const levelChartData = Object.entries(levelDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {students.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Students by Department</CardTitle>
                <CardDescription>Total: {students.length} students</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students by Level</CardTitle>
                <CardDescription>Distribution across all levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={levelChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {levelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Student List Management</CardTitle>
            <CardDescription>Upload and manage student records for voter verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="csv-upload">Upload CSV File</Label>
                <Input
                  id="csv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2 items-end">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                <Button onClick={loadStudents}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {students.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matric</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono">{student.matric}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default StudentList;
