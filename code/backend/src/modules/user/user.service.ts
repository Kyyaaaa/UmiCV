import prisma from '../../config/db';
import { UserRole, UserStatus, Prisma } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../errors/AppError';
import bcrypt from 'bcrypt';
import { MESSAGES } from '../../constants/messages';

// Helper to exclude fields
function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  const result = { ...user };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export class UserService {
  async getUsers(params: {
    page: number;
    limit: number;
    keyword?: string;
    role?: UserRole;
    status?: UserStatus;
    departmentId?: string;
  }) {
    const { page, limit, keyword, role, status, departmentId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(status && { status }),
      ...(departmentId && { departmentId }),
      ...(keyword && {
        OR: [
          { email: { contains: keyword, mode: 'insensitive' } },
          { fullName: { contains: keyword, mode: 'insensitive' } },
          { username: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
      deletedAt: null,
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      data: users.map((user) => exclude(user, ['passwordHash'])),
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        department: true,
      },
    });

    if (!user) {
      throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
    }

    return exclude(user, ['passwordHash']);
  }

  async createUser(data: any) {
    const { username, email, fullName, password, role, departmentId } = data;

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existing) {
      throw new BadRequestError(MESSAGES.USER.EXISTS);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        passwordHash,
        role,
        departmentId,
        status: UserStatus.Active,
      },
    });

    return exclude(user, ['passwordHash']);
  }

  async updateUser(id: string, data: any) {
    // Ensure user exists
    await this.getUserById(id);

    try {
      const user = await prisma.user.update({
        where: { id },
        data,
      });
      return exclude(user, ['passwordHash']);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestError(MESSAGES.USER.EXISTS);
        }
      }
      throw error;
    }
  }

  async lockUser(id: string) {
    const targetUser = await this.getUserById(id);
    if (targetUser.role === 'Admin') {
      throw new BadRequestError('Không thể khóa tài khoản Quản trị viên');
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.Locked,
        lockedAt: new Date(),
      },
    });
    return exclude(user, ['passwordHash']);
  }

  async unlockUser(id: string) {
    await this.getUserById(id);
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.Active,
        lockedAt: null,
      },
    });
    return exclude(user, ['passwordHash']);
  }

  async resetPassword(id: string, newPassword: string) {
    await this.getUserById(id);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    return exclude(user, ['passwordHash']);
  }

  async changeRole(id: string, role: UserRole) {
    await this.getUserById(id);
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });
    return exclude(user, ['passwordHash']);
  }

  async updateMe(id: string, data: { fullName?: string; email?: string }) {
    await this.getUserById(id);
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new BadRequestError('Email đã được sử dụng bởi người khác');
      }
    }
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return exclude(user, ['passwordHash']);
  }

  async changeMyPassword(id: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundError(MESSAGES.USER.NOT_FOUND);

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestError('Mật khẩu hiện tại không chính xác');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    return exclude(updatedUser, ['passwordHash']);
  }
}
