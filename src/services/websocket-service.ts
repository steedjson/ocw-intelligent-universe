/**
 * WebSocket 服务
 * 
 * 实时推送 Skill 孵化事件
 */
import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';

export type WSEvent = 
  | { type: 'task_started'; data: { skill_id: string; intent: string } }
  | { type: 'stage_updated'; data: { skill_id: string; stage: string; progress: number } }
  | { type: 'task_completed'; data: { skill_id: string; status: string; duration_seconds: number } };

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  /**
   * 广播事件给所有客户端
   */
  broadcast(event: WSEvent) {
    const message = JSON.stringify(event);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * 发送任务开始事件
   */
  taskStarted(skill_id: string, intent: string) {
    this.broadcast({
      type: 'task_started',
      data: { skill_id, intent },
    });
  }

  /**
   * 发送阶段更新事件
   */
  stageUpdated(skill_id: string, stage: string, progress: number) {
    this.broadcast({
      type: 'stage_updated',
      data: { skill_id, stage, progress },
    });
  }

  /**
   * 发送任务完成事件
   */
  taskCompleted(skill_id: string, status: string, duration_seconds: number) {
    this.broadcast({
      type: 'task_completed',
      data: { skill_id, status, duration_seconds },
    });
  }
}
