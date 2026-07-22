import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('StakingController (e2e)', () => {
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

  it('/staking/positions (GET)', () => {
    return request(app.getHttpServer())
      .get('/staking/positions')
      .expect(401);
  });

  it('/staking/stats (GET)', () => {
    return request(app.getHttpServer())
      .get('/staking/stats')
      .expect(401);
  });

  it('/staking/stake (POST)', () => {
    return request(app.getHttpServer())
      .post('/staking/stake')
      .send({ walletId: 'test-wallet', amount: '1000' })
      .expect(401);
  });
});
