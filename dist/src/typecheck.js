"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function _getTypeName(fn) {
    var _a;
    return (fn.name || ((_a = fn.toString().match(/function (.*?)\s*\(/)) === null || _a === void 0 ? void 0 : _a[1]) || "unknown");
}
function typecheck(type, value) {
    if (type(value))
        return true;
    const tname = _getTypeName(type);
    throw new Error("check type " + tname + " failed, invalid value " + value);
}
exports.default = typecheck;
//# sourceMappingURL=typecheck.js.map