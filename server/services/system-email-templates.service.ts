import { db } from "../db";
import { emailTemplates, type InsertEmailTemplate } from "@shared/schema";
import { logger } from "../utils/logger";

function baseWrap(title: string, body: string): string {
  return `<h2 style="margin:0 0 16px;color:#1e3a5f;font-size:20px;">${title}</h2>
${body}`;
}

export const SYSTEM_EMAIL_TEMPLATE_DEFAULTS: InsertEmailTemplate[] = [
  {
    slug: "password-reset",
    name: "Password Reset",
    subject: "Reset your password",
    description: "Sent when a CMS user requests a password reset.",
    variables: ["firstName", "resetUrl"],
    htmlBody: baseWrap(
      "Reset Your Password",
      `
    <p style="color:#374151;font-size:15px;line-height:1.6;">Hi {{firstName}},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;">Use the link below to reset your CMS password.</p>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#2d8a7e;border-radius:6px;padding:12px 28px;">
        <a href="{{resetUrl}}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Reset Password</a>
      </td></tr>
    </table>
    <p style="color:#6b7280;font-size:14px;margin-top:24px;">If you did not request this reset, you can ignore this email.</p>`,
    ),
  },
  {
    slug: "form-submission-notification",
    name: "Form Submission Notification",
    subject: "New form submission: {{formName}}",
    description: "Sent to configured recipients when a public CMS form is submitted.",
    variables: ["formName", "submittedAt", "submissionSummary", "dashboardUrl"],
    htmlBody: baseWrap(
      "New Form Submission",
      `
    <p style="color:#374151;font-size:15px;line-height:1.6;">A new submission was received for <strong>{{formName}}</strong>.</p>
    <p style="color:#6b7280;font-size:14px;">Submitted at {{submittedAt}}</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;color:#374151;font-size:14px;line-height:1.6;">{{submissionSummary}}</div>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#2d8a7e;border-radius:6px;padding:12px 28px;">
        <a href="{{dashboardUrl}}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Open CMS</a>
      </td></tr>
    </table>`,
    ),
  },
  {
    slug: "user-invitation",
    name: "User Invitation",
    subject: "You have been invited to the CMS",
    description: "Sent when an administrator creates or invites a CMS user.",
    variables: ["firstName", "loginUrl", "tempPassword"],
    htmlBody: baseWrap(
      "CMS Invitation",
      `
    <p style="color:#374151;font-size:15px;line-height:1.6;">Hi {{firstName}},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;">You have been invited to access the CMS.</p>
    {{#tempPassword}}<p style="color:#374151;font-size:15px;line-height:1.6;">Temporary password: <strong>{{tempPassword}}</strong></p>{{/tempPassword}}
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#2d8a7e;border-radius:6px;padding:12px 28px;">
        <a href="{{loginUrl}}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Open CMS</a>
      </td></tr>
    </table>`,
    ),
  },
];

export async function ensureSystemEmailTemplates(refreshExisting = false) {
  let created = 0;
  let updated = 0;

  for (const template of SYSTEM_EMAIL_TEMPLATE_DEFAULTS) {
    if (refreshExisting) {
      await db
        .insert(emailTemplates)
        .values(template)
        .onConflictDoUpdate({
          target: emailTemplates.slug,
          set: {
            name: template.name,
            subject: template.subject,
            htmlBody: template.htmlBody,
            description: template.description,
            variables: template.variables,
            isActive: template.isActive ?? true,
            updatedAt: new Date(),
          },
        });
      updated += 1;
      continue;
    }

    const inserted = await db
      .insert(emailTemplates)
      .values(template)
      .onConflictDoNothing({ target: emailTemplates.slug });
    created += inserted.rowCount ?? 0;
  }

  logger.app.info("System email templates ensured", {
    total: SYSTEM_EMAIL_TEMPLATE_DEFAULTS.length,
    created,
    updated,
    refreshExisting,
  });

  return {
    total: SYSTEM_EMAIL_TEMPLATE_DEFAULTS.length,
    created,
    updated,
  };
}
