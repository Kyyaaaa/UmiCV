import { sendEmail, getSubmitCVTemplate } from '../modules/notification/mailer';
import { env } from '../config/env';

describe('QA Phase 17 - SMTP Email Test', () => {
  it('should send an email successfully without throwing errors', async () => {
    // If using real Gmail, we can send to the configured SMTP_USER itself to test
    // Or if Mailtrap, any address works.
    const testRecipient = env.SMTP_USER || 'test@example.com';
    const htmlBody = getSubmitCVTemplate('Test User', 'mock-cv-id-123');

    // We expect sendEmail to resolve successfully
    await expect(sendEmail(testRecipient, 'UmiCV - QA Phase 17 Test', htmlBody)).resolves.not.toThrow();
  }, 15000); // Give it 15 seconds as SMTP might be slow
});
