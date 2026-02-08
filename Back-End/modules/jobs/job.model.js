const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    /* ================= CORE ================= */
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 15,
    },

    /* ================= SERVICE ================= */
    jobType: {
      type: String,
      enum: ["ADMIN_SERVICE", "TECHNICIAN_SERVICE"],
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    technicianServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechnicianService",
    },

    /* ================= RELATIONS ================= */
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "ACTIVE", "DONE", "CANCELED"],
      default: "PENDING",
    },

    /* ================= PRICING ================= */
    total_price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },

    site_commission: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    /* ================= PAYMENT ================= */
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "DEPOSIT_PAID", "PAID"],
      default: "UNPAID",
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["PAYPAL", "PAYMOB", "CASH"],
    },

    paymentRef: String,
  },
  { timestamps: true }
);

/* ================= VIRTUALS ================= */

jobSchema.virtual("commission_amount").get(function () {
  return +(this.total_price * (this.site_commission / 100)).toFixed(2);
});

jobSchema.virtual("provider_earnings").get(function () {
  return +(this.total_price - this.commission_amount).toFixed(2);
});

jobSchema.set("toJSON", { virtuals: true });
jobSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Job", jobSchema);
