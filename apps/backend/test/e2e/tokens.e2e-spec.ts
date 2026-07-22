import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('TokensController (e2e)', () => {
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

  it('/tokens/search (GET)', () => {
    return request(app.getHttpServer())
      .get('/tokens/search?q=ETH')
      .expect(200);
  });

  it('/tokens/trending (GET)', () => {
    return request(app.getHttpServer())
      .get('/tokens/trending')
      .expect(200);
  });
});
