"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.getStatusQuery = exports.deliveredSignal = exports.pickedUpSignal = void 0;
exports.order = order;
var workflow_1 = require("@temporalio/workflow");
var temporal_common_1 = require("@repo/temporal-common");
exports.pickedUpSignal = (0, workflow_1.defineSignal)("pickedUp");
exports.deliveredSignal = (0, workflow_1.defineSignal)("delivered");
exports.getStatusQuery = (0, workflow_1.defineQuery)("getStatus");
var _a = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: "1m",
    retry: {
        maximumInterval: "5s", // Just for demo purposes. Usually this should be larger.
    },
}), chargeCustomer = _a.chargeCustomer, refundOrder = _a.refundOrder, sendPushNotification = _a.sendPushNotification;
function order(productId) {
    return __awaiter(this, void 0, void 0, function () {
        var product, state, deliveredAt, err_1, message, notPickedUpInTime, notDeliveredInTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    product = (0, temporal_common_1.getProductById)(productId);
                    if (!product) {
                        throw workflow_1.ApplicationFailure.create({
                            message: "Product ".concat(productId, " not found"),
                        });
                    }
                    state = "Charging card";
                    // setup Signal and Query handlers
                    (0, workflow_1.setHandler)(exports.pickedUpSignal, function () {
                        if (state === "Paid") {
                            state = "Picked up";
                        }
                    });
                    (0, workflow_1.setHandler)(exports.deliveredSignal, function () {
                        if (state === "Picked up") {
                            state = "Delivered";
                            deliveredAt = new Date();
                        }
                    });
                    (0, workflow_1.setHandler)(exports.getStatusQuery, function () {
                        return { state: state, deliveredAt: deliveredAt, productId: productId };
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, chargeCustomer(product)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    message = "Failed to charge customer for ".concat(product.name, ". Error: ").concat((0, temporal_common_1.errorMessage)(err_1));
                    return [4 /*yield*/, sendPushNotification(message)];
                case 4:
                    _a.sent();
                    throw workflow_1.ApplicationFailure.create({ message: message });
                case 5:
                    state = "Paid";
                    return [4 /*yield*/, (0, workflow_1.condition)(function () { return state === "Picked up"; }, "1 min")];
                case 6:
                    notPickedUpInTime = !(_a.sent());
                    if (!notPickedUpInTime) return [3 /*break*/, 8];
                    state = "Refunding";
                    return [4 /*yield*/, refundAndNotify(product, "⚠️ No drivers were available to pick up your order. Your payment has been refunded.")];
                case 7:
                    _a.sent();
                    throw workflow_1.ApplicationFailure.create({ message: "Not picked up in time" });
                case 8: return [4 /*yield*/, sendPushNotification("🚗 Order picked up")];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, (0, workflow_1.condition)(function () { return state === "Delivered"; }, "1 min")];
                case 10:
                    notDeliveredInTime = !(_a.sent());
                    if (!notDeliveredInTime) return [3 /*break*/, 12];
                    state = "Refunding";
                    return [4 /*yield*/, refundAndNotify(product, "⚠️ Your driver was unable to deliver your order. Your payment has been refunded.")];
                case 11:
                    _a.sent();
                    throw workflow_1.ApplicationFailure.create({ message: "Not delivered in time" });
                case 12: return [4 /*yield*/, sendPushNotification("✅ Order delivered!")];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, (0, workflow_1.sleep)("1 min")];
                case 14:
                    _a.sent(); // this could also be hours or even months
                    return [4 /*yield*/, sendPushNotification("\u270D\uFE0F Rate your meal. How was the ".concat(product.name.toLowerCase(), "?"))];
                case 15:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function refundAndNotify(product, message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, refundOrder(product)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sendPushNotification(message)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
