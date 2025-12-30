import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, Crown, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  department: string | null;
  level: string | null;
  photo_url: string | null;
  is_staff_adviser: boolean;
  display_order: number;
  email: string | null;
  phone: string | null;
}

const ElectoralCommitteeManagement = () => {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [uploading, setUploading] = useState(false);
  const { logAction } = useAuditLog();

  const [form, setForm] = useState({
    name: "",
    position: "",
    department: "",
    level: "",
    photo_url: "",
    is_staff_adviser: false,
    display_order: 0,
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("electoral_committee")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      position: "",
      department: "",
      level: "",
      photo_url: "",
      is_staff_adviser: false,
      display_order: members.length + 1,
      email: "",
      phone: "",
    });
    setEditingMember(null);
  };

  const openEdit = (member: CommitteeMember) => {
    setEditingMember(member);
    setForm({
      name: member.name || "",
      position: member.position || "",
      department: member.department || "",
      level: member.level || "",
      photo_url: member.photo_url || "",
      is_staff_adviser: member.is_staff_adviser || false,
      display_order: member.display_order || 0,
      email: member.email || "",
      phone: member.phone || "",
    });
    setDialogOpen(true);
  };

  const openAdd = () => {
    resetForm();
    setForm((prev) => ({ ...prev, display_order: members.length + 1 }));
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `committee-${Date.now()}.${fileExt}`;
      const filePath = `electoral-committee/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("aspirant-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("aspirant-photos")
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, photo_url: publicUrl.publicUrl }));
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.position) {
      toast.error("Name and position are required");
      return;
    }

    try {
      const memberData = {
        name: form.name,
        position: form.position,
        department: form.department || null,
        level: form.level || null,
        photo_url: form.photo_url || null,
        is_staff_adviser: form.is_staff_adviser,
        display_order: form.display_order,
        email: form.email || null,
        phone: form.phone || null,
      };

      if (editingMember) {
        const { error } = await supabase
          .from("electoral_committee")
          .update(memberData)
          .eq("id", editingMember.id);

        if (error) throw error;

        await logAction({
          action: "committee_member_update",
          entity_type: "electoral_committee",
          entity_id: editingMember.id,
          details: { name: form.name, position: form.position },
        });

        toast.success("Member updated successfully");
      } else {
        const { error } = await supabase
          .from("electoral_committee")
          .insert(memberData);

        if (error) throw error;

        await logAction({
          action: "committee_member_create",
          entity_type: "electoral_committee",
          details: { name: form.name, position: form.position },
        });

        toast.success("Member added successfully");
      }

      setDialogOpen(false);
      resetForm();
      loadMembers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from("electoral_committee")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await logAction({
        action: "committee_member_delete",
        entity_type: "electoral_committee",
        entity_id: id,
        details: { name },
      });

      toast.success("Member deleted successfully");
      loadMembers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const staffAdvisers = members.filter((m) => m.is_staff_adviser);
  const committeeMembers = members.filter((m) => !m.is_staff_adviser);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Electoral Committee
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage electoral committee members and staff advisers
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Edit Member" : "Add New Member"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {form.photo_url ? (
                      <img
                        src={form.photo_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label>Photo</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="text-sm"
                      />
                    </div>
                    {uploading && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={form.position}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, position: e.target.value }))
                      }
                      placeholder="e.g., Chairman, Secretary"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_staff_adviser"
                      checked={form.is_staff_adviser}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, is_staff_adviser: checked }))
                      }
                    />
                    <Label htmlFor="is_staff_adviser">Staff Adviser</Label>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={form.department}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, department: e.target.value }))
                      }
                      placeholder="e.g., Department of Anatomy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Input
                      id="level"
                      value={form.level}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, level: e.target.value }))
                      }
                      placeholder="e.g., 400L Human Anatomy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+234..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={form.display_order}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          display_order: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={uploading}>
                    {editingMember ? "Save Changes" : "Add Member"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-3xl font-bold">{members.length}</p>
                </div>
                <Users className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Staff Advisers</p>
                  <p className="text-3xl font-bold">{staffAdvisers.length}</p>
                </div>
                <Crown className="h-10 w-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Committee Members</p>
                  <p className="text-3xl font-bold">{committeeMembers.length}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Advisers Section */}
        {staffAdvisers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Staff Advisers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffAdvisers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Users className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{member.position}</Badge>
                      </TableCell>
                      <TableCell>{member.department || "-"}</TableCell>
                      <TableCell>{member.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(member.id, member.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Committee Members Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Committee Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : committeeMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No committee members added yet.</p>
                <Button className="mt-4" onClick={openAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {committeeMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Users className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.position}</Badge>
                      </TableCell>
                      <TableCell>{member.level || "-"}</TableCell>
                      <TableCell>{member.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(member.id, member.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ElectoralCommitteeManagement;
