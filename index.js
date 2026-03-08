"use strict";
/**
 * Intelligent Universe (智能宇宙) 主控入口
 * 接收小主人的 NLP 需求，分发给下层工厂(Skill/Agent)孵化，并在沙箱中验证，最后生成提案。
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniverseController = void 0;
exports.execute = execute;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const generator_1 = require("./factories/skill-factory/generator");
const weaver_1 = require("./factories/code-weaver/weaver");
const controller_1 = require("./controllers/test-loop/controller");
const generator_2 = require("./generators/proposal/generator");
class UniverseController {
    constructor() {
        this.skillFactory = new generator_1.SkillFactory();
        this.codeWeaver = new weaver_1.CodeWeaver();
        this.testController = new controller_1.TestLoopController();
        this.proposalGenerator = new generator_2.ProposalGenerator();
    }
    createAsset(intent_1) {
        return __awaiter(this, arguments, void 0, function* (intent, type = 'skill') {
            console.log(`[Universe] 收到创世指令: ${intent}`);
            if (type === 'skill') {
                return this.triggerSkillPipeline(intent);
            }
            throw new Error(`目前仅支持孵化 Skill 哦～`);
        });
    }
    triggerSkillPipeline(intent) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillId = `generated-skill-${Math.floor(Date.now() / 1000)}`;
            console.log(`[Step 1] 启动工厂，生成空白骨架...`);
            const targetDir = this.skillFactory.scaffold(skillId, intent);
            console.log(`[Step 2] 启动 CodeWeaver，唤醒大模型填入业务逻辑...`);
            yield this.codeWeaver.weave(skillId, intent, targetDir);
            console.log(`[Step 3] 启动测试控制阀，送入沙箱角斗场...`);
            const passed = yield this.testController.runWithCircuitBreaker(skillId, intent, targetDir);
            if (!passed) {
                return `❌ 很抱歉小主人，代码多次修复依然未通过沙箱安全测试，为了保护您的系统，流水线已熔断。`;
            }
            console.log(`[Step 4] 测试通过！正在生成集成提案...`);
            const proposalContent = this.proposalGenerator.generateProposal(skillId, intent, targetDir);
            const proposalPath = path.join(__dirname, `proposal-${skillId}.md`);
            fs.writeFileSync(proposalPath, proposalContent);
            return `🎉 智能宇宙成功孵化了一颗新星球！\n提案已生成: ${proposalPath}\n内容:\n${proposalContent}`;
        });
    }
}
exports.UniverseController = UniverseController;
function execute(command, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const controller = new UniverseController();
        if (command === 'create') {
            const type = args[0] || 'skill';
            const intent = args.slice(1).join(' ');
            if (!intent) {
                return "小主人，你要给人家一个具体的需求描述哦，比如：`create skill 帮我做一个定时喝水提醒的小插件`";
            }
            return yield controller.createAsset(intent, type);
        }
        return "未知指令，目前支持: `create <类型> <需求描述>`";
    });
}
