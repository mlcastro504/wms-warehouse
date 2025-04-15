import express from 'express';
import { PrismaClient } from '@prisma/client';
import { tenantMiddleware } from '../middleware/tenant';

const prisma = new PrismaClient();
const router = express.Router();

router.use(tenantMiddleware);

router.post('/', async (req, res) => {
  try {
    const { level, message, stack, context } = req.body;
    
    await prisma.log.create({
      data: {
        level,
        message,
        stack,
        context: context ? JSON.stringify(context) : undefined,
        tenantId: req.tenant?.id
      }
    });

    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to save log' });
  }
});

router.get('/', async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      where: { tenantId: req.tenant?.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;
