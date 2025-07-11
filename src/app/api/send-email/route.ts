
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  // Read credentials from environment variables, matching your tested script
  const {
    EMAIL_USER,
    EMAIL_PASS,
    SMTP_HOST = 'smtp.strato.de',
    SMTP_PORT = 465,
    SMTP_SECURE = 'true', // env vars are strings
    MAIL_TO_ADDRESS,
  } = process.env;

  // Check for the new environment variable names
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ EMAIL_USER and EMAIL_PASS must be set in your environment variables.');
    return NextResponse.json({ message: 'Server is not configured to send emails. Administrator needs to set EMAIL_USER and EMAIL_PASS.' }, { status: 500 });
  }

  const mailTo = MAIL_TO_ADDRESS || 'vorstand@ac-warendorf.de';

  try {
    const { email, name, subject, message, formType } = await req.json();

    if (!email || !name || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Create a transporter object using the exact same settings as your script
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      logger: true, // Enable logging for debugging
      debug: true,  // Enable debug output
    });

    const mailOptions = {
      from: `"${name} via Website" <${EMAIL_USER}>`, // Use your authenticated email as the sender
      replyTo: email, // Set the user's email as the reply-to address
      to: mailTo, // The recipient address from .env or default
      subject: `Neue Anfrage (${formType}): ${subject}`,
      text: `
        Neue Anfrage über das Formular "${formType}" auf der Website:

        Name: ${name}
        E-Mail: ${email}
        Betreff: ${subject}

        Nachricht:
        ${message}
      `,
      html: `
        <h2>Neue Anfrage über das Formular "${formType}"</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Betreff:</strong> ${subject}</p>
        <hr>
        <h3>Nachricht:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Message sent: ${info.messageId}`);
    
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    // Send a more detailed error message to the client for easier debugging
    return NextResponse.json({ message: `Failed to send email. Server error: ${error.message}` }, { status: 500 });
  }
}
