import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import urlRoutes from './modules/urls/url.routes';

export function createApp() {
  const app = express();

  // Trust reverse proxy (Cloudflare / Nginx / ELB)
  app.set('trust proxy', 1);
  
  // Security headers
  app.use(helmet());

  // CORS (adjust later for production)
  app.use(cors());

  // Parse JSON
  app.use(express.json());

  // API routes
  app.use('/api', urlRoutes);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}
