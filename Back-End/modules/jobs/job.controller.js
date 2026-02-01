// controllers/job.controller.js
const jobService = require("../services/job.service");

/**
 * Create a new job
 * POST /api/job
 */
exports.createJob = async (req, res) => {
    try {
        const { title, description, total_price } = req.body;

        // Validation
        if (!title || !description || !total_price) {
            return res.status(400).json({
                success: false,
                message: "Title, description, and total_price are required"
            });
        }

        const job = await jobService.addJob({
            title,
            description,
            total_price
        });

        return res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: job
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get a single job by ID
 * GET /api/job/:id
 */
exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await jobService.getJob(id);

        return res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all jobs with optional filters
 * GET /api/jobs?status=Pending&page=1&limit=10
 */
exports.getAllJobs = async (req, res) => {
    try {
        const { status, page, limit } = req.query;

        const result = await jobService.getAllJobs({
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            data: result.jobs,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update job price
 * PATCH /api/job/:id/price
 */
exports.updatePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_price } = req.body;

        if (new_price === undefined || new_price === null) {
            return res.status(400).json({
                success: false,
                message: "new_price is required"
            });
        }

        const result = await jobService.editPrice(id, new_price);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.job,
            changes: result.changes
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Cancel a job
 * PATCH /api/job/:id/cancel
 */
exports.cancelJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const result = await jobService.cancelJob(id, reason);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.job,
            canceledFrom: result.canceledFrom,
            warning: result.warning
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Complete/End a job
 * PATCH /api/job/:id/complete
 */
exports.completeJob = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await jobService.endJob(id);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.job,
            financials: result.financials
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update job status
 * PATCH /api/job/:id/status
 */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const result = await jobService.updateStatus(id, status);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.job,
            statusChange: result.statusChange
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN ONLY CONTROLLERS
// ============================================

/**
 * Get current commission rate (ADMIN ONLY)
 * GET /api/admin/commission-rate
 */
exports.getCommissionRate = async (req, res) => {
    try {
        const result = jobService.getCommissionRate();

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update commission rate (ADMIN ONLY)
 * PUT /api/admin/commission-rate
 */
exports.updateCommissionRate = async (req, res) => {
    try {
        const { rate } = req.body;

        if (rate === undefined || rate === null) {
            return res.status(400).json({
                success: false,
                message: "Rate is required"
            });
        }

        const result = jobService.updateCommissionRate(rate);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                oldRate: result.oldRate,
                newRate: result.newRate
            },
            note: result.note
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get commission statistics (ADMIN ONLY)
 * GET /api/admin/commission-stats
 */
exports.getCommissionStats = async (req, res) => {
    try {
        const stats = await jobService.getCommissionStats();

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};