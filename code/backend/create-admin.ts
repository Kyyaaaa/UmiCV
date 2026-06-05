import prisma from './src/config/db';
import bcrypt from 'bcrypt';

async function main() {
  try {
    const adminPassword = await bcrypt.hash('123456', 10);

    // Check if department exists or create it
    let dept = await prisma.department.findFirst({
      where: { code: 'ADMIN' }
    });

    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: 'Administrator',
          code: 'ADMIN'
        }
      });
      console.log('Created Admin department');
    }

    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        passwordHash: adminPassword,
        role: 'Admin',
        departmentId: dept.id,
        email: 'admin@umicv.local',
        fullName: 'System Administrator'
      },
      create: {
        username: 'admin',
        passwordHash: adminPassword,
        role: 'Admin',
        departmentId: dept.id,
        email: 'admin@umicv.local',
        fullName: 'System Administrator'
      }
    });

    console.log('Admin account created/updated successfully:', admin.username);
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
