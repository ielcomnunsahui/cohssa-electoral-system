import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, User, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Strict matric regex: XX/XXaaa000 (e.g., 21/08nus014)
const MATRIC_REGEX = /^\d{2}\/\d{2}[A-Za-z]{3}\d{3}$/;

interface PersonalInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

const PersonalInfoStep = ({ data, onUpdate }: PersonalInfoStepProps) => {
  const [photoPreview, setPhotoPreview] = useState<string>(data.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [matricError, setMatricError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP files are allowed");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('aspirant-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('aspirant-photos')
        .getPublicUrl(fileName);

      setPhotoPreview(publicUrl);
      onUpdate({ ...data, photo_url: publicUrl });
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'matric') {
      if (!value) {
        setMatricError(null);
      } else if (!MATRIC_REGEX.test(value)) {
        setMatricError("Invalid format. Use: XX/XXaaa000 (e.g., 21/08nus014)");
      } else {
        setMatricError(null);
      }
    }
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Photo preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo (Max 5MB)
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={data.full_name || ""}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="matric">Matric Number *</Label>
          <Input
            id="matric"
            value={data.matric || ""}
            onChange={(e) => handleChange('matric', e.target.value)}
            placeholder="e.g., 21/08nus014"
            className={matricError ? "border-destructive" : ""}
            required
          />
          {matricError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {matricError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Format: XX/XXaaa000</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select value={data.department || ""} onValueChange={(value) => handleChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nursing Sciences">Nursing Sciences</SelectItem>
              <SelectItem value="Medical Laboratory Sciences">Medical Laboratory Sciences</SelectItem>
              <SelectItem value="Community Medicine and Public Health">Community Medicine and Public Health</SelectItem>
              <SelectItem value="Medicine and Surgery">Medicine and Surgery</SelectItem>
              <SelectItem value="Human Anatomy">Human Anatomy</SelectItem>
              <SelectItem value="Human Physiology">Human Physiology</SelectItem>
              <SelectItem value="Medical Biochemistry">Medical Biochemistry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level *</Label>
          <Select value={data.level || ""} onValueChange={(value) => handleChange('level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100L">100L</SelectItem>
              <SelectItem value="200L">200L</SelectItem>
              <SelectItem value="300L">300L</SelectItem>
              <SelectItem value="400L">400L</SelectItem>
              <SelectItem value="500L">500L</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={data.date_of_birth || ""}
            onChange={(e) => handleChange('date_of_birth', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={data.gender || ""} onValueChange={(value) => handleChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ""}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="e.g., 08012345678"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
