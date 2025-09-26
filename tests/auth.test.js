// tests/auth.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRoutes = require('../src/routes/authRoutes');
const authService = require('../src/services/authService');
const usuarioService = require('../src/services/usuarioService');
const refreshTokenService = require('../src/services/refreshTokenService');
const { loginLimiter } = require('../src/middleware/rateLimit');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../src/services/usuarioService');
jest.mock('../src/services/refreshTokenService');
jest.mock('../src/config/db'); // Mock database if needed in usuarioService

// Set up Express app for integration tests
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithPassword', () => {
    const mockUser = {
      idUsuario: 1,
      nombre: 'Juan Pérez',
      email: 'juan@financiera.com',
      password: '$2b$10$hashedpassword',
      idRol: 3,
      estado: 'activo',
    };

    it('should return tokens and user for valid credentials', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockAccessToken');
      refreshTokenService.create.mockResolvedValue('mockRefreshToken');

      const result = await authService.loginWithPassword('juan@financiera.com', 'Password123!');

      expect(usuarioService.findByEmail).toHaveBeenCalledWith('juan@financiera.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { idUsuario: 1, idRol: 3 },
        expect.anything(),
        { algorithm: 'RS256', expiresIn: '1h' }
      );
      expect(refreshTokenService.create).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        user: {
          idUsuario: 1,
          nombre: 'Juan Pérez',
          email: 'juan@financiera.com',
          idRol: 3,
          estado: 'activo',
        },
      });
    });

    it('should throw error for invalid credentials', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.loginWithPassword('juan@financiera.com', 'WrongPassword')).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw error for inactive user', async () => {
      usuarioService.findByEmail.mockResolvedValue({ ...mockUser, estado: 'inactivo' });

      await expect(authService.loginWithPassword('juan@financiera.com', 'Password123!')).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('refreshToken', () => {
    const mockUser = {
      idUsuario: 1,
      nombre: 'Juan Pérez',
      email: 'juan@financiera.com',
      idRol: 3,
      estado: 'activo',
    };

    it('should return new access token for valid refresh token', async () => {
      refreshTokenService.verify.mockResolvedValue({ idUsuario: 1 });
      usuarioService.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockAccessToken');

      const result = await authService.refreshToken('validRefreshToken');

      expect(refreshTokenService.verify).toHaveBeenCalledWith('validRefreshToken');
      expect(usuarioService.findById).toHaveBeenCalledWith(1);
      expect(jwt.sign).toHaveBeenCalledWith(
        { idUsuario: 1, idRol: 3 },
        expect.anything(),
        { algorithm: 'RS256', expiresIn: '1h' }
      );
      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        user: mockUser,
      });
    });

    it('should throw error for inactive user', async () => {
      refreshTokenService.verify.mockResolvedValue({ idUsuario: 1 });
      usuarioService.findById.mockResolvedValue({ ...mockUser, estado: 'inactivo' });

      await expect(authService.refreshToken('validRefreshToken')).rejects.toThrow('Usuario inválido o inactivo');
    });
  });
});

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset rate limiter memory
    loginLimiter.resetKey('test-ip');
  });

  describe('POST /api/auth/login', () => {
    const mockUser = {
      idUsuario: 1,
      nombre: 'Juan Pérez',
      email: 'juan@financiera.com',
      idRol: 3,
      estado: 'activo',
    };

    it('should return 200 with tokens for valid credentials', async () => {
      usuarioService.findByEmail.mockResolvedValue({ ...mockUser, password: '$2b$10$hashedpassword' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockAccessToken');
      refreshTokenService.create.mockResolvedValue('mockRefreshToken');

      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', 'test-ip')
        .send({ email: 'juan@financiera.com', password: 'Password123!' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken',
          user: mockUser,
        },
        message: 'Inicio de sesión exitoso',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      usuarioService.findByEmail.mockResolvedValue({ ...mockUser, password: '$2b$10$hashedpassword' });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', 'test-ip')
        .send({ email: 'juan@financiera.com', password: 'WrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: 'Credenciales inválidas',
        code: 'InvalidCredentials',
      });
    });

    it('should return 400 for invalid payload', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', 'test-ip')
        .send({ email: 'invalid-email', password: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('"email" must be a valid email');
      expect(response.body.error).toContain('"password" is not allowed to be empty');
    });

    it('should return 429 for too many attempts', async () => {
      // Simulate 500 attempts (loginLimiter max)
      for (let i = 0; i < 500; i++) {
        await request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', 'test-ip')
          .send({ email: 'juan@financiera.com', password: 'Password123!' });
      }

      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', 'test-ip')
        .send({ email: 'juan@financiera.com', password: 'Password123!' });

      expect(response.status).toBe(429);
      expect(response.body).toEqual({
        success: false,
        error: 'Demasiados intentos de inicio de sesión, intenta de nuevo más tarde.',
        code: 'TooManyRequests',
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    const mockUser = {
      idUsuario: 1,
      nombre: 'Juan Pérez',
      email: 'juan@financiera.com',
      idRol: 3,
      estado: 'activo',
    };

    it('should return 200 with new access token for valid refresh token', async () => {
      refreshTokenService.verify.mockResolvedValue({ idUsuario: 1 });
      usuarioService.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockAccessToken');

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('X-Forwarded-For', 'test-ip')
        .send({ refreshToken: 'validRefreshToken' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          accessToken: 'mockAccessToken',
          user: mockUser,
        },
        message: 'Token refrescado con éxito',
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      refreshTokenService.verify.mockRejectedValue(new Error('Token inválido'));

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('X-Forwarded-For', 'test-ip')
        .send({ refreshToken: 'invalidRefreshToken' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: 'Token inválido',
        code: 'InvalidToken',
      });
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('X-Forwarded-For', 'test-ip')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('"refreshToken" is required');
    });
  });
});