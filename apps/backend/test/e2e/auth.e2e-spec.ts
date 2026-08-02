import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new (require('@nestjs/common').ValidationPipe)({ 
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a new user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'Test123!' })
      .expect(201);
  });

  it('/auth/login (POST) - should login with valid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' })
      .expect(200);
  });

  it('/auth/register (POST) - should reject duplicate email', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'Test123!' })
      .expect(409);
  });

  it('/auth/pin/set (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/pin/set')
      .send({ pin: '123456' })
      .expect(401);
  });
});
