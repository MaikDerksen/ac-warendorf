
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  // Read credentials from environment variables
  const {
    EMAIL_USER,
    EMAIL_PASS,
    SMTP_HOST = 'smtp.strato.de',
    SMTP_PORT = 465,
    SMTP_SECURE = 'true', // env vars are strings
    MAIL_TO_ADDRESS, // Default recipient
    MAIL_TO_ADDRESS_SCHUTZKONZEPT, // Special recipient for Schutzkonzept
  } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ EMAIL_USER and EMAIL_PASS must be set in your environment variables.');
    return NextResponse.json({ message: 'Server is not configured to send emails. Administrator needs to set EMAIL_USER and EMAIL_PASS.' }, { status: 500 });
  }
  
  try {
    const { email, name, subject, message, formType } = await req.json();

    if (!email || !name || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }
    
    // Determine the recipient based on the formType
    let mailTo;
    if (formType === "Schutzkonzept-Kontakt" && MAIL_TO_ADDRESS_SCHUTZKONZEPT) {
      mailTo = MAIL_TO_ADDRESS_SCHUTZKONZEPT;
    } else {
      mailTo = MAIL_TO_ADDRESS || 'vorstand@ac-warendorf.de';
    }

    if (!mailTo) {
         console.error('❌ No recipient email address is configured.');
         return NextResponse.json({ message: 'Server is not configured with a recipient email address.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      logger: false,
      debug: false,
    });

    const mailOptions = {
      from: `"${name} via Website" <${EMAIL_USER}>`,
      replyTo: email,
      to: mailTo, 
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
    console.log(`✅ Message sent to ${mailTo}: ${info.messageId}`);
    
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    return NextResponse.json({ message: `Failed to send email. Server error: ${error.message}` }, { status: 500 });
  }
}
