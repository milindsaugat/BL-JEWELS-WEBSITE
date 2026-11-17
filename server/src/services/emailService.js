import nodemailer from 'nodemailer';

/**
 * Official hosted BL Jewels logo URL on high-speed CDN.
 * Hosting externally ensures email clients (Gmail, Apple Mail, Outlook) render the brand emblem
 * inline with zero paperclip attachments or downloadable file previews.
 */
const BRAND_LOGO_URL = 'https://res.cloudinary.com/uuhuaten/image/upload/v1794913445/bl-jewels/branding/bl-jewels-official-logo-mwkl4c0d-fzya.png';

/**
 * Standard deliverability headers to prevent emails from being flagged as Spam/Phishing.
 * - Explicit Reply-To
 * - Auto-Submitted: auto-generated (indicates transactional OTP / system message)
 * - X-Auto-Response-Suppress: All (standard Microsoft / Google suppression header)
 */
const getDeliverabilityHeaders = (user) => ({
  'Reply-To': user,
  'X-Mailer': 'BL Jewels Atelier Notification Service',
  'X-Priority': '1',
  'Importance': 'high',
  'Auto-Submitted': 'auto-generated',
  'X-Auto-Response-Suppress': 'All',
});

/**
 * Common clean HTML head markup with robust inline fallbacks.
 * We avoid external @import font stylesheets inside email headers to prevent
 * aggressive spam filters from penalizing the message for third-party CSS requests.
 */
const EMAIL_HEAD_FONTS = `
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>BL Jewels</title>
    <style type="text/css">
      body, table, td, p, span, div, strong, h1, h2, h3, a, b {
        font-family: 'Inter', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          max-width: 100% !important;
          border-radius: 18px !important;
        }
        .content-padding {
          padding: 24px 20px !important;
        }
        .otp-display {
          font-size: 34px !important;
          letter-spacing: 8px !important;
        }
      }
    </style>
  </head>
`;

/**
 * Retrieves and cleans Google SMTP credentials from environment variables.
 * Automatically strips internal spaces from 16-character Google App Passwords.
 */
export const getSmtpCredentials = () => {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim();
  const pass = rawPass.replace(/\s+/g, '');
  return { user, pass };
};

/**
 * Checks whether Google SMTP credentials are provided in environment variables.
 * We support:
 * - EMAIL_USER / EMAIL_APP_PASSWORD
 * - SMTP_USER / SMTP_PASS
 */
export const isEmailConfigured = () => {
  const { user, pass } = getSmtpCredentials();
  return Boolean(user && pass);
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Sends a secure password reset OTP via Google SMTP.
 * If SMTP credentials are not configured, it strictly throws an error without any mock/fallback.
 */
export const sendPasswordResetOtpEmail = async ({ to, otp, userName = 'Valued Customer' }) => {
  const { user, pass } = getSmtpCredentials();

  if (!user || !pass) {
    const error = new Error('Google SMTP email service is not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in server/.env to enable live email delivery.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const safeName = escapeHtml(userName);
  const safeOtp = escapeHtml(otp);

  const subject = `Your BL Jewels password reset code is ${safeOtp}`;
  const plainText = `Namaste ${safeName},

A request was received to reset your BL Jewels account password.
Your one-time verification code is: ${safeOtp}

This code is valid for 10 minutes. Please enter it to choose a new password.
If you did not initiate this request, your account remains protected and you can safely disregard this email. Never share this code with anyone.

---
BL Jewels Fine Jewellery Atelier
Agra Flagship: Suresh Mall, Civil Lines, Agra, Uttar Pradesh 282002
100% Certified BIS 916 Hallmark Purity Guarantee
© ${new Date().getFullYear()} BL Jewels. All rights reserved.`;

  const mailOptions = {
    from: `"BL Jewels" <${user}>`,
    to,
    replyTo: user,
    subject,
    text: plainText,
    headers: getDeliverabilityHeaders(user),
    html: `
      <!DOCTYPE html>
      <html>
      ${EMAIL_HEAD_FONTS}
      <body style="margin: 0; padding: 0; background-color: #FAF7F2; color: #292321; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 36px 16px; background-color: #FAF7F2;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 520px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 36px rgba(28, 20, 16, 0.06);">
                
                <!-- Brand Header with Hosted Logo (No Top Border) -->
                <tr>
                  <td align="center" style="padding: 38px 32px 22px 32px; text-align: center; border-bottom: 1px solid #F3EDE5;">
                    <img src="${BRAND_LOGO_URL}" alt="BL Jewels" height="52" style="height: 52px; max-height: 52px; width: auto; display: block; margin: 0 auto; border: 0;" />
                    <p style="margin: 10px 0 0; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #9C7D46;">
                      Account Security &bull; Password Recovery
                    </p>
                  </td>
                </tr>

                <!-- Greeting & Body -->
                <tr>
                  <td class="content-padding" style="padding: 32px 36px 28px 36px;">
                    <h2 style="margin: 0 0 12px; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 22px; font-weight: 700; color: #1C1410; letter-spacing: -0.02em;">
                      Reset Your Account Password
                    </h2>
                    <p style="margin: 0 0 12px; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 14.5px; color: #292321; line-height: 1.6;">
                      Namaste <strong>${safeName}</strong>,
                    </p>
                    <p style="margin: 0 0 24px; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 14px; color: #57534E; line-height: 1.65;">
                      A request was received to reset the login password for your BL Jewels customer account. Please enter the secure 6-digit verification code below to proceed:
                    </p>

                    <!-- Luxury Seamless Verification Code Block -->
                    <div style="background-color: #FAF7F2; border-radius: 20px; padding: 26px 20px; text-align: center; margin: 0 0 24px 0;">
                      <div style="display: inline-block; padding: 5px 14px; background-color: #FFFFFF; border-radius: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 14px;">
                        <span style="font-family: 'Inter', 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9C7D46;">
                          ONE-TIME VERIFICATION CODE
                        </span>
                      </div>
                      <div style="margin: 2px 0 12px 0;">
                        <span class="otp-display" style="font-family: 'Inter', 'DM Sans', -apple-system, monospace; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #930303; display: inline-block; padding-left: 12px; line-height: 1;">
                          ${safeOtp}
                        </span>
                      </div>
                      <p style="margin: 0; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 11.5px; color: #8C827A; font-weight: 500;">
                        Valid for 10 minutes only &bull; Single-use code
                      </p>
                    </div>

                    <p style="margin: 0; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 12.5px; line-height: 1.6; color: #78716C;">
                      If you did not initiate this request, please disregard this email. Your BL Jewels account remains completely secure. Never share this code with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px 28px 32px; background-color: #FAF7F2; border-top: 1px solid #F3EDE5; text-align: center;">
                    <p style="margin: 0 0 5px; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; color: #9C7D46; letter-spacing: 0.5px;">
                      100% Certified BIS 916 Hallmark Purity Guarantee
                    </p>
                    <p style="margin: 0 0 4px; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 11px; color: #78716C;">
                      BL Jewels Atelier &bull; Suresh Mall, Civil Lines, Agra, Uttar Pradesh 282002
                    </p>
                    <p style="margin: 0; font-family: 'Inter', 'DM Sans', sans-serif; font-size: 10.5px; color: #A8A29E;">
                      &copy; ${new Date().getFullYear()} BL Jewels Fine Jewellery Atelier. All rights reserved.
                    </p>
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

/**
 * Sends a support ticket creation confirmation notification to the customer's registered email address.
 * Returns { sent: boolean, reason?: string }.
 */
export const sendTicketCreatedEmail = async ({
  to,
  ticketNumber,
  customerName = 'Valued Customer',
  subject,
  category = 'General Support',
  orderNumber = '',
  message = '',
  priority = 'normal',
}) => {
  if (!to || !isEmailConfigured()) {
    return { sent: false, reason: !to ? 'no_recipient' : 'smtp_not_configured' };
  }

  const { user, pass } = getSmtpCredentials();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const safeName = escapeHtml(customerName);
  const safeTicket = escapeHtml(ticketNumber);
  const safeSubject = escapeHtml(subject);
  const safeCategory = escapeHtml(category);
  const safeOrder = escapeHtml(orderNumber);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  const emailSubject = `We received your inquiry [#${safeTicket}]: ${safeSubject}`;
  const plainText = `Namaste ${safeName},

Thank you for contacting BL Jewels Concierge. We have received your inquiry and our atelier specialists have begun reviewing your case.

Ticket Number: ${safeTicket}
Subject: ${safeSubject}
Category: ${safeCategory}
${safeOrder ? `Order Reference: #${safeOrder}\n` : ''}Priority: ${priority}

Your Message:
${message}

You can monitor replies and track progress anytime directly inside your BL Jewels Account -> Support Tickets tab.

---
BL Jewels Fine Jewellery Atelier
Agra Flagship: Suresh Mall, Civil Lines, Agra, Uttar Pradesh 282002
100% Certified BIS 916 Hallmark Purity Guarantee
© ${new Date().getFullYear()} BL Jewels. All rights reserved.`;

  await transporter.sendMail({
    from: `"BL Jewels" <${user}>`,
    to,
    replyTo: user,
    subject: emailSubject,
    text: plainText,
    headers: getDeliverabilityHeaders(user),
    html: `
      <!DOCTYPE html>
      <html>
      ${EMAIL_HEAD_FONTS}
      <body style="margin:0;padding:0;background-color:#FAF7F2;color:#292321; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 16px;background-color:#FAF7F2;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:540px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 10px 36px rgba(28,20,16,0.06);">
                <tr>
                  <td align="center" style="padding:38px 32px 22px 32px;text-align:center;border-bottom:1px solid #F3EDE5;">
                    <img src="${BRAND_LOGO_URL}" alt="BL Jewels" height="52" style="height:52px;max-height:52px;width:auto;display:block;margin:0 auto;border:0;" />
                    <p style="margin:10px 0 0;font-family:'Inter','DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9C7D46;">Customer Concierge Support &bull; Ticket Confirmation</p>
                  </td>
                </tr>
                <tr>
                  <td class="content-padding" style="padding:32px 36px 28px 36px;">
                    <p style="margin:0 0 12px;font-family:'Inter','DM Sans',sans-serif;font-size:15px;color:#292321;">Namaste <strong>${safeName}</strong>,</p>
                    <p style="margin:0 0 20px;font-family:'Inter','DM Sans',sans-serif;font-size:14px;color:#57534E;line-height:1.65;">
                      Thank you for contacting BL Jewels Concierge. We have received your inquiry and our atelier specialists have begun reviewing your case.
                    </p>

                    <div style="background-color:#FAF7F2;border-radius:18px;padding:22px;margin:18px 0;">
                      <table width="100%" cellpadding="6" cellspacing="0" style="font-family:'Inter','DM Sans',sans-serif;font-size:13px;">
                        <tr>
                          <td width="35%" style="color:#8C7B70;font-weight:600;">Ticket Number:</td>
                          <td style="color:#930303;font-weight:700;font-family:monospace;letter-spacing:1px;">${safeTicket}</td>
                        </tr>
                        <tr>
                          <td style="color:#8C7B70;font-weight:600;">Subject:</td>
                          <td style="color:#1C1917;font-weight:600;">${safeSubject}</td>
                        </tr>
                        <tr>
                          <td style="color:#8C7B70;font-weight:600;">Category:</td>
                          <td style="color:#1C1917;">${safeCategory}</td>
                        </tr>
                        ${safeOrder ? `
                        <tr>
                          <td style="color:#8C7B70;font-weight:600;">Order Reference:</td>
                          <td style="color:#1C1917;font-weight:600;">#${safeOrder}</td>
                        </tr>` : ''}
                        <tr>
                          <td style="color:#8C7B70;font-weight:600;">Priority:</td>
                          <td style="color:#1C1917;text-transform:capitalize;">${escapeHtml(priority)}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin:0 0 8px;font-family:'Inter','DM Sans',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9C7D46;">Your Message:</p>
                    <div style="background-color:#FAF7F2;border-radius:14px;padding:16px;font-family:'Inter','DM Sans',sans-serif;font-size:13.5px;line-height:1.65;color:#292321;">
                      ${safeMessage}
                    </div>

                    <p style="margin:20px 0 0;font-family:'Inter','DM Sans',sans-serif;font-size:12.5px;color:#78716C;line-height:1.6;">
                      You can monitor replies and track progress anytime directly inside your <strong>BL Jewels Account &rarr; Support Tickets</strong> tab.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 32px;background-color:#FAF7F2;border-top:1px solid #F3EDE5;font-family:'Inter','DM Sans',sans-serif;font-size:11px;color:#8C7B70;text-align:center;">
                    &copy; ${new Date().getFullYear()} BL Jewels Fine Jewellery Atelier &bull; 100% Certified BIS 916 Hallmark Purity Guarantee
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

  const { user, pass } = getSmtpCredentials();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const safeName = escapeHtml(customerName);
  const safeTicket = escapeHtml(ticketNumber);
  const safeSubject = escapeHtml(subject);
  const safeReply = escapeHtml(replyText).replace(/\n/g, '<br/>');

  const replySubject = `Reply to your support inquiry [#${safeTicket}]: ${safeSubject}`;
  const plainText = `Namaste ${safeName},

Our atelier support team has responded to your ticket regarding "${safeSubject}":

${replyText}

You can continue the conversation anytime inside your BL Jewels Account -> Support Tickets.

---
BL Jewels Fine Jewellery Atelier
Agra Flagship: Suresh Mall, Civil Lines, Agra, Uttar Pradesh 282002
100% Certified BIS 916 Hallmark Purity Guarantee
© ${new Date().getFullYear()} BL Jewels. All rights reserved.`;

  await transporter.sendMail({
    from: `"BL Jewels" <${user}>`,
    to,
    replyTo: user,
    subject: replySubject,
    text: plainText,
    headers: getDeliverabilityHeaders(user),
    html: `
      <!DOCTYPE html>
      <html>
      ${EMAIL_HEAD_FONTS}
      <body style="margin:0;padding:0;background-color:#FAF7F2;color:#292321; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 16px;background-color:#FAF7F2;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:540px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 10px 36px rgba(28,20,16,0.06);">
                <tr>
                  <td align="center" style="padding:38px 32px 22px 32px;text-align:center;border-bottom:1px solid #F3EDE5;">
                    <img src="${BRAND_LOGO_URL}" alt="BL Jewels" height="52" style="height:52px;max-height:52px;width:auto;display:block;margin:0 auto;border:0;" />
                    <p style="margin:10px 0 0;font-family:'Inter','DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#9C7D46;">Customer Concierge Support &bull; ${safeTicket}</p>
                  </td>
                </tr>
                <tr>
                  <td class="content-padding" style="padding:32px 36px 28px 36px;">
                    <p style="margin:0 0 12px;font-family:'Inter','DM Sans',sans-serif;font-size:15px;color:#292321;">Namaste <strong>${safeName}</strong>,</p>
                    <p style="margin:0 0 18px;font-family:'Inter','DM Sans',sans-serif;font-size:14px;color:#57534E;line-height:1.65;">Our atelier support team has responded to your ticket regarding <strong>${safeSubject}</strong>:</p>
                    <div style="background-color:#FAF7F2;padding:20px;border-radius:16px;font-family:'Inter','DM Sans',sans-serif;font-size:14px;line-height:1.65;color:#292321;">
                      ${safeReply}
                    </div>
                    <p style="margin:20px 0 0;font-family:'Inter','DM Sans',sans-serif;font-size:12.5px;color:#78716C;line-height:1.6;">You can continue the conversation anytime inside your BL Jewels Account &rarr; Support Tickets.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 32px;background-color:#FAF7F2;border-top:1px solid #F3EDE5;font-family:'Inter','DM Sans',sans-serif;font-size:11px;color:#8C7B70;text-align:center;">
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

  const { user, pass } = getSmtpCredentials();

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
    ? 'update your administrator login password'
    : action === 'email_username'
    ? 'update your registered administrator email address or username'
    : 'update your administrator login credentials (username, email, or password)';

  const subject = `Security code: ${otp} — BL Jewels Admin`;
  const plainText = `Namaste ${safeName},

A request was initiated in your Executive Admin Atelier to ${actionDescription}.
Your one-time authorization code is: ${otp}

This code expires in 10 minutes.
If you did not initiate this change, please immediately secure your account. Never share this code with anyone.

---
BL Jewels Executive Security
Agra Flagship: Suresh Mall, Civil Lines, Agra, Uttar Pradesh 282002
© ${new Date().getFullYear()} BL Jewels Atelier Pvt. Ltd. All rights reserved.`;

  await transporter.sendMail({
    from: `"BL Jewels" <${user}>`,
    to,
    replyTo: user,
    subject,
    text: plainText,
    headers: getDeliverabilityHeaders(user),
    html: `
      <!DOCTYPE html>
      <html>
      ${EMAIL_HEAD_FONTS}
      <body style="margin:0;padding:0;background-color:#FAF7F2;color:#292321; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 16px;background-color:#FAF7F2;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 10px 36px rgba(28,20,16,0.06);">
                <tr>
                  <td align="center" style="padding:38px 32px 22px 32px;text-align:center;border-bottom:1px solid #F3EDE5;">
                    <img src="${BRAND_LOGO_URL}" alt="BL Jewels" height="52" style="height:52px;max-height:52px;width:auto;display:block;margin:0 auto;border:0;" />
                    <p style="margin:10px 0 0;font-family:'Inter','DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9C7D46;">Executive Security &bull; Access Control</p>
                  </td>
                </tr>
                <tr>
                  <td class="content-padding" style="padding:32px 36px 28px 36px;text-align:center;">
                    <p style="margin:0 0 12px;font-family:'Inter','DM Sans',sans-serif;font-size:15px;color:#292321;">Namaste <strong>${safeName}</strong>,</p>
                    <p style="margin:0 0 24px;font-family:'Inter','DM Sans',sans-serif;font-size:14px;color:#57534E;line-height:1.65;">
                      A request was initiated in your <strong>Executive Admin Atelier</strong> to ${actionDescription}.
                    </p>

                    <div style="background-color:#FAF7F2;border-radius:20px;padding:26px 20px;margin:20px auto;max-width:340px;">
                      <div style="display:inline-block;padding:5px 14px;background-color:#FFFFFF;border-radius:24px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:14px;">
                        <span style="font-family:'Inter','DM Sans',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#9C7D46;">
                          SECURITY AUTHORIZATION CODE
                        </span>
                      </div>
                      <div style="margin:2px 0 12px 0;">
                        <span class="otp-display" style="font-family:'Inter','DM Sans',-apple-system,monospace;font-size:42px;font-weight:800;letter-spacing:12px;color:#930303;display:inline-block;padding-left:12px;line-height:1;">
                          ${otp}
                        </span>
                      </div>
                      <p style="margin:0;font-family:'Inter','DM Sans',sans-serif;font-size:11.5px;color:#8C827A;font-weight:500;">
                        Expires in 10 minutes &bull; One-time use
                      </p>
                    </div>

                    <p style="margin:20px 0 0;font-family:'Inter','DM Sans',sans-serif;font-size:12.5px;color:#78716C;line-height:1.6;">
                      If you did not initiate this change, immediately secure your account. Never share this code with anyone.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:22px 32px;background-color:#FAF7F2;border-top:1px solid #F3EDE5;font-family:'Inter','DM Sans',sans-serif;font-size:11px;color:#8C7B70;">
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

/**
 * Sends a royal branded 6-digit OTP email for Account Registration or Login Verification
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.otp - 6-digit numeric OTP
 * @param {string} params.userName - Recipient name
 * @param {'register'|'login'} params.type - OTP purpose
 */
export const sendAuthOtpEmail = async ({ to, otp, userName = 'Valued Customer', type = 'register' }) => {
  if (!to || !isEmailConfigured()) {
    return { sent: false, reason: !to ? 'no_recipient' : 'smtp_not_configured' };
  }

  const { user, pass } = getSmtpCredentials();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const safeName = escapeHtml(userName || 'Customer');
  const safeOtp = escapeHtml(otp);

  const isRegister = type === 'register';
  const subject = isRegister
    ? `Your BL Jewels verification code is ${safeOtp}`
    : `${safeOtp} is your BL Jewels verification code`;

  const heading = isRegister
    ? 'Verify Your Email Address'
    : 'Account Sign-In Verification';

  const introText = isRegister
    ? `Namaste <strong>${safeName}</strong>, thank you for joining BL Jewels Fine Jewellery Atelier. To complete your account registration, please enter the 6-digit verification code below:`
    : `Namaste <strong>${safeName}</strong>, we received a request to sign in to your BL Jewels account. To confirm your identity and access your account, please enter the 6-digit verification code below:`;

  const footerNote = isRegister
    ? 'This code is valid for 10 minutes. If you did not create an account on BL Jewels, please ignore this email.'
    : 'This code is valid for 10 minutes. If you did not initiate this login request, please ensure your account credentials are secure or contact our atelier concierge immediately.';

  const plainText = `Namaste ${safeName},

${isRegister ? 'Thank you for joining BL Jewels Fine Jewellery Atelier.' : 'We received a request to sign in to your BL Jewels account.'}

Your 6-digit verification code is: ${safeOtp}

This code is valid for 10 minutes.
${isRegister ? 'If you did not create an account on BL Jewels, please ignore this email.' : 'If you did not initiate this login request, please ensure your account credentials are secure.'}
Never share this code with anyone.

---
BL Jewels Fine Jewellery Atelier
Agra Flagship: Suresh Mall, Civil Lines, Agra, Uttar Pradesh 282002
100% Certified BIS 916 Hallmark Purity Guarantee
© ${new Date().getFullYear()} BL Jewels. All rights reserved.`;

  await transporter.sendMail({
    from: `"BL Jewels" <${user}>`,
    to,
    replyTo: user,
    subject,
    text: plainText,
    headers: getDeliverabilityHeaders(user),
    html: `
      <!DOCTYPE html>
      <html>
      ${EMAIL_HEAD_FONTS}
      <body style="margin:0;padding:0;background-color:#FAF7F2;color:#292321; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 16px;background-color:#FAF7F2;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:520px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 10px 36px rgba(28,20,16,0.06);">
                
                <!-- Brand Header with Hosted Logo (No Top Border) -->
                <tr>
                  <td align="center" style="padding:38px 32px 22px 32px;text-align:center;border-bottom:1px solid #F3EDE5;">
                    <img src="${BRAND_LOGO_URL}" alt="BL Jewels" height="52" style="height:52px;max-height:52px;width:auto;display:block;margin:0 auto;border:0;" />
                    <p style="margin:10px 0 0;font-family:'Inter','DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9C7D46;">Fine Jewellery Atelier &bull; Purity with Auspiciousness</p>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td class="content-padding" style="padding:32px 36px 28px 36px;">
                    <h2 style="margin:0 0 12px;font-family:'Inter','DM Sans',sans-serif;font-size:22px;font-weight:700;color:#1C1410;letter-spacing:-0.02em;">${heading}</h2>
                    <p style="margin:0 0 24px;font-family:'Inter','DM Sans',sans-serif;font-size:14px;line-height:1.65;color:#57534E;">${introText}</p>

                    <!-- Luxury Seamless Verification Code Block -->
                    <div style="background-color:#FAF7F2;border-radius:20px;padding:26px 20px;text-align:center;margin:0 0 24px 0;">
                      <div style="display:inline-block;padding:5px 14px;background-color:#FFFFFF;border-radius:24px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:14px;">
                        <span style="font-family:'Inter','DM Sans',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#9C7D46;">
                          ONE-TIME VERIFICATION CODE
                        </span>
                      </div>
                      <div style="margin:2px 0 12px 0;">
                        <span class="otp-display" style="font-family:'Inter','DM Sans',-apple-system,monospace;font-size:42px;font-weight:800;letter-spacing:12px;color:#930303;display:inline-block;padding-left:12px;line-height:1;">
                          ${safeOtp}
                        </span>
                      </div>
                      <p style="margin:0;font-family:'Inter','DM Sans',sans-serif;font-size:11.5px;color:#8C827A;font-weight:500;">
                        Valid for 10 minutes only &bull; Single-use only
                      </p>
                    </div>

                    <p style="margin:0;font-family:'Inter','DM Sans',sans-serif;font-size:12.5px;line-height:1.6;color:#78716C;">${footerNote}</p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:24px 32px 28px 32px;background-color:#FAF7F2;border-top:1px solid #F3EDE5;text-align:center;">
                    <p style="margin:0 0 5px;font-family:'Inter','DM Sans',sans-serif;font-size:11px;font-weight:700;color:#9C7D46;letter-spacing:0.5px;">100% Certified BIS 916 Hallmark Purity Guarantee</p>
                    <p style="margin:0 0 4px;font-family:'Inter','DM Sans',sans-serif;font-size:11px;color:#78716C;">BL Jewels Atelier &bull; Suresh Mall, Civil Lines, Agra, UP 282002</p>
                    <p style="margin:0;font-family:'Inter','DM Sans',sans-serif;font-size:10.5px;color:#A8A29E;">&copy; ${new Date().getFullYear()} BL Jewels. All rights reserved.</p>
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
