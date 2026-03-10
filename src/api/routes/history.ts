/**
 * History API 路由
 */
import { Router } from 'express';
import { incubationStore } from '../../storage/incubation-store';

const router = Router();

/**
 * GET /api/history
 * 获取历史记录（支持筛选、搜索、分页）
 * 
 * Query params:
 * - status: 筛选状态（running/success/failed/cancelled）
 * - date_from: 开始日期（YYYY-MM-DD）
 * - date_to: 结束日期（YYYY-MM-DD）
 * - search: 搜索关键词（skill_id 或 intent）
 * - limit: 每页数量（默认 20）
 * - offset: 偏移量（默认 0）
 */
router.get('/', (req, res) => {
  try {
    const {
      status,
      date_from,
      date_to,
      search,
      limit = '20',
      offset = '0',
    } = req.query;

    // TODO: 实现筛选逻辑
    // 目前返回所有记录
    const result = incubationStore.getAll(Number(limit), Number(offset));

    res.json({
      count: result.total,
      next: Number(offset) + Number(limit) < result.total ? `?offset=${Number(offset) + Number(limit)}&limit=${limit}` : null,
      previous: Number(offset) > 0 ? `?offset=${Math.max(0, Number(offset) - Number(limit))}&limit=${limit}` : null,
      results: result.records,
    });
  } catch (error) {
    console.error('History API error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
