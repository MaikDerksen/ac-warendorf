
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  // Check for environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const mailTo = process.env.MAIL_TO_ADDRESS || 'vorstand@ac-warendorf.de';

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.error('Missing SMTP configuration in environment variables.');
    return NextResponse.json({ message: 'Server is not configured to send emails. Please contact an administrator.' }, { status: 500 });
  }

  try {
    const { email, name, subject, message, formType } = await req.json();

    if (!email || !name || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: `"${name} via Website" <${smtpUser}>`,
      replyTo: email,
      to: mailTo,
      subject: `Neue Anfrage (${formType}): ${subject}`,
      text: `
        Neue Anfrage über das "${formType}" auf der Website:

        Name: ${name}
        E-Mail: ${email}
        Betreff: ${subject}

        Nachricht:
        ${message}
      `,
      html: `
        <h2>Neue Anfrage über das "${formType}"</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Betreff:</strong> ${subject}</p>
        <hr>
        <h3>Nachricht:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    // Log the detailed error on the server for debugging
    console.error('Error sending email:', error);
    
    // Send a more specific error message to the client
    // This helps diagnose if it's a login issue, connection issue, etc.
    return NextResponse.json({ message: `Failed to send email. Server error: ${error.message}` }, { status: 500 });
  }
}
