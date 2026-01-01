import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  authorName: string;
  contentTitle: string;
  contentType: string;
  status: 'published' | 'rejected';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, authorName, contentTitle, contentType, status }: NotificationRequest = await req.json();

    console.log("Sending editorial notification to:", email, "for content:", contentTitle);

    if (!email || !contentTitle) {
      throw new Error("Missing required fields: email and contentTitle");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const isPublished = status === 'published';
    const subject = isPublished 
      ? `🎉 Your ${contentType} has been published!`
      : `Update on your ${contentType} submission`;

    const statusColor = isPublished ? '#10B981' : '#EF4444';
    const statusText = isPublished ? 'Published' : 'Rejected';
    const statusMessage = isPublished
      ? 'Congratulations! Your content has been reviewed and approved by our editorial team. It is now live and visible to all COHSSA members.'
      : 'Unfortunately, your content submission did not meet our editorial guidelines. Please review the requirements and feel free to submit again.';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">COHSSA Editorial</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Content Review Notification</p>
            </div>
            
            <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #374151; font-size: 16px; margin: 0 0 16px 0;">
                Dear ${authorName || 'Author'},
              </p>
              
              <div style="background: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <p style="margin: 0; color: ${statusColor}; font-weight: 600; font-size: 18px;">
                  Status: ${statusText}
                </p>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 24px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Content Details:</p>
                <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${contentTitle}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Type: ${contentType}</p>
              </div>
              
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 24px 0;">
                ${statusMessage}
              </p>
              
              ${isPublished ? `
                <a href="https://cohssa-ahss.lovable.app/editorial" 
                   style="display: inline-block; background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
                  View Published Content
                </a>
              ` : ''}
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              
              <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
                College of Health Sciences Students Association<br>
                Ahmadu Bello University, Zaria
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "COHSSA Editorial <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Editorial notification sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending editorial notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
