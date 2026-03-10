/**
 * 孵化记录存储层（JSON 文件版本）
 * 
 * 使用 JSON 文件存储 Skill 孵化记录
 */
import fs from 'fs';
import path from 'path';

export interface IncubationRecord {
  id: number;
  skill_id: string;
  intent: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  stage: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_skills: number;
  success_rate: number;
  avg_duration_seconds: number;
  active_tasks: IncubationRecord[];
  stats: {
    success_trend: Array<{ date: string; count: number }>;
    duration_distribution: { min: number; max: number; avg: number };
    failure_reasons: Array<{ reason: string; count: number }>;
  };
}

export class IncubationStore {
  private dataPath: string;
  private records: IncubationRecord[] = [];
  private nextId: number = 1;

  constructor(dataPath: string = './data/incubation.json') {
    this.dataPath = dataPath;
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf-8');
        const parsed = JSON.parse(data);
        this.records = parsed.records || [];
        this.nextId = parsed.nextId || 1;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.records = [];
      this.nextId = 1;
    }
  }

  private save() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify({ records: this.records, nextId: this.nextId }, null, 2));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // 创建记录
  create(record: Omit<IncubationRecord, 'id' | 'created_at' | 'updated_at'>): IncubationRecord {
    const now = new Date().toISOString();
    const newRecord: IncubationRecord = {
      ...record,
      id: this.nextId++,
      created_at: now,
      updated_at: now,
    };

    this.records.push(newRecord);
    this.save();
    return newRecord;
  }

  // 获取单条记录
  getById(id: number): IncubationRecord | null {
    return this.records.find(r => r.id === id) || null;
  }

  // 获取所有记录（分页）
  getAll(limit: number = 20, offset: number = 0): { total: number; records: IncubationRecord[] } {
    const sorted = [...this.records].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    const total = sorted.length;
    const records = sorted.slice(offset, offset + limit);
    return { total, records };
  }

  // 更新记录状态
  updateStatus(id: number, status: IncubationRecord['status'], stage: string, progress: number) {
    const record = this.records.find(r => r.id === id);
    if (record) {
      record.status = status;
      record.stage = stage;
      record.progress = progress;
      record.updated_at = new Date().toISOString();
      this.save();
    }
  }

  // 完成记录
  complete(id: number, status: 'success' | 'failed', duration_seconds: number, error_message?: string) {
    const record = this.records.find(r => r.id === id);
    if (record) {
      record.status = status;
      record.completed_at = new Date().toISOString();
      record.duration_seconds = duration_seconds;
      record.error_message = error_message;
      record.progress = 1;
      record.updated_at = new Date().toISOString();
      this.save();
    }
  }

  // 获取活跃任务
  getActiveTasks(): IncubationRecord[] {
    return this.records.filter(r => r.status === 'running');
  }

  // 获取 Dashboard 统计
  getDashboardStats(): DashboardStats {
    const total_skills = this.records.length;
    const success_count = this.records.filter(r => r.status === 'success').length;
    const success_rate = total_skills > 0 ? success_count / total_skills : 0;
    
    const durations = this.records.filter(r => r.duration_seconds !== undefined).map(r => r.duration_seconds!);
    const avg_duration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const active_tasks = this.getActiveTasks();

    // 成功趋势（近 7 天）
    const success_trend: Array<{ date: string; count: number }> = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = this.records.filter(r => 
        r.status === 'success' && r.started_at.startsWith(dateStr)
      ).length;
      success_trend.push({ date: dateStr, count });
    }

    // 耗时分布
    const duration_distribution = {
      min: durations.length > 0 ? Math.min(...durations) : 0,
      max: durations.length > 0 ? Math.max(...durations) : 0,
      avg: Math.round(avg_duration),
    };

    // 失败原因
    const failureReasons = new Map<string, number>();
    this.records.filter(r => r.status === 'failed' && r.error_message).forEach(r => {
      const msg = r.error_message!;
      failureReasons.set(msg, (failureReasons.get(msg) || 0) + 1);
    });
    const failure_reasons = Array.from(failureReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_skills,
      success_rate,
      avg_duration_seconds: Math.round(avg_duration),
      active_tasks,
      stats: {
        success_trend,
        duration_distribution,
        failure_reasons,
      },
    };
  }

  // 关闭（无需操作）
  close() {}
}

// 导出单例
export const incubationStore = new IncubationStore();
