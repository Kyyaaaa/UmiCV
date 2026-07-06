import prisma from './src/config/db';
import bcrypt from 'bcrypt';

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  await prisma.user.updateMany({
    data: { passwordHash: hash }
  });
  console.log('All passwords reset to 123456');
}
main().catch(console.error).finally(() => prisma.$disconnect());
