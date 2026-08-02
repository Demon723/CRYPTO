import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AlertsController (e2e)', () => {
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

  it('/alerts (GET) - should require authentication', () => {
    return request(app.getHttpServer())
      .get('/api/v1/alerts')
      .expect(401);
  });

  it('/alerts (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/api/v1/alerts')
      .send({ type: 'PRICE', condition: { field: 'price', operator: '>', value: 3000 } })
      .expect(401);
  });
});
