import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AlertsController (e2e)', () => {
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

  it('/alerts (GET)', () => {
    return request(app.getHttpServer())
      .get('/alerts')
      .expect(401);
  });

  it('/alerts (POST)', () => {
    return request(app.getHttpServer())
      .post('/alerts')
      .send({ type: 'PRICE', condition: { field: 'price', operator: '>', value: 3000 } })
      .expect(401);
  });
});
