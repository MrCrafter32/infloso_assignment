const request = require('supertest');

jest.mock('../middlewares/ratelimit.middleware', () => (req, res, next) => next());

const mockFindUserbyEmail = jest.fn();
const mockFindUserbyId = jest.fn();
const mockFindUserbyUsername = jest.fn();

jest.mock('../lib/findUser', () => ({
  findUserbyEmail: (...args) => mockFindUserbyEmail(...args),
  findUserbyId: (...args) => mockFindUserbyId(...args),
  findUserbyUsername: (...args) => mockFindUserbyUsername(...args)
}));

const mockSendToken = jest.fn();

jest.mock('../lib/sendToken', () => ({
  sendToken: (...args) => mockSendToken(...args)
}));

const mockPrisma = {
  user: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn()
  },
  userTokens: {
    findUnique: jest.fn(),
    delete: jest.fn(),
    create: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
  compareSync: jest.fn(() => true)
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'jwt-token'),
  verify: jest.fn()
}));

const app = require('../app');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  mockSendToken.mockImplementation((res, userId, statusCode) => {
    return res.status(statusCode).json({ success: true, userId });
  });
  jsonwebtoken.verify.mockImplementation((token, secret, cb) => {
    if (typeof cb === 'function') {
      return cb(null, { userId: 'user-1' });
    }
    return { userId: 'user-1' };
  });
});

describe('Auth API', () => {
  test('POST /api/auth/signup creates user and sends token', async () => {
    mockFindUserbyEmail.mockResolvedValue(null);
    mockFindUserbyUsername.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'a@b.com',
        username: 'alpha',
        firstName: 'A',
        lastName: 'B',
        password: 'Secret123!'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(mockSendToken).toHaveBeenCalledWith(
      expect.any(Object),
      'user-1',
      201,
      'a@b.com',
      'verify-email'
    );
  });

  test('POST /api/auth/login returns token for verified user', async () => {
    mockFindUserbyEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.com',
      password: 'hashed-password',
      isVerified: true
    });
    bcrypt.compareSync.mockReturnValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'Secret123!' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('jwt-token');
    expect(response.body.user.email).toBe('a@b.com');
  });

  test('POST /api/auth/verify-email verifies email', async () => {
    mockPrisma.userTokens.findUnique.mockResolvedValue({
      userId: 'user-1',
      emailVerificationToken: 'hashed-token'
    });
    bcrypt.compareSync.mockReturnValue(true);
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.userTokens.delete.mockResolvedValue({});

    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: 'plain-token' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Email verified successfully');
  });

  test('POST /api/auth/forgot-password sends reset token', async () => {
    mockFindUserbyEmail.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'a@b.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockSendToken).toHaveBeenCalledWith(
      expect.any(Object),
      'user-1',
      200,
      'a@b.com',
      'reset-password'
    );
  });

  test('POST /api/auth/reset-password resets password', async () => {
    mockPrisma.userTokens.findUnique.mockResolvedValue({
      userId: 'user-1',
      passwordResetToken: 'reset-token'
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.userTokens.delete.mockResolvedValue({});

    const response = await request(app)
      .post('/api/auth/reset-password?token=reset-token')
      .send({ newPassword: 'new-secret' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password reset successfully');
    expect(mockPrisma.user.update).toHaveBeenCalled();
  });

  test('POST /api/auth/resend-verification-email sends token', async () => {
    mockFindUserbyEmail.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

    const response = await request(app)
      .post('/api/auth/resend-verification-email')
      .send({ email: 'a@b.com', type: 'verify-email' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/auth/me returns user details when authorized', async () => {
    mockFindUserbyId.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('a@b.com');
  });

  test('GET /api/auth/me rejects missing token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized: No token provided');
  });

  test('GET /api/auth/logout returns success when authorized', async () => {
    mockFindUserbyId.mockResolvedValue({ id: 'user-1' });

    const response = await request(app)
      .get('/api/auth/logout')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logout successful');
  });
});
