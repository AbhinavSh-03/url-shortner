import { createApp } from './app';
import { env } from './config/env';
import { pool } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './shared/logger';
import './workers/click.worker';

async function bootstrap() {
  try {
    await pool.query('SELECT 1');
    logger.info('PostgreSQL connected');

    await connectRedis();
    logger.info('Redis connected');

    const app = createApp();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.fatal(error, 'Startup failed');
    process.exit(1);
  }
}

bootstrap();
