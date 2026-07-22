import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function createTestingModule(moduleMetadata: Parameters<typeof Test.createTestingModule>[0]): Promise<{ module: TestingModule; app: INestApplication }> {
  const moduleRef = Test.createTestingModule(moduleMetadata);
  const app = (await moduleRef.compile()).createNestApplication();
  app.useGlobalPipes(new (require('@nestjs/common').ValidationPipe)({ whitelist: true }));
  await app.init();
  return { module: moduleRef, app };
}

export function createTest<T>(factory: () => T): () => T {
  return factory;
}
