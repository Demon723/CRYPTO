import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('WalletsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/wallets (GET)', () => {
    return request(app.getHttpServer())
      .get('/wallets')
      .expect(401);
  });

  it('/wallets (POST)', () => {
    return request(app.getHttpServer())
      .post('/wallets')
      .send({ address: '0x123', chain: 'ETHEREUM' })
      .expect(401);
  });
});
