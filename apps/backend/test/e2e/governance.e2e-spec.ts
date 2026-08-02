import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('GovernanceController (e2e)', () => {
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

  it('/governance/proposals (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/governance/proposals')
      .expect(200);
  });

  it('/governance/votes (GET) - should require authentication', () => {
    return request(app.getHttpServer())
      .get('/api/v1/governance/votes')
      .expect(401);
  });

  it('/governance/vote (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/api/v1/governance/vote')
      .send({ proposalId: 'test-proposal', choice: 'FOR' })
      .expect(401);
  });
});
