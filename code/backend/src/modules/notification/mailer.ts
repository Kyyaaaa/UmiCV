import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { env } from '../../config/env';

let transport: nodemailer.Transporter;

// Dùng Ethereal Email để test luồng nhận mail thật
transport = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'ssotrkie6nuyh2hk@ethereal.email',
      pass: 'X4nxJ7vTV1RBZ2NtBF'
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const sender = {
    address: 'hello@demomailtrap.com', // Mailtrap default sender for sandbox
    name: 'UmiCV System',
  };

  try {
    const info = await transport.sendMail({
      from: sender,
      to,
      subject,
      html,
    });
    
    if (info.message) {
      // In stream transport mode, log the email body
      if (typeof info.message.pipe === 'function') {
        info.message.pipe(process.stdout);
      } else {
        console.log(info.message.toString());
      }
    } else {
      console.log(`Email sent successfully to ${to}`);
      console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    // Don't throw to prevent worker crashes, just log
  }
};

// Templates
export const getSubmitCVTemplate = (username: string, cvId: string) => `
  <h2>New CV Submitted</h2>
  <p>User <strong>${username}</strong> has submitted a new CV for approval.</p>
  <p><a href="http://localhost:5173/admin/cvs/${cvId}">Review CV here</a></p>
`;

export const getRejectCVTemplate = (reason: string) => `
  <h2>CV Rejected</h2>
  <p>Your recent CV submission has been reviewed and rejected.</p>
  <p><strong>Reason:</strong> ${reason}</p>
  <p>Please update your CV and resubmit.</p>
`;

export const getRemindCVTemplate = (title: string, deadline: string) => `
  <h2>Reminder: Action Required</h2>
  <p>You have a pending requirement to update your CV for the campaign <strong>${title}</strong>.</p>
  <p><strong>Deadline:</strong> ${deadline}</p>
  <p>Please log in to UmiCV and update your profile.</p>
`;
