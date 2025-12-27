import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface AcademicStepProps {
  data: any;
  onUpdate: (data: any) => void;
  positionData: any;
}

const AcademicStep = ({ data = {}, onUpdate, positionData }: AcademicStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const cgpa = parseFloat(data.cgpa) || 0;
  const minCgpa = positionData?.position_details?.min_cgpa || 0;
  const meetsRequirement = cgpa >= minCgpa;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cgpa">Cumulative Grade Point Average (CGPA) *</Label>
        <Input
          id="cgpa"
          type="number"
          step="0.01"
          min="2.00"
          max="5.00"
          value={data.cgpa || ""}
          onChange={(e) => handleChange('cgpa', e.target.value)}
          placeholder="e.g., 4.25"
          required
        />
        <p className="text-sm text-muted-foreground">
          Enter your CGPA (2.00 - 5.00, 2 decimal places)
        </p>
      </div>

      {cgpa > 0 && minCgpa > 0 && (
        <Alert variant={meetsRequirement ? "default" : "destructive"}>
          {meetsRequirement ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your CGPA of {cgpa.toFixed(2)} meets the minimum requirement of {minCgpa.toFixed(2)} for this position.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your CGPA of {cgpa.toFixed(2)} does not meet the minimum requirement of {minCgpa.toFixed(2)} for this position. Please select a different position or verify your CGPA.
              </AlertDescription>
            </>
          )}
        </Alert>
      )}
    </div>
  );
};

export default AcademicStep;
