const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      minLength: [3, "Service name must be at least 3 characters long"],
      maxLength: [100, "Service name cannot exceed 100 characters"],
      index: true,
    },

    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      minLength: [10, "Description must be at least 10 characters long"],
      maxLength: [500, "Description cannot exceed 500 characters"],
    },

    base_price: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
      max: [10000, "Base price cannot exceed 10,000"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Base price must be a valid positive number",
      },
      set: (val) => Math.round(val * 100) / 100,
    },

    status: {
      type: String,
      enum: {
        values: ["available", "not-available"],
        message: "{VALUE} is not a valid status",
      },
      default: "available",
      index: true,
    },

    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: {
        values: [
          "plumbing",
          "electrical",
          "carpentry",
          "painting",
          "hvac",
          "appliance_repair",
          "cleaning",
          "landscaping",
          "pest_control",
          "general",
        ],
        message: "{VALUE} is not a valid category",
      },
      index: true,
    },

    duration_minutes: {
      type: Number,
      required: [true, "Service duration is required"],
      min: [15, "Service duration must be at least 15 minutes"],
      max: [480, "Service duration cannot exceed 8 hours"],
      default: 60,
    },

    // Optional: Track who created the service
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: [true, "Creator is required"],
    },

    // Optional: Track number of times service has been booked
    booking_count: {
      type: Number,
      default: 0,
      min: [0, "Booking count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// **TEXT INDEX FOR SEARCHING NAME, CATEGORY, AND DESCRIPTION**
serviceSchema.index({ 
  name: 'text', 
  category: 'text', 
  description: 'text' 
});

// **COMPOUND INDEX** for common queries (status + category)
serviceSchema.index({ status: 1, category: 1 });

// **VIRTUAL** for formatted price display
serviceSchema.virtual('formatted_price').get(function() {
  return `$${this.base_price.toFixed(2)}`;
});

// **VIRTUAL** for duration in hours
serviceSchema.virtual('duration_hours').get(function() {
  return Math.round((this.duration_minutes / 60) * 100) / 100;
});

// Enable virtuals in JSON output
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

// **INSTANCE METHOD** to check if service is available
serviceSchema.methods.isAvailable = function() {
  return this.status === 'available';
};

// **STATIC METHOD** to find services by category
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'available' });
};

const Service = mongoose.model("Service", serviceSchema);

module.exports = { Service };