import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(var(--secondary))', 'hsl(var(--destructive))'];

const DEPARTMENTS = [
  "Library and Information Science",
  "Environmental Health",
  "Health Information Management",
  "Office Technology Management",
  "Mass Communication"
];

const LEVELS = ["100", "200", "300", "400"];

const StudentList = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    matric_number: "",
    name: "",
    department: "",
    level: "",
    email: "",
    phone: ""
  });
  const { logAction } = useAuditLog();

  useEffect(() => {
    loadStudents();
  }, []);

  const downloadTemplate = () => {
    const csvContent = "matric_number,name,department,level,email,phone\n21/08LIS001,John Doe,Library and Information Science,200,john@example.com,08012345678\n21/08EVH002,Jane Smith,Environmental Health,300,jane@example.com,08087654321";
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
      const requiredHeaders = ['matric_number', 'name', 'department', 'level'];
      
      if (!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error('CSV must contain: matric_number, name, department, level');
      }

      const studentsData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });
        return student;
      });

      const { error } = await supabase
        .from('students')
        .upsert(studentsData, { onConflict: 'matric_number' });

      if (error) throw error;

      await logAction({
        action: 'student_upload',
        entity_type: 'students',
        details: { count: studentsData.length }
      });

      toast.success(`Successfully uploaded ${studentsData.length} student records`);
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
      .from('students')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setStudents(data);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.matric_number || !newStudent.name || !newStudent.department || !newStudent.level) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('students')
        .insert(newStudent);

      if (error) throw error;

      await logAction({
        action: 'student_add',
        entity_type: 'students',
        details: { matric_number: newStudent.matric_number, name: newStudent.name }
      });

      toast.success("Student added successfully");
      setIsDialogOpen(false);
      setNewStudent({ matric_number: "", name: "", department: "", level: "", email: "", phone: "" });
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to add student");
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Delete student ${name}?`)) return;

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      toast.success("Student deleted");
      loadStudents();
    } catch (error: any) {
      toast.error("Failed to delete student");
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
    name: name.replace(' Sciences', '').replace(' and ', ' & ').substring(0, 15),
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
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={10} />
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
              <div className="flex gap-2 items-end flex-wrap">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>Enter student details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Matric Number *</Label>
                        <Input 
                          value={newStudent.matric_number} 
                          onChange={(e) => setNewStudent({...newStudent, matric_number: e.target.value})}
                          placeholder="e.g., 21/08LIS001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input 
                          value={newStudent.name} 
                          onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Department *</Label>
                        <Select value={newStudent.department} onValueChange={(v) => setNewStudent({...newStudent, department: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Level *</Label>
                        <Select value={newStudent.level} onValueChange={(v) => setNewStudent({...newStudent, level: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                            type="email"
                            value={newStudent.email} 
                            onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input 
                            value={newStudent.phone} 
                            onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddStudent}>Add Student</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={loadStudents} variant="outline">
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono">{student.matric_number}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
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