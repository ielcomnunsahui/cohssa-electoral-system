import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PositionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  personalData?: {
    department?: string;
    level?: string;
    gender?: string;
    cgpa?: number;
  };
}

const PositionStep = ({ data = {}, onUpdate, personalData }: PositionStepProps) => {
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [eligibilityErrors, setEligibilityErrors] = useState<string[]>([]);

  useEffect(() => {
    loadPositions();
  }, []);

  // Re-validate selected position when positions load or personalData changes
  useEffect(() => {
    if (positions.length > 0 && data.position_id) {
      const position = positions.find(p => p.id === data.position_id);
      if (position) {
        setSelectedPosition(position);
        const errors = checkEligibility(position);
        setEligibilityErrors(errors);
        // Update position_details with fresh data from database
        if (JSON.stringify(position) !== JSON.stringify(data.position_details)) {
          onUpdate({ ...data, position_details: position });
        }
      }
    }
  }, [positions, data.position_id, personalData]);

  const loadPositions = async () => {
    const { data: positionsData, error } = await supabase
      .from('positions')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('title');

    if (error) {
      toast.error("Failed to load positions");
      return;
    }

    setPositions(positionsData || []);
  };

  const checkEligibility = (position: any): string[] => {
    const errors: string[] = [];
    
    if (!personalData) {
      errors.push("Please complete personal information first");
      return errors;
    }

    // Check CGPA
    if (personalData.cgpa && personalData.cgpa < position.min_cgpa) {
      errors.push(`Minimum CGPA required: ${position.min_cgpa} (Your CGPA: ${personalData.cgpa})`);
    }

    // Check department eligibility
    const eligibleDepartments: string[] = position.eligible_departments || [];
    if (personalData.department && eligibleDepartments.length > 0 && !eligibleDepartments.includes(personalData.department)) {
      errors.push(`Your department (${personalData.department}) is not eligible for this position`);
    }

    // Check level eligibility
    const eligibleLevels: string[] = position.eligible_levels || [];
    if (personalData.level && eligibleLevels.length > 0 && !eligibleLevels.includes(personalData.level)) {
      errors.push(`Your level (${personalData.level}) is not eligible for this position`);
    }

    // Check gender eligibility
    if (position.eligible_gender && personalData.gender && personalData.gender !== position.eligible_gender) {
      errors.push(`This position is only open to ${position.eligible_gender} candidates`);
    }

    return errors;
  };

  const handlePositionChange = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    
    if (!position) return;

    const errors = checkEligibility(position);
    setEligibilityErrors(errors);

    if (errors.length === 0) {
      setSelectedPosition(position);
      onUpdate({ ...data, position_id: positionId, position_details: position });
      toast.success("Position selected successfully");
    } else {
      setSelectedPosition(null);
      onUpdate({ ...data, position_id: null, position_details: null });
      toast.error("You are not eligible for this position");
    }
  };

  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const wordCount = (data.why_running || "").split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {eligibilityErrors.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-destructive mb-2">Eligibility Requirements Not Met:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
              {eligibilityErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="position_id">Select Position *</Label>
        <Select value={data.position_id || ""} onValueChange={handlePositionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a position to apply for" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((position) => (
              <SelectItem key={position.id} value={position.id}>
                {position.position_name || position.title} - ₦{(position.fee || 0).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPosition && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPosition.position_name || selectedPosition.title}</CardTitle>
            <CardDescription>Position Requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application Fee:</span>
              <span className="font-semibold">₦{(selectedPosition.fee || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum CGPA:</span>
              <span className="font-semibold">{selectedPosition.min_cgpa || 2.0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eligible Levels:</span>
              <span className="font-semibold">{(selectedPosition.eligible_levels || []).join(', ') || 'All'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eligible Departments:</span>
              <span className="font-semibold">{(selectedPosition.eligible_departments || []).join(', ') || 'All'}</span>
            </div>
            {selectedPosition.eligible_gender && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender Requirement:</span>
                <span className="font-semibold capitalize">{selectedPosition.eligible_gender}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="why_running">Why are you running for this position? *</Label>
        <Textarea
          id="why_running"
          value={data.why_running || ""}
          onChange={(e) => handleChange('why_running', e.target.value)}
          placeholder="Explain your motivation and vision... (50-200 words)"
          rows={6}
          required
        />
        <p className={`text-sm ${wordCount < 50 ? 'text-warning' : wordCount > 200 ? 'text-destructive' : 'text-success'}`}>
          Word count: {wordCount} {wordCount < 50 && '(minimum 50)'} {wordCount > 200 && '(maximum 200)'}
        </p>
      </div>
    </div>
  );
};

export default PositionStep;
