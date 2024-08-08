"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = void 0;
const ops_1 = __importDefault(require("./ops"));
const map = {};
exports.map = map;
for (const op in ops_1.default) {
    const code = ops_1.default[op];
    map[code] = op;
}
//# sourceMappingURL=map.js.map