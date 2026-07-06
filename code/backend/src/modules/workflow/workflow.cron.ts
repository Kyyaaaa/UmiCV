import cron from 'node-cron';
import prisma from '../../config/db';
import { emailQueue } from '../notification/notification.queue';
import { CVStatus, ApprovalAction } from '@prisma/client';

export const checkSLA = async () => {
  console.log('[Cronjob] Running daily SLA check for PendingApproval CVs...');

  try {
    const pendingCVs = await prisma.cVProfile.findMany({
        where: { status: CVStatus.PendingApproval },
        include: {
          user: {
            include: {
              projectMembers: {
                include: {
                  project: true,
                },
              },
            },
          },
          approvalLogs: true,
        },
      });

      if (pendingCVs.length === 0) {
        console.log('[Cronjob] No PendingApproval CVs found.');
        return;
      }

      // Fetch all HRs in case we need them
      const hrUsers = await prisma.user.findMany({
        where: { role: 'HR' },
        select: { id: true, email: true },
      });

      let count = 0;

      for (const cv of pendingCVs) {
        if (!cv.submittedAt) continue;

        const hoursDiff = (Date.now() - cv.submittedAt.getTime()) / (1000 * 60 * 60);

        if (hoursDiff >= 24) {
          const isOverdue = hoursDiff >= 48;
          const severity = isOverdue ? 'Overdue' : 'Warning';

          // Determine who needs to approve
          // Filter logs to only those created after submittedAt
          const recentLogs = cv.approvalLogs.filter(log => log.createdAt >= cv.submittedAt!);
          
          const hasLevel1 = recentLogs.some(log => log.level === 1 && log.action === ApprovalAction.Approve);
          
          let approversToNotify: Array<{ id: string, email: string }> = [];

          if (!hasLevel1) {
            // Needs Level 1 (TechLead)
            // TechLeads are the ones managing projects that the user is part of
            const techLeadIds = cv.user.projectMembers.map(pm => pm.project.techLeadId);
            const uniqueTechLeadIds = [...new Set(techLeadIds)];
            
            if (uniqueTechLeadIds.length > 0) {
              const techLeads = await prisma.user.findMany({
                where: { id: { in: uniqueTechLeadIds } },
                select: { id: true, email: true },
              });
              approversToNotify = techLeads;
            } else {
              // No TechLead, escalates to HR for Level 1/2? In our logic, HR approves directly if no TechLead.
              approversToNotify = hrUsers;
            }
          } else {
            // Has Level 1, needs Level 2 (HR)
            approversToNotify = hrUsers;
          }

          // Notify approvers
          for (const approver of approversToNotify) {
            // 1. In-App Notification
            await prisma.notification.create({
              data: {
                title: `SLA ${severity}: Pending CV Approval`,
                message: `The CV for ${cv.user.fullName} is ${severity} (waiting for ${Math.floor(hoursDiff)} hours). Please review it.`,
                type: isOverdue ? 'error' : 'warning',
                link: '/workflow',
                userId: approver.id,
                isGlobal: false,
              },
            });

            // 2. Email Notification
            await emailQueue.add('send-reminder', {
              to: approver.email,
              subject: `[SLA ${severity}] Pending CV Approval for ${cv.user.fullName}`,
              body: `The CV submitted by ${cv.user.fullName} has been waiting for ${Math.floor(hoursDiff)} hours. Please review it as soon as possible.`,
            });
          }
          
          count++;
        }
      }

      console.log(`[Cronjob] Processed ${count} SLA warnings/overdues.`);
  } catch (error) {
    console.error('[Cronjob] Error during daily SLA check:', error);
  }
};

export const setupWorkflowCronjobs = () => {
  cron.schedule('0 8 * * *', checkSLA, { timezone: 'Asia/Ho_Chi_Minh' });
  console.log('Workflow SLA Cronjobs are successfully registered.');
};
