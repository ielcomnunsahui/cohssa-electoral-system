import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AuditAction =
  | "student_upload"
  | "aspirant_review"
  | "payment_verify"
  | "screening_schedule"
  | "screening_complete"
  | "promote_candidate"
  | "disqualify_aspirant"
  | "candidate_add"
  | "candidate_edit"
  | "candidate_delete"
  | "position_create"
  | "position_update"
  | "position_toggle"
  | "timeline_create"
  | "timeline_update"
  | "timeline_toggle"
  | "voting_start"
  | "voting_pause"
  | "voting_resume"
  | "results_publish"
  | "voter_register"
  | "voter_vote_cast"
  | "admin_login"
  | "admin_logout";

interface AuditLogData {
  action: AuditAction;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
}

export const useAuditLog = () => {
  const logAction = async (data: AuditLogData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.functions.invoke("audit-log", {
        body: {
          user_id: user.id,
          action: data.action,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          details: data.details,
          ip_address: data.ip_address || null,
        },
      });

      if (error) {
        console.error("Audit log error:", error);
      }
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  };

  return { logAction };
};
