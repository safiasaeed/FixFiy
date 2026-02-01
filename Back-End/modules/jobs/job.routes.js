// routes/job.routes.js
const express = require("express");
const router = express.Router();
const {
    createJob,
    getJobById,
    getAllJobs,
    updatePrice,
    cancelJob,
    completeJob,
    updateStatus,
    getCommissionRate,
    updateCommissionRate,
    getCommissionStats,
} = require('./job.controller');
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

// ============================================
// PUBLIC/USER ROUTES
// ============================================

// Get all jobs with filters
router.get('/jobs', getAllJobs);

// Create a new job
router.post('/job', protect,authorize('client'), createJob);

// Get a single job by ID
router.get('/job/:id', protect, getJobById);

// Update job price
router.patch('/job/:id/price', protect,authorize('client'), updatePrice);

// Cancel a job
router.patch('/job/:id/cancel', protect, cancelJob);

// Complete a job
router.patch('/job/:id/complete', protect,authorize('technician'), completeJob);

// Update job status
router.patch('/job/:id/status', protect, updateStatus);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Get current commission rate (ADMIN ONLY)
router.get('/admin/commission-rate', protect, authorize('admin'), getCommissionRate);

// Update commission rate (ADMIN ONLY)
router.put('/admin/commission-rate', protect, authorize('admin'), updateCommissionRate);

// Get commission statistics (ADMIN ONLY)
router.get('/admin/commission-stats', protect, authorize('admin'), getCommissionStats);

module.exports = router;