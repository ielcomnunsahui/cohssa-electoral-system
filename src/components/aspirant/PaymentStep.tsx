import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

const PaymentStep = ({ data = {}, onUpdate }: PaymentStepProps) => {
  const [filePreview, setFilePreview] = useState<string>(data.payment_proof_url || "");
  const [uploading, setUploading] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPaymentInstructions();
  }, []);

  const loadPaymentInstructions = async () => {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'payment_instructions')
      .single();

    if (!error && settings) {
      setPaymentInstructions(settings.setting_value);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB");
      return;
    }

    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      setFilePreview(publicUrl);
      onUpdate({ ...data, payment_proof_url: publicUrl });
      toast.success("Payment proof uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading payment proof:", error);
      toast.error(error.message || "Failed to upload payment proof");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
          <CardDescription>Transfer the application fee to the account below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {paymentInstructions ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-semibold">{paymentInstructions.account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-semibold">{paymentInstructions.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-semibold">{paymentInstructions.account_name}</span>
              </div>
              {paymentInstructions.treasurer_contact && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Treasurer Contact:</span>
                  <span className="font-semibold">{paymentInstructions.treasurer_contact}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-semibold">7081795658</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-semibold">OPAY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-semibold">Awwal Abubakar Sadik</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          After making the payment, take a screenshot or photo of your payment receipt and upload it below.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="payment_upload">Upload Payment Proof *</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/jpeg,image/png,image/jpg"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : filePreview ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Payment Proof Uploaded
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt (PDF/JPG/PNG, Max 10MB)
            </>
          )}
        </Button>
        {filePreview && (
          <p className="text-sm text-success">✓ Payment proof uploaded successfully</p>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
