"use strict";
/**
 * TestLoopController - 生死擂台控制阀
 *
 * 职责:
 * 管理插件的测试流程，如果测试失败，尝试引导 CodeWeaver 修复。
 * 最多重试 3 次，防止系统死锁。
 */
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
exports.TestLoopController = void 0;
const isolator_1 = require("../../sandbox/isolator");
const weaver_1 = require("../../factories/code-weaver/weaver");
class TestLoopController {
    constructor() {
        this.maxRetries = 3;
        this.isolator = new isolator_1.SandboxIsolator();
        this.weaver = new weaver_1.CodeWeaver();
    }
    runWithCircuitBreaker(skillId, intent, targetDir) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    yield this.weaver.weave(skillId, fixIntent, targetDir);
                }
            }
            console.error(`🚨 [TestLoopController] 熔断器触发！代码连续 ${this.maxRetries} 次测试不通过，已阻断！`);
            return false;
        });
    }
}
exports.TestLoopController = TestLoopController;
