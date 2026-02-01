// models/job.model.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        minLength: [3, "Title must be at least 3 characters long"],
        maxLength: [30, "Title cannot exceed 30 characters"],
        match: [
            /^[a-zA-Z0-9\s]+$/,
            "Title can only contain letters, numbers, and spaces",
        ],
    },
    description: {
        type: String,
        required: [true, 'Description is Required'],
        trim: true,
        minLength: [15, "Description must be at least 15 characters long"],
    },
    status: {
        type: String,
        enum: ['Pending', 'Canceled', 'Active','Done'],
        default: 'Pending',
    },
    total_price: {
        type: Number,
        required: [true, 'Price is Required'],
        min: [0, "Price cannot be negative"],
        max: [10000, "Price cannot exceed 10,000"],
        validate: {
            validator: function (value) {
                return Number.isFinite(value) && value >= 0;
            },
            message: "Price must be a valid positive number",
        },
        set: (val) => Math.round(val * 100) / 100,
    },
    // Store commission rate at time of job creation
    site_commission: {
        type: Number,
        required: true,
        min: [0, "Commission cannot be negative"],
        max: [100, "Commission cannot exceed 100%"],
        default: 10, // Default commission
    },
}, { timestamps: true });

// Virtual for commission amount
jobSchema.virtual('commission_amount').get(function () {
    return Math.round(this.total_price * (this.site_commission / 100) * 100) / 100;
});

// Virtual for provider earnings
jobSchema.virtual('provider_earnings').get(function () {
    return Math.round((this.total_price - this.commission_amount) * 100) / 100;
});

// Enable virtuals in JSON output
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);