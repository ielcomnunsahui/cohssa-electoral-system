import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LeadershipStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

const LeadershipStep = ({ data, onUpdate }: LeadershipStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const wordCount = (data.leadership_history || "").split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="leadership_history">Leadership History *</Label>
        <Textarea
          id="leadership_history"
          value={data.leadership_history || ""}
          onChange={(e) => handleChange('leadership_history', e.target.value)}
          placeholder="Describe your previous leadership roles, responsibilities, and achievements... (minimum 50 words)"
          rows={8}
          required
        />
        <p className={`text-sm ${wordCount < 50 ? 'text-warning' : 'text-success'}`}>
          Word count: {wordCount} {wordCount < 50 && '(minimum 50 required)'}
        </p>
      </div>
    </div>
  );
};

export default LeadershipStep;
