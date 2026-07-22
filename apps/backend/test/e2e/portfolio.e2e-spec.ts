import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('PortfolioController (e2e)', () => {
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

  it('/portfolio/summary (GET)', () => {
    return request(app.getHttpServer())
      .get('/portfolio/summary')
      .expect(401);
  });

  it('/portfolio/allocation (GET)', () => {
    return request(app.getHttpServer())
      .get('/portfolio/allocation')
      .expect(401);
  });
});
