/**
 * Intelligent Universe (智能宇宙) 主控入口
 * 接收小主人的 NLP 需求，分发给下层工厂(Skill/Agent)孵化，并在沙箱中验证，最后生成提案。
 */

import * as fs from 'fs';
import * as path from 'path';
import { SkillFactory } from './factories/skill-factory/generator';
import { CodeWeaver } from './factories/code-weaver/weaver';
import { TestLoopController } from './controllers/test-loop/controller';
import { ProposalGenerator } from './generators/proposal/generator';

export class UniverseController {
  private skillFactory: SkillFactory;
  private codeWeaver: CodeWeaver;
  private testController: TestLoopController;
  private proposalGenerator: ProposalGenerator;

  constructor() {
    this.skillFactory = new SkillFactory();
    this.codeWeaver = new CodeWeaver();
    this.testController = new TestLoopController();
    this.proposalGenerator = new ProposalGenerator();
  }

  public async createAsset(intent: string, type: 'skill' | 'agent' | 'config' = 'skill') {
    console.log(`[Universe] 收到创世指令: ${intent}`);
    
    if (type === 'skill') {
      return this.triggerSkillPipeline(intent);
    }
    
    throw new Error(`目前仅支持孵化 Skill 哦～`);
  }

  private async triggerSkillPipeline(intent: string) {
    const skillId = `generated-skill-${Math.floor(Date.now() / 1000)}`;
    
    console.log(`[Step 1] 启动工厂，生成空白骨架...`);
    const targetDir = this.skillFactory.scaffold(skillId, intent);
    
    console.log(`[Step 2] 启动 CodeWeaver，唤醒大模型填入业务逻辑...`);
    await this.codeWeaver.weave(skillId, intent, targetDir);
    
    console.log(`[Step 3] 启动测试控制阀，送入沙箱角斗场...`);
    const passed = await this.testController.runWithCircuitBreaker(skillId, intent, targetDir);
    
    if (!passed) {
      return `❌ 很抱歉小主人，代码多次修复依然未通过沙箱安全测试，为了保护您的系统，流水线已熔断。`;
    }
    
    console.log(`[Step 4] 测试通过！正在生成集成提案...`);
    const proposalContent = this.proposalGenerator.generateProposal(skillId, intent, targetDir);
    
    const proposalPath = path.join(__dirname, `proposal-${skillId}.md`);
    fs.writeFileSync(proposalPath, proposalContent);
    
    return `🎉 智能宇宙成功孵化了一颗新星球！\n提案已生成: ${proposalPath}\n内容:\n${proposalContent}`;
  }
}

export async function execute(command: string, args: string[]) {
  const controller = new UniverseController();
  
  if (command === 'create') {
    const type = (args[0] as 'skill' | 'agent' | 'config') || 'skill';
    const intent = args.slice(1).join(' ');
    
    if (!intent) {
      return "小主人，你要给人家一个具体的需求描述哦，比如：`create skill 帮我做一个定时喝水提醒的小插件`";
    }
    
    return await controller.createAsset(intent, type);
  }
  
  return "未知指令，目前支持: `create <类型> <需求描述>`";
}
