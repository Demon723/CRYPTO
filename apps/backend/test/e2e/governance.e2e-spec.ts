import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('GovernanceController (e2e)', () => {
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

  it('/governance/proposals (GET)', () => {
    return request(app.getHttpServer())
      .get('/governance/proposals')
      .expect(200);
  });

  it('/governance/votes (GET)', () => {
    return request(app.getHttpServer())
      .get('/governance/votes')
      .expect(401);
  });

  it('/governance/vote (POST)', () => {
    return request(app.getHttpServer())
      .post('/governance/vote')
      .send({ proposalId: 'test-proposal', choice: 'FOR' })
      .expect(401);
  });
});
