import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminTour } from "@/hooks/useAdminTour";
import { 
  Plus, Edit, Trash2, Loader2, Users, Crown, Scale, GraduationCap, 
  Building, Upload, Save, Image as ImageIcon
} from "lucide-react";

const ContentManagement = () => {
  const { startTour } = useAdminTour();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("leaders");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Data states
  const [leaders, setLeaders] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [senate, setSenate] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [leadersRes, execRes, senateRes, alumniRes] = await Promise.all([
        supabase.from('university_leaders').select('*').order('display_order'),
        supabase.from('cohssa_executives').select('*').order('display_order'),
        supabase.from('cohssa_senate').select('*').order('display_order'),
        supabase.from('cohssa_alumni').select('*').order('administration_number')
      ]);

      if (leadersRes.data) setLeaders(leadersRes.data);
      if (execRes.data) setExecutives(execRes.data);
      if (senateRes.data) setSenate(senateRes.data);
      if (alumniRes.data) setAlumni(alumniRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type: string) => {
    setEditingItem(null);
    setFormData(getDefaultFormData(type));
    setPreviewUrl(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setPreviewUrl(item.photo_url || null);
    setDialogOpen(true);
  };

  const getDefaultFormData = (type: string) => {
    switch (type) {
      case 'leaders':
        return { name: '', position: '', faculty: '', photo_url: '', display_order: 0 };
      case 'executives':
        return { name: '', position: '', department: '', level: '', phone: '', email: '', photo_url: '', display_order: 0 };
      case 'senate':
        return { name: '', position: '', department: '', level: '', phone: '', email: '', photo_url: '', display_order: 0 };
      case 'alumni':
        return { name: '', position: '', department: '', graduation_year: '', current_workplace: '', phone: '', email: '', photo_url: '', administration_number: 1 };
      default:
        return {};
    }
  };

  const getTableName = (type: string) => {
    switch (type) {
      case 'leaders': return 'university_leaders';
      case 'executives': return 'cohssa_executives';
      case 'senate': return 'cohssa_senate';
      case 'alumni': return 'cohssa_alumni';
      default: return 'university_leaders';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Create a data URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // For now, use the data URL as the photo_url
      // In production, you'd upload to Supabase Storage
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      setFormData((prev: any) => ({ ...prev, photo_url: dataUrl }));
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.position) {
      toast.error("Name and position are required");
      return;
    }

    setSaving(true);
    try {
      const tableName = getTableName(activeTab) as any;
      
      if (editingItem) {
        const { error } = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("Updated successfully");
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert(formData);
        if (error) throw error;
        toast.success("Added successfully");
      }
      
      setDialogOpen(false);
      setPreviewUrl(null);
      fetchAllData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const tableName = getTableName(activeTab) as any;
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      toast.success("Deleted successfully");
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <AdminLayout onStartTour={startTour}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onStartTour={startTour}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage university leaders, executives, senate, and alumni profiles</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
            <TabsTrigger value="leaders" className="gap-2">
              <Building className="h-4 w-4" />
              Leaders
            </TabsTrigger>
            <TabsTrigger value="executives" className="gap-2">
              <Crown className="h-4 w-4" />
              Executives
            </TabsTrigger>
            <TabsTrigger value="senate" className="gap-2">
              <Scale className="h-4 w-4" />
              Senate
            </TabsTrigger>
            <TabsTrigger value="alumni" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Alumni
            </TabsTrigger>
          </TabsList>

          {/* University Leaders */}
          <TabsContent value="leaders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>University Leaders</CardTitle>
                  <CardDescription>Vice Chancellor, Deans, and other university leaders</CardDescription>
                </div>
                <Button onClick={() => handleAdd('leaders')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Leader
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders.map((leader) => (
                      <TableRow key={leader.id}>
                        <TableCell>
                          {leader.photo_url ? (
                            <img src={leader.photo_url} alt={leader.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{leader.name}</TableCell>
                        <TableCell>{leader.position}</TableCell>
                        <TableCell>{leader.faculty || '-'}</TableCell>
                        <TableCell>{leader.display_order}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(leader)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(leader.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {leaders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No leaders added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Executives */}
          <TabsContent value="executives">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>COHSSA Executives</CardTitle>
                  <CardDescription>16-member executive council</CardDescription>
                </div>
                <Button onClick={() => handleAdd('executives')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Executive
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executives.map((exec) => (
                      <TableRow key={exec.id}>
                        <TableCell>
                          {exec.photo_url ? (
                            <img src={exec.photo_url} alt={exec.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{exec.name}</TableCell>
                        <TableCell>{exec.position}</TableCell>
                        <TableCell>{exec.department || '-'}</TableCell>
                        <TableCell>{exec.level || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(exec)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(exec.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {executives.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No executives added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Senate */}
          <TabsContent value="senate">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>COHSSA Senate</CardTitle>
                  <CardDescription>10-member legislative body</CardDescription>
                </div>
                <Button onClick={() => handleAdd('senate')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Senator
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {senate.map((senator) => (
                      <TableRow key={senator.id}>
                        <TableCell>
                          {senator.photo_url ? (
                            <img src={senator.photo_url} alt={senator.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{senator.name}</TableCell>
                        <TableCell>{senator.position}</TableCell>
                        <TableCell>{senator.department || '-'}</TableCell>
                        <TableCell>{senator.level || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(senator)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(senator.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {senate.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No senators added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alumni */}
          <TabsContent value="alumni">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>COHSSA Alumni</CardTitle>
                  <CardDescription>Past presidents and senate leaders</CardDescription>
                </div>
                <Button onClick={() => handleAdd('alumni')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Alumni
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Administration</TableHead>
                      <TableHead>Graduation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alumni.map((alum) => (
                      <TableRow key={alum.id}>
                        <TableCell>
                          {alum.photo_url ? (
                            <img src={alum.photo_url} alt={alum.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{alum.name}</TableCell>
                        <TableCell>{alum.position}</TableCell>
                        <TableCell><Badge>{alum.administration_number}th Admin</Badge></TableCell>
                        <TableCell>{alum.graduation_year || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(alum)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(alum.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {alumni.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No alumni added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} {activeTab === 'leaders' ? 'Leader' : activeTab === 'executives' ? 'Executive' : activeTab === 'senate' ? 'Senator' : 'Alumni'}</DialogTitle>
              <DialogDescription>Fill in the details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Photo Upload Section */}
              <div className="space-y-3">
                <Label>Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full gap-2"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">Max 5MB, JPG/PNG</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Or enter URL</Label>
                  <Input
                    value={formData.photo_url || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, photo_url: e.target.value });
                      setPreviewUrl(e.target.value || null);
                    }}
                    placeholder="https://..."
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position *</Label>
                  <Input
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., President, Dean"
                  />
                </div>
                {activeTab === 'leaders' && (
                  <div className="space-y-2">
                    <Label>Faculty</Label>
                    <Input
                      value={formData.faculty || ''}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      placeholder="e.g., Health Sciences"
                    />
                  </div>
                )}
                {(activeTab === 'executives' || activeTab === 'senate') && (
                  <>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g., Nursing Sciences"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Input
                        value={formData.level || ''}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        placeholder="e.g., 400L"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email address"
                      />
                    </div>
                  </>
                )}
                {activeTab === 'alumni' && (
                  <>
                    <div className="space-y-2">
                      <Label>Administration Number</Label>
                      <Input
                        type="number"
                        value={formData.administration_number || 1}
                        onChange={(e) => setFormData({ ...formData, administration_number: parseInt(e.target.value) })}
                        placeholder="e.g., 1, 2, 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Department"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Graduation Year</Label>
                      <Input
                        value={formData.graduation_year || ''}
                        onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                        placeholder="e.g., 2023"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Workplace</Label>
                      <Input
                        value={formData.current_workplace || ''}
                        onChange={(e) => setFormData({ ...formData, current_workplace: e.target.value })}
                        placeholder="Current organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email address"
                      />
                    </div>
                  </>
                )}
                {activeTab !== 'alumni' && (
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;
