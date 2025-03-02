import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(emailData: EmailData) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@interviewhub.com",
    to: emailData.to,
    subject: emailData.subject,
    text: emailData.text || "",
    html: emailData.html || "",
  };

  const response = await sgMail.send(mailOptions);
  console.log("Email sent: %s", response[0].statusCode);
  return response;
}
