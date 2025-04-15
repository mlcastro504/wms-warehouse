import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './utils/logger';
import { tenantMiddleware } from './middleware/tenant';
import logsRouter from './routes/logs';
import diagnoseRouter from './routes/diagnose';

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: 'http://localhost:5174'
}));
app.use(express.json());
app.use(tenantMiddleware);

app.use('/api/logs', logsRouter);
app.use('/api/diagnose', diagnoseRouter);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(err, req, res);
});

app.get('/', (req, res) => {
  res.send('WMS API Running');
});

const PORT = 3001;
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server running on port ${PORT}`);
    
    // Auto-diagnose on startup
    const { diagnoseErrors, autoFix } = await import('./utils/diagnose');
    const issues = await diagnoseErrors();
    if (issues.length) {
      console.log('Found startup issues:', issues);
      await autoFix(issues);
    }
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
});
