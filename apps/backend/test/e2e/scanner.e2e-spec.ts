import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('ScannerController (e2e)', () => {
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

  it('/scanner/analyze (POST)', () => {
    return request(app.getHttpServer())
      .post('/scanner/analyze')
      .send({ address: '0x1234567890123456789012345678901234567890', chain: 'ETHEREUM' })
      .expect(401);
  });

  it('/scanner/analysis/:address (GET)', () => {
    return request(app.getHttpServer())
      .get('/scanner/analysis/0x1234567890123456789012345678901234567890?chain=ETHEREUM')
      .expect(401);
  });
});
