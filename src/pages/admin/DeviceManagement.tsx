import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Smartphone, RefreshCw, Trash2, AlertTriangle, Shield, Users, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { RegistrationAnalytics, processRegistrationData } from "@/components/admin/RegistrationAnalytics";

interface VoterWithDevice {
  id: string;
  matric_number: string;
  name: string;
  email: string | null;
  department: string;
  device_fingerprint: string | null;
  has_voted: boolean;
  verified: boolean;
  created_at: string | null;
}

const DeviceManagement = () => {
  const [search, setSearch] = useState("");
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkClearing, setBulkClearing] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  const { data: voters, isLoading, refetch } = useQuery({
    queryKey: ["admin-voters-devices"],
    queryFn: async () => {
      // Use raw query to include device_fingerprint column that may not be in generated types yet
      const { data, error } = await supabase
        .from("voters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as VoterWithDevice[]) || [];
    },
  });

  const votersWithDevices = voters?.filter(v => v.device_fingerprint) || [];
  const votersWithoutDevices = voters?.filter(v => !v.device_fingerprint) || [];

  const filteredVoters = votersWithDevices.filter((voter) => {
    const matchesSearch =
      voter.matric_number?.toLowerCase().includes(search.toLowerCase()) ||
      voter.name?.toLowerCase().includes(search.toLowerCase()) ||
      voter.email?.toLowerCase().includes(search.toLowerCase()) ||
      voter.device_fingerprint?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: voters?.length || 0,
    withDevice: votersWithDevices.length,
    withoutDevice: votersWithoutDevices.length,
    filtered: filteredVoters.length,
  };

  // Process analytics data
  const analyticsData = useMemo(() => {
    if (!voters) return { registrationsByDate: [], registrationsByDevice: [], registrationsByDepartment: [] };
    return processRegistrationData(voters);
  }, [voters]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredVoters.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVoters.map(v => v.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkClear = async () => {
    if (selectedIds.size === 0) return;
    
    setBulkClearing(true);
    try {
      const { data, error } = await supabase.rpc("admin_bulk_clear_fingerprints", {
        p_voter_ids: Array.from(selectedIds),
      });

      if (error) {
        console.error("Bulk clear error:", error);
        toast.error("Failed to clear device fingerprints");
      } else {
        toast.success(`Successfully cleared ${data} device fingerprint(s)`);
        setSelectedIds(new Set());
        refetch();
      }
    } catch (error) {
      console.error("Bulk clear error:", error);
      toast.error("Failed to clear device fingerprints");
    } finally {
      setBulkClearing(false);
      setShowBulkDialog(false);
    }
  };

  const handleClearFingerprint = async (voterId: string) => {
    setClearingId(voterId);
    try {
      const { error } = await supabase.rpc("admin_clear_device_fingerprint", {
        p_voter_id: voterId,
      });

      if (error) {
        console.error("Clear fingerprint error:", error);
        toast.error("Failed to clear device fingerprint");
      } else {
        toast.success("Device fingerprint cleared successfully. Voter can re-register on a new device.");
        refetch();
      }
    } catch (error) {
      console.error("Clear fingerprint error:", error);
      toast.error("Failed to clear device fingerprint");
    } finally {
      setClearingId(null);
    }
  };

  const truncateFingerprint = (fp: string | null) => {
    if (!fp) return "-";
    return fp.length > 16 ? `${fp.substring(0, 8)}...${fp.substring(fp.length - 8)}` : fp;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Device Management</h1>
            <p className="text-muted-foreground">
              View and manage registered device fingerprints for one-phone-one-vote enforcement
            </p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={bulkClearing}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Selected ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear {selectedIds.size} Device Fingerprints?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will allow these {selectedIds.size} voter(s) to register again on different devices.
                      Only do this for legitimate re-registration requests.
                      <br /><br />
                      <strong className="text-destructive">Warning:</strong> Misuse can compromise election integrity.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkClear}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={bulkClearing}
                    >
                      {bulkClearing ? "Clearing..." : "Clear All Selected"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">With Device ID</CardTitle>
              <Smartphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.withDevice}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0
                  ? `${((stats.withDevice / stats.total) * 100).toFixed(1)}%`
                  : "0%"}{" "}
                of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Without Device ID</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.withoutDevice}</div>
              <p className="text-xs text-muted-foreground">
                Legacy or cleared registrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.filtered}</div>
              <p className="text-xs text-muted-foreground">
                matching current filters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg text-amber-800 dark:text-amber-200">One Phone, One Vote Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Device fingerprints prevent voters from registering multiple accounts on the same device. 
              Only clear a fingerprint when a legitimate voter needs to re-register (e.g., lost phone, device change).
              Misuse of this feature can compromise election integrity.
            </CardDescription>
          </CardContent>
        </Card>

        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="devices" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by matric, name, email, or device ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Devices Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Devices ({stats.withDevice})</CardTitle>
                    <CardDescription>
                      Voters with device fingerprints for one-phone-one-vote enforcement
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedIds.size === filteredVoters.length && filteredVoters.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Matric Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Device Fingerprint</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            Loading devices...
                          </TableCell>
                        </TableRow>
                      ) : filteredVoters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            {search ? "No devices matching search" : "No devices registered yet"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVoters.map((voter) => (
                          <TableRow key={voter.id} className={selectedIds.has(voter.id) ? "bg-muted/50" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(voter.id)}
                                onCheckedChange={() => toggleSelect(voter.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono font-medium">
                              {voter.matric_number}
                            </TableCell>
                            <TableCell>{voter.name}</TableCell>
                            <TableCell>{voter.department}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {truncateFingerprint(voter.device_fingerprint)}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant={voter.verified ? "default" : "secondary"}
                                  className={voter.verified ? "bg-green-100 text-green-800 hover:bg-green-100 w-fit" : "w-fit"}
                                >
                                  {voter.verified ? "Verified" : "Unverified"}
                                </Badge>
                                {voter.has_voted && (
                                  <Badge variant="outline" className="bg-primary/10 text-primary w-fit">
                                    Voted
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {voter.created_at
                                ? format(new Date(voter.created_at), "MMM d, yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    disabled={clearingId === voter.id}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Clear
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Clear Device Fingerprint?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will allow the voter <strong>{voter.name}</strong> ({voter.matric_number}) 
                                      to register again on a different device. Only do this for legitimate 
                                      re-registration requests (e.g., lost phone, device replacement).
                                      <br /><br />
                                      <strong className="text-destructive">Warning:</strong> Misuse can compromise 
                                      election integrity.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleClearFingerprint(voter.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Clear Fingerprint
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <RegistrationAnalytics {...analyticsData} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DeviceManagement;
