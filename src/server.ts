import { createApp } from './app';
import { env } from './config/env';
import { pool } from './config/database';
import { connectRedis } from './config/redis';
import './workers/click.worker';

async function bootstrap() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');

    await connectRedis();
    console.log('Redis connected');

    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
}

bootstrap();
