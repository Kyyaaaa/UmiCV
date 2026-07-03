import nodemailer from 'nodemailer';
import { env } from '../../config/env';

let transport: nodemailer.Transporter;

// Use real SMTP if configured, fallback to ethereal if missing
if (env.SMTP_USER && env.SMTP_PASS) {
  transport = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: parseInt(env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
} else {
  // Dùng Ethereal Email để test luồng nhận mail thật
  transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ssotrkie6nuyh2hk@ethereal.email',
      pass: 'X4nxJ7vTV1RBZ2NtBF'
    }
  });
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  const sender = {
    address: env.SMTP_USER || 'hello@demomailtrap.com',
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
  <h2>Có CV Mới Được Nộp</h2>
  <p>Nhân viên <strong>${username}</strong> vừa nộp một CV mới để chờ phê duyệt.</p>
  <p><a href="${env.FRONTEND_URL}/admin/cvs/${cvId}">Xem CV tại đây</a></p>
`;

export const getRejectCVTemplate = (reason: string) => `
  <h2>CV Của Bạn Đã Bị Từ Chối</h2>
  <p>Bản CV bạn vừa nộp đã được xem xét và bị từ chối phê duyệt.</p>
  <p><strong>Lý do:</strong> ${reason}</p>
  <p>Vui lòng cập nhật lại CV và nộp lại.</p>
`;

export const getRemindCVTemplate = (title: string, deadline: string) => `
  <h2>Nhắc Nhở: Cần Cập Nhật CV</h2>
  <p>Bạn có yêu cầu cập nhật CV cho chiến dịch <strong>${title}</strong>.</p>
  <p><strong>Hạn chót:</strong> ${deadline}</p>
  <p>Vui lòng đăng nhập vào hệ thống UmiCV và cập nhật hồ sơ của bạn.</p>
`;

export const getResetPasswordTemplate = (resetUrl: string) => `
  <h2>Yêu Cầu Đặt Lại Mật Khẩu</h2>
  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email này.</p>
  <p>Để đặt lại mật khẩu, vui lòng bấm vào nút bên dưới:</p>
  <p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt Lại Mật Khẩu</a></p>
  <p>Đường dẫn này sẽ hết hạn trong 1 giờ.</p>
`;
