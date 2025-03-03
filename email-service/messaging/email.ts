import nodemailer from "nodemailer";

export type EmailData = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

let testAccount: nodemailer.TestAccount | null = null;
let transporter: nodemailer.Transporter | null = null;

async function createTestAccount() {
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return testAccount;
}

export async function sendEmail(emailData: EmailData) {
  try {
    await createTestAccount();

    if (!transporter) {
      throw new Error("Email transporter not initialized");
    }

    const info = await transporter.sendMail({
      from: '"Interview Hub" <noreply@interviewhub.com>',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
