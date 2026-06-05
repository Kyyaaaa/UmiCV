import { prismaMock } from '../../../__tests__/prismaMock';
import { AuthService } from '../auth.service';
import { verifyPassword } from '../../../utils/hash.util';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../../utils/jwt.util';
import { UnauthorizedError } from '../../../errors/AppError';
import { redisClient } from '../../../config/redis';

jest.mock('../../../utils/hash.util');
jest.mock('../../../utils/jwt.util');
jest.mock('../../../config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setex: jest.fn(),
  }
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        passwordHash: 'hashed-pass',
        role: 'Employee' as any,
        departmentId: 'dept-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        department: { id: 'dept-id', name: 'IT' },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const result = await authService.login({ username: 'testuser', password: 'password' });

      expect(result).toEqual({
        user: {
          id: 'user-id',
          username: 'testuser',
          role: 'Employee',
          department: 'IT',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { username: 'testuser' }, include: { department: true } });
    });

    it('should throw UnauthorizedError if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.login({ username: 'testuser', password: 'password' }))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password does not match', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-id', passwordHash: 'hash', deletedAt: null } as any);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({ username: 'testuser', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null); // not blacklisted
      (verifyToken as jest.Mock).mockReturnValue({ userId: 'user-id' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-id', role: 'Employee', deletedAt: null } as any);
      (generateAccessToken as jest.Mock).mockReturnValue('new-access-token');

      const result = await authService.refresh('valid-refresh-token');

      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should throw UnauthorizedError if token is blacklisted', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue('blacklisted');

      await expect(authService.refresh('blacklisted-token'))
        .rejects.toThrow(new UnauthorizedError('Token has been revoked'));
    });
  });

  describe('logout', () => {
    it('should add token to blacklist', async () => {
      (verifyToken as jest.Mock).mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
      
      await authService.logout('refresh-token');

      expect(redisClient.setex).toHaveBeenCalledWith('bl_refresh-token', expect.any(Number), 'blacklisted');
    });
  });
});
