/**
 * Settings API 路由
 */
import { Router } from 'express';

const router = Router();

// 默认配置
let config = {
  max_retries: 3,
  timeout_seconds: 600,
  sandbox_enabled: true,
  agent_selection: 'auto',
};

/**
 * GET /api/settings
 * 获取配置
 */
router.get('/', (req, res) => {
  res.json(config);
});

/**
 * PUT /api/settings
 * 更新配置
 */
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    
    // 验证配置
    if (updates.max_retries !== undefined) {
      if (typeof updates.max_retries !== 'number' || updates.max_retries < 0) {
        return res.status(400).json({ error: 'max_retries must be a non-negative number' });
      }
      config.max_retries = updates.max_retries;
    }

    if (updates.timeout_seconds !== undefined) {
      if (typeof updates.timeout_seconds !== 'number' || updates.timeout_seconds < 60) {
        return res.status(400).json({ error: 'timeout_seconds must be >= 60' });
      }
      config.timeout_seconds = updates.timeout_seconds;
    }

    if (updates.sandbox_enabled !== undefined) {
      if (typeof updates.sandbox_enabled !== 'boolean') {
        return res.status(400).json({ error: 'sandbox_enabled must be a boolean' });
      }
      config.sandbox_enabled = updates.sandbox_enabled;
    }

    if (updates.agent_selection !== undefined) {
      if (!['auto', 'manual'].includes(updates.agent_selection)) {
        return res.status(400).json({ error: 'agent_selection must be "auto" or "manual"' });
      }
      config.agent_selection = updates.agent_selection;
    }

    res.json(config);
  } catch (error) {
    console.error('Settings API error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
