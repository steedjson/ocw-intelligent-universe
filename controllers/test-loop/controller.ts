/**
 * TestLoopController - 生死擂台控制阀
 * 
 * 职责:
 * 管理插件的测试流程，如果测试失败，尝试引导 CodeWeaver 修复。
 * 最多重试 3 次，防止系统死锁。
 */

import { SandboxIsolator } from '../../sandbox/isolator';
import { CodeWeaver } from '../../factories/code-weaver/weaver';

export class TestLoopController {
  private maxRetries: number = 3;
  private isolator: SandboxIsolator;
  private weaver: CodeWeaver;

  constructor() {
    this.isolator = new SandboxIsolator();
    this.weaver = new CodeWeaver();
  }

  public async runWithCircuitBreaker(skillId: string, intent: string, targetDir: string): Promise<boolean> {
    let attempts = 0;
    
    while (attempts <= this.maxRetries) {
      console.log(`[TestLoopController] 第 ${attempts + 1} 次尝试隔离测试 ${skillId}...`);
      
      const isSafe = this.isolator.runTests(targetDir);
      
      if (isSafe) {
        console.log(`✅ [TestLoopController] 测试通过！`);
        return true;
      }
      
      attempts++;
      console.error(`❌ [TestLoopController] 测试失败，准备尝试打回重修...`);
      
      if (attempts <= this.maxRetries) {
        console.log(`[TestLoopController] 正在请求 CodeWeaver 修复代码 (尝试 ${attempts}/${this.maxRetries})`);
        const fixIntent = intent + `\n【附加指令】上一次测试失败了，请检查逻辑漏洞。`;
        await this.weaver.weave(skillId, fixIntent, targetDir);
      }
    }
    
    console.error(`🚨 [TestLoopController] 熔断器触发！代码连续 ${this.maxRetries} 次测试不通过，已阻断！`);
    return false;
  }
}
