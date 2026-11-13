import nodemailer from 'nodemailer';

/**
 * Checks whether Google SMTP credentials are provided in environment variables.
 * We support:
 * - EMAIL_USER / EMAIL_APP_PASSWORD
 * - SMTP_USER / SMTP_PASS
 */
export const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  return Boolean(user && pass && user.trim() && pass.trim());
};

/**
 * Sends a secure password reset OTP via Google SMTP.
 * If SMTP credentials are not configured, it strictly throws an error without any mock/fallback.
 */
export const sendPasswordResetOtpEmail = async ({ to, otp, userName = 'Administrator' }) => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    const error = new Error('Google SMTP email service is not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in server/.env to enable live email delivery.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });

  const mailOptions = {
    from: `"BL Jewels Executive Security" <${user.trim()}>`,
    to,
    subject: `BL Jewels Admin Security: Your Password Reset Verification Code (${otp})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #140E0B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #140E0B; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #1C1410; border: 1px solid rgba(201, 164, 74, 0.4); border-radius: 24px; padding: 36px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #F3E5AB;">
                      BL JEWELS
                    </h1>
                    <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #A8A29E;">
                      Executive Portal Security
                    </p>
                  </td>
                </tr>

                <!-- Greeting & Body -->
                <tr>
                  <td style="padding: 28px 0 20px;">
                    <p style="margin: 0 0 12px; font-size: 15px; color: #F5F5F4; line-height: 1.5;">
                      Dear <strong>${userName}</strong>,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 13px; color: #D6D3D1; line-height: 1.6;">
                      A request was received to reset the administrator password for your BL Jewels Executive Portal account. Please use the secure one-time verification code below to proceed:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #2A1A14; border: 1.5px solid #C9A44A; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
                      <span style="display: block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #C9A44A; margin-bottom: 8px; font-weight: 600;">
                        One-Time Verification Code
                      </span>
                      <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #FFFFFF; font-family: monospace;">
                        ${otp}
                      </span>
                      <span style="display: block; font-size: 11px; color: #A8A29E; margin-top: 8px;">
                        Valid for 10 minutes only
                      </span>
                    </div>

                    <p style="margin: 20px 0 0; font-size: 12px; color: #A8A29E; line-height: 1.6;">
                      If you did not initiate this request, please disregard this email and ensure your account remains protected. Do not share this code with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #78716C;">
                    © ${new Date().getFullYear()} BL Jewels Fine Jewellery Atelier. All rights reserved.<br>
                    100% Certified BIS 916 Hallmark Purity Guarantee
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Sends a support ticket / contact inquiry reply email to the customer if SMTP is configured.
 * Returns { sent: boolean, reason?: string }.
 */
export const sendTicketReplyEmail = async ({
  to,
  ticketNumber,
  customerName = 'Valued Customer',
  subject,
  replyText,
}) => {
  if (!to || !isEmailConfigured()) {
    return { sent: false, reason: !to ? 'no_recipient' : 'smtp_not_configured' };
  }

  const user = (process.env.EMAIL_USER || process.env.SMTP_USER).trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS).trim();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const safeName = escapeHtml(customerName);
  const safeTicket = escapeHtml(ticketNumber);
  const safeSubject = escapeHtml(subject);
  const safeReply = escapeHtml(replyText).replace(/\n/g, '<br/>');

  await transporter.sendMail({
    from: `"BL Jewels Support" <${user}>`,
    to,
    subject: `Re: [${ticketNumber}] ${subject} — BL Jewels Support`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#292321;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E9DED2;border-radius:16px;padding:32px;">
                <tr>
                  <td style="border-bottom:1px solid #E9DED2;padding-bottom:16px;">
                    <h1 style="margin:0;font-size:20px;letter-spacing:3px;color:#940303;">BL JEWELS</h1>
                    <p style="margin:4px 0 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#756B65;">Customer Support &bull; ${safeTicket}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 0;">
                    <p style="margin:0 0 12px;font-size:14px;">Namaste <strong>${safeName}</strong>,</p>
                    <p style="margin:0 0 16px;font-size:13px;color:#756B65;">Our team has responded to your inquiry regarding <strong>${safeSubject}</strong>:</p>
                    <div style="background:#FAF7F2;border-left:3px solid #D4AF66;padding:16px;border-radius:8px;font-size:14px;line-height:1.65;color:#292321;">
                      ${safeReply}
                    </div>
                    <p style="margin:18px 0 0;font-size:12px;color:#756B65;">You can also view the full conversation anytime inside your BL Jewels Account &rarr; Support Tickets.</p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #E9DED2;padding-top:14px;font-size:11px;color:#756B65;text-align:center;">
                    &copy; ${new Date().getFullYear()} BL Jewels Fine Jewellery Atelier &bull; 100% Certified BIS 916 Hallmark
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  return { sent: true };
};

/**
 * Sends a security authorization OTP to the administrator's email for credential updates
 */
export const sendAdminSecurityOtpEmail = async ({ to, otp, adminName = 'Administrator', action = 'credentials' }) => {
  if (!to || !isEmailConfigured()) {
    return { sent: false, reason: !to ? 'no_recipient' : 'smtp_not_configured' };
  }

  const user = (process.env.EMAIL_USER || process.env.SMTP_USER).trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS).trim();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const safeName = escapeHtml(adminName);

  const actionTitle = action === 'password'
    ? 'Password Change Authorization'
    : action === 'email_username'
    ? 'Email & Username Update'
    : 'Credential Authorization';

  const actionDescription = action === 'password'
    ? 'update your <strong>administrator login password</strong>'
    : action === 'email_username'
    ? 'update your <strong>registered administrator email address or username</strong>'
    : 'update your administrator login credentials (username, email, or password)';

  await transporter.sendMail({
    from: `"BL Jewels Executive Security" <${user}>`,
    to,
    subject: `[Security Alert] ${otp} — BL Jewels Administrator ${actionTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background-color:#1A0808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#FFFFFF;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#240B0B;border:1px solid #C9A44A;border-radius:16px;padding:32px;">
                <tr>
                  <td align="center" style="border-bottom:1px solid rgba(201,164,74,0.3);padding-bottom:18px;">
                    <h1 style="margin:0;font-size:22px;letter-spacing:3px;color:#C9A44A;">BL JEWELS</h1>
                    <p style="margin:6px 0 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A8A29E;">Executive Security &amp; Access Control</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 0;text-align:center;">
                    <p style="margin:0 0 12px;font-size:15px;color:#F5ECE1;">Namaste <strong>${safeName}</strong>,</p>
                    <p style="margin:0 0 20px;font-size:13px;color:#D6C7BC;line-height:1.6;">
                      A request was initiated in your <strong>Executive Admin Atelier</strong> to ${actionDescription}.
                    </p>

                    <div style="background:#140505;border:1px dashed #C9A44A;border-radius:12px;padding:20px;margin:20px auto;max-width:320px;">
                      <span style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C9A44A;margin-bottom:6px;">
                        Security Authorization Code
                      </span>
                      <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#FFFFFF;font-family:monospace;">
                        ${otp}
                      </span>
                      <span style="display:block;font-size:11px;color:#A8A29E;margin-top:6px;">
                        Expires in 10 minutes &bull; One-time use
                      </span>
                    </div>

                    <p style="margin:20px 0 0;font-size:12px;color:#A8A29E;line-height:1.6;">
                      If you did not initiate this change, immediately secure your account and disregard this message. Never share this code with anyone.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="border-top:1px solid rgba(201,164,74,0.2);padding-top:16px;font-size:11px;color:#A8A29E;">
                    &copy; ${new Date().getFullYear()} BL Jewels Atelier Pvt. Ltd. &bull; Agra Flagship
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  return { sent: true };
};



