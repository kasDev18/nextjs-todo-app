type VerifyEmailParams = {
  name: string;
  verificationUrl: string;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function verifyEmailHtml({ name, verificationUrl }: VerifyEmailParams): string {
  const year = new Date().getFullYear();
  const safeName = escapeHtml(name);
  const safeVerificationUrl = escapeHtml(verificationUrl);
  const safeYear = escapeHtml(year.toString());

  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Verify your email — Taskflow</title>
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
        .email-btn-td { padding: 12px 24px !important; }
        .email-fallback-td { padding: 20px !important; }
        .email-divider-td { padding: 0 20px !important; }
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
  
            <!-- Header -->
            <tr>
              <td class="email-header" style="background: linear-gradient(135deg, #3d82f6 0%, #7c5fe6 100%); padding: 36px 40px; text-align: center;">
                <h1 class="email-heading" style="margin: 0; font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                  Taskflow
                </h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">
                  Todo Management
                </p>
              </td>
            </tr>
  
            <!-- Body -->
            <tr>
              <td class="email-padding" style="padding: 40px;">
                <h2 class="email-heading" style="margin: 0 0 8px; font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #eef2ff; letter-spacing: -0.3px;">
                  Verify your email
                </h2>
                <p class="email-body-text" style="margin: 0 0 28px; font-size: 15px; line-height: 1.7; color: #8b95b0;">
                  Hi ${safeName}, thanks for signing up! Please confirm your email address by clicking the button below to get started.
                </p>
  
                <!-- CTA button -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeVerificationUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="21%" fillcolor="#3d82f6" stroke="f">
                        <v:fill type="gradient" color="#3d82f6" color2="#7c5fe6" angle="135" />
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">Verify Email Address &rarr;</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${safeVerificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.02em; border-radius: 10px; background: linear-gradient(135deg, #3d82f6 0%, #7c5fe6 100%); box-shadow: 0 4px 20px rgba(61,130,246,0.35);">
                        Verify Email Address &rarr;
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
  
                <!-- Fallback link -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0e1420; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; margin-bottom: 28px;">
                  <tr>
                    <td class="email-fallback-td" style="padding: 24px;">
                      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #6b7694; text-transform: uppercase; letter-spacing: 0.06em;">
                        Button not working?
                      </p>
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #8b95b0;">
                        Copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.6; word-break: break-all;">
                        <a href="${safeVerificationUrl}" style="color: #3d82f6; text-decoration: none;">${safeVerificationUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>
  
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #4d566e;">
                  If you didn't create an account with Taskflow, you can safely ignore this email.
                </p>
              </td>
            </tr>
  
            <!-- Divider -->
            <tr>
              <td class="email-divider-td" style="padding: 0 40px;">
                <div style="height: 1px; background: rgba(255,255,255,0.07);"></div>
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td class="email-footer-td" style="padding: 24px 40px; text-align: center;">
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
