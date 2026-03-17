import nodemailer from "nodemailer";
import { getTaskReminderEmailSubject, taskReminderHtml } from "@/lib/email/task-reminder";
import { verifyEmailHtml } from "@/lib/email/verify-email";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, name: string, verificationUrl: string) {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: "Verify your email — Taskflow",
    html: verifyEmailHtml({ name, verificationUrl }),
  });
}

type SendTaskReminderEmailParams = {
  to: string;
  name: string;
  taskTitle: string;
  project: string;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "critical";
  status: "nearlyExpired" | "overdue";
  taskUrl: string;
};

export async function sendTaskReminderEmail({
  to,
  name,
  taskTitle,
  project,
  dueDate,
  priority,
  status,
  taskUrl,
}: SendTaskReminderEmailParams) {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: getTaskReminderEmailSubject(status, taskTitle),
    html: taskReminderHtml({
      name,
      taskTitle,
      project,
      dueDate,
      priority,
      status,
      taskUrl,
    }),
  });
}
