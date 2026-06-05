import { prismaMock } from '../../../__tests__/prismaMock';
import { UserService } from '../user.service';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';
import { UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  const validUserId = '550e8400-e29b-41d4-a716-446655440000';
  const validDeptId = '550e8400-e29b-41d4-a716-446655440001';
  const notFoundId = '550e8400-e29b-41d4-a716-446655440002';

  const mockUser = {
    id: validUserId,
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    passwordHash: 'hashed_password',
    role: UserRole.Employee,
    status: UserStatus.Active,
    departmentId: validDeptId,
    lockedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  describe('getUserById', () => {
    it('should return user without passwordHash', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await userService.getUserById(validUserId);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw NotFoundError if user not found', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(null);

      await expect(userService.getUserById(notFoundId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create user and hash password', async () => {
      (prismaMock.user.findFirst as any).mockResolvedValue(null);
      (prismaMock.user.create as any).mockResolvedValue(mockUser);

      const data = {
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        role: UserRole.Employee,
        departmentId: validDeptId,
      };

      const result = await userService.createUser(data);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          username: 'testuser',
          passwordHash: 'hashed_password',
        }),
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw BadRequestError if user exists', async () => {
      (prismaMock.user.findFirst as any).mockResolvedValue(mockUser);

      const data = {
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        role: UserRole.Employee,
        departmentId: validDeptId,
      };

      await expect(userService.createUser(data)).rejects.toThrow(BadRequestError);
    });
  });

  describe('lockUser', () => {
    it('should set status to Locked and update lockedAt', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);
      (prismaMock.user.update as any).mockResolvedValue({
        ...mockUser,
        status: UserStatus.Locked,
        lockedAt: new Date(),
      });

      const result = await userService.lockUser(validUserId);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: validUserId },
        data: {
          status: UserStatus.Locked,
          lockedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe(UserStatus.Locked);
    });
  });

  describe('changeRole', () => {
    it('should update user role', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);
      (prismaMock.user.update as any).mockResolvedValue({
        ...mockUser,
        role: UserRole.Admin,
      });

      const result = await userService.changeRole(validUserId, UserRole.Admin);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: validUserId },
        data: { role: UserRole.Admin },
      });
      expect(result.role).toBe(UserRole.Admin);
    });
  });
});
