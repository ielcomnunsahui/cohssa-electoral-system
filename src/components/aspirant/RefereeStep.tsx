import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Download, MessageCircle, FileText, Printer, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { generateRefereeFormHTML } from "./RefereeFormTemplate";

interface RefereeStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

const RefereeStep = ({ data = {}, onUpdate }: RefereeStepProps) => {
  const [filePreview, setFilePreview] = useState<string>(data.referee_declaration_url || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        .from('referee-forms')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('referee-forms')
        .getPublicUrl(fileName);

      setFilePreview(publicUrl);
      onUpdate({ ...data, referee_declaration_url: publicUrl });
      toast.success("Referee form uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading referee form:", error);
      toast.error(error.message || "Failed to upload referee form");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadForm = () => {
    const formData = {
      full_name: data.personal?.full_name || data.full_name || '',
      matric: data.personal?.matric || data.matric || '',
      department: data.personal?.department || data.department || '',
      level: data.personal?.level || data.level || '',
      date_of_birth: data.personal?.date_of_birth || data.date_of_birth || '',
      gender: data.personal?.gender || data.gender || '',
      phone: data.personal?.phone || data.phone || '',
      position_name: data.position?.position_name || data.position_name || ''
    };
    
    const htmlContent = generateRefereeFormHTML(formData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISECO_Referee_Form_${formData.matric || 'form'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Form downloaded successfully");
  };

  const handlePrintForm = () => {
    const formData = {
      full_name: data.personal?.full_name || data.full_name || '',
      matric: data.personal?.matric || data.matric || '',
      department: data.personal?.department || data.department || '',
      level: data.personal?.level || data.level || '',
      date_of_birth: data.personal?.date_of_birth || data.date_of_birth || '',
      gender: data.personal?.gender || data.gender || '',
      phone: data.personal?.phone || data.phone || '',
      position_name: data.position?.position_name || data.position_name || ''
    };
    
    const htmlContent = generateRefereeFormHTML(formData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/2347040640646', '_blank');
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          You need to submit a Referee & Declaration form. You can download/print the form below, fill it out, and upload it here OR bring a physical copy to the screening. Upload is optional.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" onClick={handleDownloadForm}>
          <Download className="mr-2 h-4 w-4" />
          Download Form
        </Button>
        <Button variant="outline" onClick={handlePrintForm}>
          <Printer className="mr-2 h-4 w-4" />
          Print Form
        </Button>
        <Button variant="outline" onClick={handleWhatsAppContact}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Get at NUNSA Café
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referee_upload">Upload Completed Form (Optional)</Label>
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
              Form Uploaded
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Form (PDF/JPG/PNG, Max 10MB)
            </>
          )}
        </Button>
        {filePreview && (
          <p className="text-sm text-success">✓ Referee form uploaded successfully</p>
        )}
      </div>

      <Alert>
        <AlertDescription className="text-sm">
          <strong>Note:</strong> Academic transcripts or result slips may be required for verification. Please have them ready for the screening process.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RefereeStep;
