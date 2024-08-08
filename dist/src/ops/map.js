"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = void 0;
const OPS = require("./ops.json");
const map = {};
exports.map = map;
for (const op in OPS) {
    const code = OPS[op];
    map[code] = op;
}
//# sourceMappingURL=map.js.map