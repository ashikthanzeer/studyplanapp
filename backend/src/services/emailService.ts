import nodemailer from 'nodemailer';

// Keep track of the Ethereal transporter once created to reuse it
let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    // Return standard transporter from env config
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Fallback to cached Ethereal Transporter
  if (!transporterPromise) {
    transporterPromise = (async () => {
      console.log('No SMTP config found in .env. Creating Ethereal Test Account...');
      const testAccount = await nodemailer.createTestAccount();
      console.log(`Ethereal Test Account created! User: ${testAccount.user}`);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    })();
  }

  return transporterPromise;
}

/**
 * Sends a 6-digit OTP email for account verification or password resets.
 */
export async function sendOTPEmail(email: string, otp: string, purpose: 'email_verification' | 'forgot_password' | 'change_email'): Promise<void> {
  let subject = 'StudyPlanner Code';
  let title = 'One-Time Password (OTP)';
  let bodyText = `Here is your code: **${otp}**. It is valid for the next 10 minutes.`;

  if (purpose === 'email_verification') {
    subject = 'Verify Your StudyPlanner Account';
    title = 'Verify Your Email Address';
    bodyText = `Thank you for signing up for StudyPlanner! Please use the following 6-digit verification code to complete your registration:`;
  } else if (purpose === 'forgot_password') {
    subject = 'Reset Your StudyPlanner Password';
    title = 'Reset Password Request';
    bodyText = `We received a request to reset your password. Please use the following 6-digit verification code to complete the process:`;
  } else if (purpose === 'change_email') {
    subject = 'Confirm Your New StudyPlanner Email';
    title = 'Verify Your New Email';
    bodyText = `You requested to change your email address. Please use the following 6-digit verification code to verify this email:`;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px;">
      <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">${title}</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.5;">${bodyText}</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background-color: #f3f4f6; padding: 12px 24px; border-radius: 6px; border: 1px dashed #cbd5e1; display: inline-block;">
          ${otp}
        </span>
      </div>
      <p style="color: #ef4444; font-size: 14px; font-weight: bold;">Note: This code will expire in 10 minutes.</p>
      <hr style="border: 0; border-top: 1px solid #e1e8ed; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 12px; text-align: center;">
        If you did not initiate this request, you can safely ignore this email.
      </p>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[Resend Email] Attempting to send email via Resend API to: ${email}`);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API failed with status ${response.status}: ${errorText}`);
    }

    const resData: any = await response.json();
    console.log(`[Resend Email Sent] To: ${email}, OTP: ${otp}, Resend ID: ${resData.id}`);
    return;
  }

  // Fallback to standard SMTP / Ethereal
  const transporter = await getTransporter();
  const mailOptions = {
    from: process.env.SMTP_FROM || '"StudyPlanner" <noreply@studyplanner.dev>',
    to: email,
    subject: subject,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // Log ethereal preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('----------------------------------------------------');
    console.log(`[Email Sent] To: ${email}`);
    console.log(`[Email Sent] OTP: ${otp} (${purpose})`);
    console.log(`[Email Sent] Preview URL: ${previewUrl}`);
    console.log('----------------------------------------------------');
  } else {
    console.log(`[Email Sent] To: ${email} (OTP: ${otp})`);
  }
}
