/**
 * Dashboard API 路由
 */
import { Router } from 'express';
import { incubationStore } from '../../storage/incubation-store';

const router = Router();

/**
 * GET /api/dashboard
 * 获取仪表盘数据
 */
router.get('/', (req, res) => {
  try {
    const stats = incubationStore.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
