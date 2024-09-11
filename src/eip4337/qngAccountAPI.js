"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QngAccountAPI = exports.BaseAccountAPI = exports.HttpRpcClient = exports.PaymasterAPI = void 0;
Object.defineProperty(exports, "__esModule", { value: true });
var contracts_1 = require("@qng/eip4337-contracts");
var ethers_1 = require("ethers");
var baseAccountAPI_1 = require("./baseAccountAPI");
Object.defineProperty(exports, "BaseAccountAPI", { enumerable: true, get: function () { return baseAccountAPI_1.BaseAccountAPI; } });
Object.defineProperty(exports, "PaymasterAPI", { enumerable: true, get: function () { return baseAccountAPI_1.PaymasterAPI; } });
Object.defineProperty(exports, "HttpRpcClient", { enumerable: true, get: function () { return baseAccountAPI_1.HttpRpcClient; } });
/**
 * An implementation of the BaseAccountAPI using the QngAccount contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
var QngAccountAPI = /** @class */ (function (_super) {
    __extends(QngAccountAPI, _super);
    function QngAccountAPI(params) {
        var _a;
        var _this = _super.call(this, params) || this;
        _this.factoryAddress = params.factoryAddress;
        _this.owner = params.owner;
        _this.index = ethers_1.ethers.BigNumber.from((_a = params.index) !== null && _a !== void 0 ? _a : 0);
        return _this;
    }
    QngAccountAPI.prototype._getAccountContract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!(this.accountContract == null)) return [3 /*break*/, 2];
                        _b = this;
                        _d = (_c = contracts_1.QngAccount__factory).connect;
                        return [4 /*yield*/, this.getAccountAddress()];
                    case 1:
                        _b.accountContract = _d.apply(_c, [_e.sent(), this.provider]);
                        _e.label = 2;
                    case 2: return [2 /*return*/, this.accountContract];
                }
            });
        });
    };
    /**
     * return the value to put into the "initCode" field, if the account is not yet deployed.
     * this value holds the "factory" address, followed by this account's information
     */
    QngAccountAPI.prototype.getAccountInitCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (this.factory == null) {
                            if (this.factoryAddress != null && this.factoryAddress !== "") {
                                this.factory = contracts_1.QngAccountFactory__factory.connect(this.factoryAddress, this.provider);
                            }
                            else {
                                throw new Error("no factory to get initCode");
                            }
                        }
                        _b = (0, ethers_1.ethers.utils.hexConcat);
                        _c = [this.factory.address];
                        _e = (_d = this.factory.interface).encodeFunctionData;
                        _f = ["createAccount"];
                        return [4 /*yield*/, this.owner.getAddress()];
                    case 1: return [2 /*return*/, _b.apply(void 0, [_c.concat([
                                _e.apply(_d, _f.concat([[
                                        _g.sent(),
                                        this.index
                                    ]]))
                            ])])];
                }
            });
        });
    };
    QngAccountAPI.prototype.getNonce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accountContract;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.checkAccountPhantom()];
                    case 1:
                        if (_b.sent()) {
                            return [2 /*return*/, ethers_1.ethers.BigNumber.from(0)];
                        }
                        return [4 /*yield*/, this._getAccountContract()];
                    case 2:
                        accountContract = _b.sent();
                        return [4 /*yield*/, accountContract.getNonce()];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /**
     * encode a method call from entryPoint to our contract
     * @param target
     * @param value
     * @param data
     */
    QngAccountAPI.prototype.encodeExecute = function (target, value, data) {
        return __awaiter(this, void 0, void 0, function () {
            var accountContract;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._getAccountContract()];
                    case 1:
                        accountContract = _b.sent();
                        return [2 /*return*/, accountContract.interface.encodeFunctionData("execute", [
                                target,
                                value,
                                data,
                            ])];
                }
            });
        });
    };
    QngAccountAPI.prototype.signUserOpHash = function (userOpHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.owner.signMessage((0, ethers_1.ethers.utils.arrayify)(userOpHash))];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return QngAccountAPI;
}(baseAccountAPI_1.BaseAccountAPI));
exports.QngAccountAPI = QngAccountAPI;
