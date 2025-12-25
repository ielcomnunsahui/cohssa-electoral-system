import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Award, Camera, X, User, GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Library and Information Science",
  "Environmental Health",
  "Health Information Management",
  "Office Technology Management",
  "Mass Communication"
];

interface CandidateFormProps {
  name: string;
  setName: (value: string) => void;
  matric: string;
  setMatric: (value: string) => void;
  positionId: string;
  setPositionId: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  manifesto: string;
  setManifesto: (value: string) => void;
  photoPreview: string;
  setPhotoPreview: (value: string) => void;
  formTab: string;
  setFormTab: (value: string) => void;
  positions: any[];
  isEdit?: boolean;
}

export const CandidateForm = ({
  name,
  setName,
  matric,
  setMatric,
  positionId,
  setPositionId,
  department,
  setDepartment,
  manifesto,
  setManifesto,
  photoPreview,
  setPhotoPreview,
  formTab,
  setFormTab,
  positions,
  isEdit = false
}: CandidateFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBasicInfoComplete = name.trim() !== "" && matric.trim() !== "";
  const isPositionComplete = positionId !== "" && department !== "";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="py-4">
      <Tabs value={formTab} onValueChange={setFormTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Basic Info</span>
            {isBasicInfoComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="position" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Position</span>
            {isPositionComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="manifesto" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Manifesto</span>
            {manifesto.trim() !== "" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6 mt-0">
          <Alert className="border-primary/30 bg-primary/5">
            <User className="h-4 w-4" />
            <AlertDescription>
              Enter the candidate's personal information and upload their photo.
            </AlertDescription>
          </Alert>

          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/30 rounded-lg border">
            <div className="relative">
              {photoPreview ? (
                <div className="relative group">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-md" 
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview("")}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: Square image, max 2MB
              </p>
            </div>
          </div>

          {/* Name and Matric */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter candidate's full name"
                className="h-11"
              />
              {!name.trim() && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Required field
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Matric Number <span className="text-destructive">*</span>
              </Label>
              <Input 
                value={matric} 
                onChange={(e) => setMatric(e.target.value)} 
                placeholder="e.g., 21/08NUS014"
                className="h-11 font-mono"
              />
              {!matric.trim() && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Required field
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={() => setFormTab("position")}
              disabled={!isBasicInfoComplete}
              className="gap-2"
            >
              Next: Position
              <GraduationCap className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Position Tab */}
        <TabsContent value="position" className="space-y-6 mt-0">
          <Alert className="border-primary/30 bg-primary/5">
            <Award className="h-4 w-4" />
            <AlertDescription>
              Select the position the candidate is contesting for and their department.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Contesting Position <span className="text-destructive">*</span>
              </Label>
              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select position to contest" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {positions.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No active positions available
                    </div>
                  ) : (
                    positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          {pos.title}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Department <span className="text-destructive">*</span>
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select candidate's department" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormTab("basic")}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Back
            </Button>
            <Button 
              type="button" 
              onClick={() => setFormTab("manifesto")}
              disabled={!isPositionComplete}
              className="gap-2"
            >
              Next: Manifesto
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Manifesto Tab */}
        <TabsContent value="manifesto" className="space-y-6 mt-0">
          <Alert className="border-primary/30 bg-primary/5">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Enter the candidate's manifesto, campaign promises, and vision. This is optional but recommended.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Campaign Manifesto
            </Label>
            <Textarea 
              value={manifesto} 
              onChange={(e) => setManifesto(e.target.value)}
              placeholder="Enter the candidate's manifesto, goals, vision, and what they plan to achieve if elected...

Example:
• My vision for the association
• Key objectives and goals
• Specific projects and initiatives
• How I plan to improve student welfare"
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {manifesto.length} characters • A well-written manifesto helps voters make informed decisions.
            </p>
          </div>

          {/* Summary Card */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Candidate Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Name:</div>
              <div className="font-medium">{name || "-"}</div>
              <div className="text-muted-foreground">Matric:</div>
              <div className="font-mono">{matric || "-"}</div>
              <div className="text-muted-foreground">Position:</div>
              <div>{positions.find(p => p.id === positionId)?.title || "-"}</div>
              <div className="text-muted-foreground">Department:</div>
              <div>{department || "-"}</div>
              <div className="text-muted-foreground">Photo:</div>
              <div>{photoPreview ? "✓ Uploaded" : "Not uploaded"}</div>
              <div className="text-muted-foreground">Manifesto:</div>
              <div>{manifesto ? `${manifesto.length} chars` : "Not provided"}</div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormTab("position")}
              className="gap-2"
            >
              <Award className="h-4 w-4" />
              Back
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
