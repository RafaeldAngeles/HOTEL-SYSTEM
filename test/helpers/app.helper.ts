import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AllExceptionsFilter } from 'src/common/filters/http-exception.filter';
import { DataSource } from 'typeorm';

export async function createTestApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();

  const dataSource = module.get(DataSource);

  return { app, dataSource };
}

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const entity of dataSource.entityMetadatas) {
    await dataSource.getRepository(entity.name).clear();
  }
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
}
