import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "student_upload"
  | "student_add"
  | "student_delete"
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
  | "position_delete"
  | "position_toggle"
  | "timeline_create"
  | "timeline_update"
  | "timeline_toggle"
  | "timeline_delete"
  | "voting_start"
  | "voting_pause"
  | "voting_resume"
  | "results_publish"
  | "voter_register"
  | "voter_vote_cast"
  | "admin_login"
  | "admin_logout"
  | "resource_add"
  | "resource_update"
  | "resource_delete"
  | "event_add"
  | "event_update"
  | "event_delete"
  | "content_add"
  | "content_update"
  | "content_delete";

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