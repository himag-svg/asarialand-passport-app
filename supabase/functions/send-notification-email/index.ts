// Supabase Edge Function: send-notification-email
// Triggered via database webhook or called from Server Actions
// Uses Resend for email delivery (swap for SendGrid/other if needed)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "noreply@passportapp.com";
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:3000";

interface NotificationPayload {
  notification_id: string;
  recipient_email?: string;
  recipient_name?: string;
  title: string;
  body: string;
  action_url?: string;
  type: string;
}

serve(async (req: Request) => {
  try {
    // Verify request
    const payload: NotificationPayload = await req.json();

    if (!payload.notification_id || !payload.title) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If no email provided, look up the recipient
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let recipientEmail = payload.recipient_email;
    let recipientName = payload.recipient_name;

    if (!recipientEmail) {
      // Fetch from notification record
      const { data: notification } = await supabase
        .from("notifications")
        .select("recipient_id")
        .eq("id", payload.notification_id)
        .single();

      if (notification) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", notification.recipient_id)
          .single();

        if (profile) {
          recipientEmail = profile.email;
          recipientName = profile.full_name;
        }
      }
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Could not determine recipient email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build email HTML
    const actionUrl = payload.action_url
      ? `${APP_URL}${payload.action_url}`
      : APP_URL;

    const emailHtml = buildEmailHtml({
      recipientName: recipientName ?? "Client",
      title: payload.title,
      body: payload.body,
      actionUrl,
      type: payload.type,
    });

    // Send via Resend
    if (RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Passport Renewal <${FROM_EMAIL}>`,
          to: [recipientEmail],
          subject: payload.title,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error("Resend API error:", errorData);

        return new Response(
          JSON.stringify({ error: "Email delivery failed", details: errorData }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      // Development mode — just log
      console.log("=== EMAIL (dev mode, no RESEND_API_KEY) ===");
      console.log(`To: ${recipientEmail}`);
      console.log(`Subject: ${payload.title}`);
      console.log(`Body: ${payload.body}`);
      console.log("============================================");
    }

    // Mark notification as email_sent
    await supabase
      .from("notifications")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", payload.notification_id);

    return new Response(
      JSON.stringify({ success: true, email: recipientEmail }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// ---- Email Template ----

function buildEmailHtml(params: {
  recipientName: string;
  title: string;
  body: string;
  actionUrl: string;
  type: string;
}) {
  const { recipientName, title, body, actionUrl, type } = params;

  // Choose accent color based on notification type
  const accentColor =
    type === "payment_confirmed" || type === "passport_ready" || type === "document_approved"
      ? "#10b981"
      : type === "document_rejected" || type === "payment_request"
        ? "#ef4444"
        : "#6366f1";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:12px;border:1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
              <h1 style="margin:0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#64748b;">
                Republic of Asarialand
              </h1>
              <p style="margin:4px 0 0;font-size:11px;color:#475569;">
                Passport Renewal Service
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;">
                Dear ${recipientName},
              </p>

              <h2 style="margin:16px 0 8px;font-size:18px;font-weight:600;color:${accentColor};">
                ${title}
              </h2>

              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#cbd5e1;">
                ${body}
              </p>

              <a href="${actionUrl}" style="display:inline-block;padding:12px 24px;background-color:${accentColor};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                View Details
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:11px;color:#475569;">
                This is an automated notification from the Asarialand Passport Renewal Service.
                If you did not expect this email, please disregard it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
