type TaskReminderEmailStatus = "nearlyExpired" | "overdue";

type TaskReminderEmailParams = {
  name: string;
  taskTitle: string;
  project: string;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "critical";
  status: TaskReminderEmailStatus;
  taskUrl: string;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function getTaskReminderEmailSubject(
  status: TaskReminderEmailStatus,
  taskTitle: string,
): string {
  return status === "overdue"
    ? `Task overdue: ${taskTitle} — Taskflow`
    : `Task due soon: ${taskTitle} — Taskflow`;
}

export function taskReminderHtml({
  name,
  taskTitle,
  project,
  dueDate,
  priority,
  status,
  taskUrl,
}: TaskReminderEmailParams): string {
  const year = new Date().getFullYear();
  const safeName = escapeHtml(name);
  const safeTaskTitle = escapeHtml(taskTitle);
  const safeProject = escapeHtml(project);
  const safePriority = escapeHtml(priority);
  const safeTaskUrl = escapeHtml(taskUrl);
  const safeYear = escapeHtml(year.toString());
  const safeDueDate = escapeHtml(formatDueDate(dueDate));
  const isOverdue = status === "overdue";
  const statusLabel = isOverdue ? "Overdue" : "Due soon";
  const introCopy = isOverdue
    ? `Hi ${safeName}, your task <strong>${safeTaskTitle}</strong> is now overdue. Review it to update the deadline or mark it complete.`
    : `Hi ${safeName}, your task <strong>${safeTaskTitle}</strong> is nearly overdue. Review it before the deadline passes.`;
  const dueLabel = isOverdue ? "Deadline passed" : "Deadline";
  const accentStart = isOverdue ? "#f97316" : "#3d82f6";
  const accentEnd = isOverdue ? "#ef4444" : "#7c5fe6";

  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${statusLabel}: ${safeTaskTitle} — Taskflow</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      @media only screen and (max-width: 620px) {
        .email-container { width: 100% !important; }
        .email-padding { padding: 28px 20px !important; }
        .email-header { padding: 28px 20px !important; }
        .email-heading { font-size: 20px !important; }
        .email-body-text { font-size: 14px !important; }
        .email-stack-cell { display: block !important; width: 100% !important; }
        .email-stack-spacer { display: none !important; }
        .email-footer-td { padding: 20px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #080c12; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #080c12; padding: 40px 20px; font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <tr>
        <td align="center">
          <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" width="600" align="center"><tr><td><![endif]-->
          <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #131a27; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3);">

            <tr>
              <td class="email-header" style="background: linear-gradient(135deg, ${accentStart} 0%, ${accentEnd} 100%); padding: 36px 40px; text-align: center;">
                <h1 class="email-heading" style="margin: 0; font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                  Taskflow
                </h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">
                  Task reminder
                </p>
              </td>
            </tr>

            <tr>
              <td class="email-padding" style="padding: 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td style="padding: 8px 12px; border-radius: 999px; background-color: rgba(255,255,255,0.08); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #eef2ff;">
                      ${statusLabel}
                    </td>
                  </tr>
                </table>

                <h2 class="email-heading" style="margin: 0 0 8px; font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #eef2ff; letter-spacing: -0.3px;">
                  ${safeTaskTitle}
                </h2>
                <p class="email-body-text" style="margin: 0 0 28px; font-size: 15px; line-height: 1.7; color: #8b95b0;">
                  ${introCopy}
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                  <tr>
                    <td class="email-stack-cell" valign="top" style="padding: 0; width: 33.33%;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0e1420; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #6b7694; text-transform: uppercase; letter-spacing: 0.06em;">
                              Project
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #eef2ff;">
                              ${safeProject}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td class="email-stack-spacer" style="width: 12px;"></td>
                    <td class="email-stack-cell" valign="top" style="padding: 0; width: 33.33%;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0e1420; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #6b7694; text-transform: uppercase; letter-spacing: 0.06em;">
                              Priority
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #eef2ff; text-transform: capitalize;">
                              ${safePriority}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td class="email-stack-spacer" style="width: 12px;"></td>
                    <td class="email-stack-cell" valign="top" style="padding: 0; width: 33.33%;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0e1420; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #6b7694; text-transform: uppercase; letter-spacing: 0.06em;">
                              ${dueLabel}
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #eef2ff;">
                              ${safeDueDate}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeTaskUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="21%" fillcolor="${accentStart}" stroke="f">
                        <v:fill type="gradient" color="${accentStart}" color2="${accentEnd}" angle="135" />
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">Review task &rarr;</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${safeTaskUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.02em; border-radius: 10px; background: linear-gradient(135deg, ${accentStart} 0%, ${accentEnd} 100%); box-shadow: 0 4px 20px rgba(61,130,246,0.35);">
                        Review task &rarr;
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0e1420; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; margin-bottom: 28px;">
                  <tr>
                    <td style="padding: 24px;">
                      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #6b7694; text-transform: uppercase; letter-spacing: 0.06em;">
                        Open in browser
                      </p>
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #8b95b0;">
                        If the button above does not work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.6; word-break: break-all;">
                        <a href="${safeTaskUrl}" style="color: ${accentStart}; text-decoration: none;">${safeTaskUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #4d566e;">
                  You're receiving this because Taskflow detected an urgent task deadline on your account.
                </p>
              </td>
            </tr>

            <tr>
              <td class="email-footer-td" style="padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.07);">
                <p style="margin: 0; font-size: 12px; color: #4d566e;">
                  &copy; ${safeYear} Taskflow. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}
