
import nodemailer from "nodemailer";

/**
 * @fileOverview Institutional Email Automation Node.
 * Handles transactional emails for payments and subscriptions.
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[EMAIL_HUB] SMTP credentials missing. Notification suppressed.");
      return;
    }
    
    await transporter.sendMail({
      from: `"Cracklix Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[EMAIL_TRANSMISSION_ERROR]:", err);
  }
}
