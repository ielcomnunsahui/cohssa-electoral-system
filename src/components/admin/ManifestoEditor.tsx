import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FileEdit, Eye, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ManifestoEditorProps {
  applicationId: string;
  initialManifesto: string;
  candidateName: string;
}

export const ManifestoEditor = ({
  applicationId,
  initialManifesto,
  candidateName,
}: ManifestoEditorProps) => {
  const [manifesto, setManifesto] = useState(initialManifesto);
  const [saving, setSaving] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    loadCandidateId();
  }, [applicationId]);

  const loadCandidateId = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error) throw error;
      if (data) setCandidateId(data.id);
    } catch (error) {
      console.error('Error loading candidate:', error);
    }
  };

  const handleSave = async () => {
    if (!candidateId) {
      toast.error('Candidate not found');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ manifesto })
        .eq('id', candidateId);

      if (error) throw error;
      toast.success('Manifesto updated successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save manifesto');
    } finally {
      setSaving(false);
    }
  };

  if (!candidateId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Manifesto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This aspirant has not been promoted to candidate yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          Candidate Manifesto
        </CardTitle>
        <CardDescription>
          Edit the manifesto for {candidateName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit">
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div className="space-y-2">
              <Label>Manifesto Content</Label>
              <Textarea
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                rows={12}
                placeholder="Enter the candidate's manifesto..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {manifesto.length} characters
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Manifesto'}
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="min-h-[300px] p-6 bg-muted rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">
                {candidateName}'s Manifesto
              </h3>
              <div className="prose prose-sm max-w-none">
                {manifesto.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
