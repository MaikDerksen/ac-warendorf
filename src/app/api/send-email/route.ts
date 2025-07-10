
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  // Check for environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.error('Missing SMTP configuration in environment variables.');
    return NextResponse.json({ message: 'Server is not configured to send emails. Please contact an administrator.' }, { status: 500 });
  }

  // Parse form data from the request
  try {
    const { email, name, subject, message, formType } = await req.json();

    // Basic validation
    if (!email || !name || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Create a transporter object using the SMTP transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser, // your full email address from Strato
        pass: smtpPassword, // your email password
      },
    });

    // Email content
    const mailOptions = {
      from: `"${name} via Website" <${smtpUser}>`, // Use configured user as sender
      replyTo: email, // Set the user's email as the reply-to address
      to: 'vorstand@ac-warendorf.de', // The destination email address
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

    // Send mail
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email.', error: error.message }, { status: 500 });
  }
}
