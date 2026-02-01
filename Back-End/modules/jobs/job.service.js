// services/job.service.js
const Job = require("../models/job.model");

// Global commission rate (can be stored in memory or environment)
let GLOBAL_COMMISSION_RATE = 10; // Default 10%

class JobService {
    /**
     * Add a new job (commission auto-set from global rate)
     */
    async addJob(jobData) {
        const {
            title,
            description,
            total_price,
        } = jobData;

        const job = await Job.create({
            title,
            description,
            total_price,
            site_commission: GLOBAL_COMMISSION_RATE, // Auto-set from global rate
        });

        return job;
    }

    /**
     * Cancel a job (different logic for Pending vs Active)
     */
    async cancelJob(jobId, reason = null) {
        const job = await Job.findById(jobId);

        if (!job) {
            throw new Error("Job not found");
        }

        if (job.status === 'Done') {
            throw new Error("Cannot cancel a completed job");
        }

        if (job.status === 'Canceled') {
            throw new Error("Job is already canceled");
        }

        if (job.status === 'Pending') {
            job.status = 'Canceled';
            await job.save();
            
            return {
                message: "Job canceled successfully (no penalties)",
                job,
                canceledFrom: 'Pending'
            };
        }

        if (job.status === 'Active') {
            job.status = 'Canceled';
            await job.save();

            return {
                message: "Job canceled after activation (penalty may apply)",
                job,
                canceledFrom: 'Active',
                warning: "Cancellation fee or penalty may be applied"
            };
        }

        throw new Error("Invalid job status for cancellation");
    }

    /**
     * Get a single job by ID
     */
    async getJob(jobId) {
        const job = await Job.findById(jobId);

        if (!job) {
            throw new Error("Job not found");
        }

        return job;
    }

    /**
     * Get all jobs with optional status filter
     */
    async getAllJobs(filters = {}) {
        const query = {};

        if (filters.status) {
            const validStatuses = ['Pending', 'Accepted', 'Canceled', 'Active', 'Done'];
            if (!validStatuses.includes(filters.status)) {
                throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }
            query.status = filters.status;
        }

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const skip = (page - 1) * limit;

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Job.countDocuments(query);

        return {
            jobs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        };
    }

    /**
     * Edit job price
     */
    async editPrice(jobId, newPrice) {
        const job = await Job.findById(jobId);

        if (!job) {
            throw new Error("Job not found");
        }

        if (job.status === 'Done') {
            throw new Error("Cannot edit price of a completed job");
        }

        if (job.status === 'Canceled') {
            throw new Error("Cannot edit price of a canceled job");
        }

        if (job.status === 'Active') {
            throw new Error("Cannot edit price while job is active");
        }

        if (newPrice < 0 || newPrice > 10000) {
            throw new Error("Price must be between 0 and 10,000");
        }

        const oldPrice = job.total_price;
        const oldCommission = job.commission_amount;
        
        job.total_price = newPrice;
        await job.save();

        return {
            message: "Price updated successfully",
            job,
            changes: {
                oldPrice,
                newPrice,
                priceDifference: newPrice - oldPrice,
                oldCommission,
                newCommission: job.commission_amount,
                commissionDifference: job.commission_amount - oldCommission
            }
        };
    }

    /**
     * End/Complete a job
     */
    async endJob(jobId) {
        const job = await Job.findById(jobId);

        if (!job) {
            throw new Error("Job not found");
        }

        if (job.status !== 'Active' && job.status !== 'Accepted') {
            throw new Error(`Cannot complete job with status: ${job.status}`);
        }

        if (job.status === 'Done') {
            throw new Error("Job is already completed");
        }

        if (job.status === 'Canceled') {
            throw new Error("Cannot complete a canceled job");
        }

        job.status = 'Done';
        await job.save();

        return {
            message: "Job completed successfully",
            job,
            financials: {
                totalPrice: job.total_price,
                commissionRate: job.site_commission + '%',
                commissionAmount: job.commission_amount,
                providerEarnings: job.provider_earnings
            }
        };
    }

    /**
     * Update job status
     */
    async updateStatus(jobId, newStatus) {
        const validStatuses = ['Pending', 'Canceled', 'Active', 'Done'];
        
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const job = await Job.findById(jobId);

        if (!job) {
            throw new Error("Job not found");
        }

        const oldStatus = job.status;
        job.status = newStatus;
        await job.save();

        return {
            message: "Status updated successfully",
            job,
            statusChange: {
                from: oldStatus,
                to: newStatus
            }
        };
    }

    // ============================================
    // ADMIN ONLY METHODS
    // ============================================

    /**
     * Get current global commission rate (ADMIN ONLY)
     */
    getCommissionRate() {
        return {
            rate: GLOBAL_COMMISSION_RATE,
            message: `Current commission rate is ${GLOBAL_COMMISSION_RATE}%`
        };
    }

    /**
     * Update global commission rate (ADMIN ONLY)
     * This affects all NEW jobs created after this change
     */
    updateCommissionRate(newRate) {
        if (typeof newRate !== 'number' || newRate < 0 || newRate > 100) {
            throw new Error("Commission rate must be a number between 0 and 100");
        }

        const oldRate = GLOBAL_COMMISSION_RATE;
        GLOBAL_COMMISSION_RATE = newRate;

        return {
            message: "Commission rate updated successfully",
            oldRate,
            newRate: GLOBAL_COMMISSION_RATE,
            note: "This change will only affect NEW jobs. Existing jobs keep their original commission rate."
        };
    }

    /**
     * Get commission statistics (ADMIN ONLY)
     */
    async getCommissionStats() {
        const jobs = await Job.find({ status: 'Done' });

        const totalRevenue = jobs.reduce((sum, job) => sum + job.total_price, 0);
        const totalCommission = jobs.reduce((sum, job) => sum + job.commission_amount, 0);
        const totalProviderEarnings = jobs.reduce((sum, job) => sum + job.provider_earnings, 0);

        return {
            totalCompletedJobs: jobs.length,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalCommission: Math.round(totalCommission * 100) / 100,
            totalProviderEarnings: Math.round(totalProviderEarnings * 100) / 100,
            averageCommissionRate: jobs.length > 0 
                ? Math.round((jobs.reduce((sum, job) => sum + job.site_commission, 0) / jobs.length) * 100) / 100 
                : 0,
            currentGlobalRate: GLOBAL_COMMISSION_RATE
        };
    }
}

module.exports = new JobService();