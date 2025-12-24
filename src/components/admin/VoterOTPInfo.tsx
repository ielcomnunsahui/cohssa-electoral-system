import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Key, Search, Copy, RefreshCw, Clock, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface OTPCode {
  id: string;
  email: string;
  code: string;
  type: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

const VoterOTPInfo = () => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: otpCodes, isLoading, refetch } = useQuery({
    queryKey: ["admin-otp-codes"],
    queryFn: async () => {
      // Using service role through RPC or direct query with admin privileges
      const { data, error } = await supabase
        .from("otp_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("OTP fetch error:", error);
        throw error;
      }
      return data as OTPCode[];
    },
    enabled: isOpen,
  });

  const filteredCodes = otpCodes?.filter((otp) =>
    otp.email?.toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const copyCode = async (code: string, email: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`OTP code copied for ${email}`);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const shareViaWhatsApp = (code: string, email: string) => {
    const message = encodeURIComponent(
      `Your ISECO voter login code is: ${code}\n\nThis code expires in 5 minutes. Do not share this code with anyone.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const getStatusBadge = (otp: OTPCode) => {
    if (otp.used) {
      return <Badge variant="secondary">Used</Badge>;
    }
    if (isExpired(otp.expires_at)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Key className="h-4 w-4" />
          View OTP Codes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Voter OTP Codes
          </DialogTitle>
          <DialogDescription>
            View and share OTP codes when email delivery fails. Use responsibly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Warning */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="py-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Security Notice
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Only share codes with verified voters who cannot receive emails. 
                    Verify voter identity before sharing any OTP code.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Refresh */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* OTP Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading OTP codes...
                    </TableCell>
                  </TableRow>
                ) : filteredCodes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No OTP codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes?.map((otp) => (
                    <TableRow key={otp.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {otp.email}
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-lg font-bold tracking-widest">
                          {otp.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{otp.type || "verification"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(otp)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(otp.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {isExpired(otp.expires_at) ? (
                          <span className="text-destructive text-sm">Expired</span>
                        ) : (
                          <span className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(otp.expires_at))}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(otp.code, otp.email)}
                            disabled={otp.used || isExpired(otp.expires_at)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareViaWhatsApp(otp.code, otp.email)}
                            disabled={otp.used || isExpired(otp.expires_at)}
                            className="text-green-600"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Stats */}
          {otpCodes && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Active: {otpCodes.filter(o => !o.used && !isExpired(o.expires_at)).length}
              </span>
              <span>Used: {otpCodes.filter(o => o.used).length}</span>
              <span>Expired: {otpCodes.filter(o => isExpired(o.expires_at) && !o.used).length}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoterOTPInfo;
