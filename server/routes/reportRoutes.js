import { Router } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validateReportInput } from '../middleware/validator.js';
import { generateReport } from '../services/aiService.js';

const router = Router();

/**
 * POST /api/reports/generate
 * Generates an AI-structured civic report from raw observation details.
 */
router.post('/generate', rateLimiter, validateReportInput, async (req, res, next) => {
  try {
    const report = await generateReport(req.sanitizedBody);
    return res.status(200).json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
