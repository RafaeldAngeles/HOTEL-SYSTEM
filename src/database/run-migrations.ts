import { AppDataSource } from './data-source';

async function runMigrations() {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  console.log('Migrations executadas com sucesso');
  await AppDataSource.destroy();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Erro ao executar migrations:', err);
  process.exit(1);
});
