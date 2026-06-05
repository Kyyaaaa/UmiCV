import { CVStatus } from '@prisma/client';
import prisma from '../src/config/db';

async function autoApproveAll() {
  console.log('Bắt đầu tìm các CV đang chờ duyệt (PendingApproval)...');
  const pendingCvs = await prisma.cVProfile.findMany({
    where: { status: CVStatus.PendingApproval },
  });

  if (pendingCvs.length === 0) {
    console.log('Không có CV nào đang chờ duyệt.');
    return;
  }

  console.log(`Tìm thấy ${pendingCvs.length} CV. Đang tiến hành Approve...`);

  for (const cv of pendingCvs) {
    const updatedVersion = cv.versionNumber + 1;
    await prisma.$transaction([
      prisma.cVProfile.update({
        where: { id: cv.id },
        data: {
          status: CVStatus.Updated,
          versionNumber: updatedVersion,
          publishedAt: new Date(),
        },
      }),
      prisma.cVVersionHistory.create({
        data: {
          cvProfileId: cv.id,
          versionNumber: updatedVersion,
          snapshotData: cv.sectionsData as any,
        },
      }),
    ]);
    console.log(`✅ Đã approve CV ${cv.id} lên version ${updatedVersion}`);
  }

  console.log('Hoàn tất!');
}

autoApproveAll()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
