"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.notificationService = void 0;
var activity_1 = require("@temporalio/activity");
exports.notificationService = {
  sendNotification: function (_a) {
    var type = _a.type,
      message = _a.message;
    if (Math.random() < 0.7) {
      throw new Error(
        "Failed to send ".concat(
          type,
          " notification. Unable to reach notification service.",
        ),
      );
    }
    activity_1.log.info("Sent notification", { type: type, message: message });
  },
};
exports.paymentService = {
  charge: function (cents) {
    // In a real app, we would pass an idempotency token to the downstream service
    var _idempotencyToken = "".concat(
      (0, activity_1.activityInfo)().workflowExecution.workflowId,
      "-charge",
    );
    if (cents >= 3500) {
      throw activity_1.ApplicationFailure.create({
        nonRetryable: true,
        message: "Card declined: insufficient funds",
      });
    }
    if (Math.random() < 0.7) {
      throw new Error("Failed to charge. Unable to reach payment service.");
    }
    activity_1.log.info("Charged", { cents: cents });
  },
  refund: function (cents) {
    // In a real app, we would pass an idempotency token to the downstream service
    var _idempotencyToken = "".concat(
      (0, activity_1.activityInfo)().workflowExecution.workflowId,
      "-refund",
    );
    if (Math.random() < 0.7) {
      throw new Error("Failed to refund. Unable to reach payment service.");
    }
    activity_1.log.info("Refunded", { cents: cents });
  },
};
