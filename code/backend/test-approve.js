const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { WorkflowService } = require('./src/modules/workflow/workflow.service');
const workflowService = new WorkflowService();

async function test() {
  try {
    const cv = await prisma.cVProfile.findFirst({ where: { status: 'PendingApproval' } });
    if (!cv) {
      console.log('No pending CVs found');
      return;
    }
    console.log('Found CV:', cv.id);
    
    // Find an approver (TechLead or HR)
    const approver = await prisma.user.findFirst({ where: { role: { in: ['TechLead', 'HR'] } } });
    if (!approver) {
      console.log('No approvers found');
      return;
    }
    console.log('Found Approver:', approver.id, approver.role);
    
    const level = approver.role === 'HR' ? 2 : 1;
    
    await workflowService.approveCV(cv.id, approver.id, { level });
    console.log('Approved successfully');
  } catch (err) {
    console.error('Error occurred:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
