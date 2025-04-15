import express from 'express';
import { diagnoseErrors, autoFix } from '../utils/diagnose';
import { tenantMiddleware } from '../middleware/tenant';

const router = express.Router();

router.use(tenantMiddleware);

router.get('/diagnose', async (req, res) => {
  try {
    const diagnosis = await diagnoseErrors(req);
    await autoFix(diagnosis);
    
    res.json({
      status: diagnosis.length ? 'issues_found' : 'healthy',
      issues: diagnosis
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Diagnosis failed',
      details: error.message 
    });
  }
});

export default router;
