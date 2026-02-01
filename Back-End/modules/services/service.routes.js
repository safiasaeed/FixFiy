const express = require("express");
const router = express.Router();
const {
    addService,
    updateService,
    deleteService,
    getAllServices,
    getService,
    search,
    getAutocompleteSuggestions,
} = require('./service.controller');
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

// Get all Services
router.get('/services', getAllServices)

//Add New Service
router.post('/service', protect, authorize('admin'), addService)

// Get Service by Id
router.get('service/:id', protect, getService)

//Update or Edit Service by Id
router.put('/service/:id', protect, authorize('admin'), updateService)

//Delete Service by Id
router.delete('service/:id', protect, authorize('admin'), deleteService)

// **SEARCH ENDPOINT - searches name, category, description**
router.get("/search", search);

// **AUTOCOMPLETE ENDPOINT - searches name, category, description**
router.get("/autocomplete", getAutocompleteSuggestions);

module.exports = router;