import prisma from '../config/db';
import bcrypt from 'bcrypt';

async function main() {
  const defaultPassword = '123123123@As';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const result = await prisma.user.updateMany({
    data: {
      passwordHash: hashedPassword,
    },
  });

  console.log(`Successfully reset passwords for ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
