const serviceService = require("./service.service");

const addService = async (req, res) => {
    try {
        const service = await serviceService.addService(req.body)
        return res.status(201).json({
            success: true,
            message: "Service Added Successfully",
            data: service,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        })
    }
}

const updateService = async (req, res) => {
    try {
        const serviceId = req.params
        const updatedData = req.body
        const service = await serviceService.updateService(serviceId, updatedData);
        return res.status(201).json({
            success: true,
            message: "Service Updated Successfully",
            data: service,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        })
    }
}

const deleteService = async (req, res) => {
    try {
        const serviceId = req.params
        const service = await serviceService.deleteService(serviceId);
        return res.status(201).json({
            success: true,
            message: "Service Deleted Successfully",
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        })
    }
}

const getAllServices = async (req, res) => {
    try {
        const services = await serviceService.getAllServices();
        if (services.length == 0) {
            return res.status(200).json({
            success: true,
            message: "no Services yet",
        });
        }
        return res.status(201).json({
            success: true,
            message: "Service Found Successfully",
            data:services
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        })
    }
}

const getService = async (req, res) => {
    try {
        const serviceId = req.params
        const service = await serviceService.getService(serviceId);
        return res.status(200).json({
            success: true,
            message: "Service Found Successfully",
            data:service
        })
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        })
    }
}



// Simple in-memory cache
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const search = async (req, res) => {
    try {
        const { q, limit } = req.query;

        // Return empty if no query
        if (!q || q.trim() === "") {
            return res.json({
                results: [],
                count: 0,
                query: q,
            });
        }

        // Check cache
        const cacheKey = `search_${q}_${limit || 20}`;
        if (searchCache.has(cacheKey)) {
            const cached = searchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                return res.json({
                    ...cached.data,
                    cached: true,
                });
            } else {
                searchCache.delete(cacheKey);
            }
        }

        // Perform search
        const results = await serviceService.searchServices(q, limit);

        const responseData = {
            results,
            count: results.length,
            query: q,
            cached: false,
        };

        // Cache the results
        searchCache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
        });

        res.json(responseData);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            error: "Search failed",
            message: error.message,
        });
    }
}

const getAutocompleteSuggestions = async (req, res) => {
    try {
        const { q, limit } = req.query;

        if (!q || q.trim() === "") {
            return res.json({ suggestions: [] });
        }

        const suggestions = await serviceService.getAutocompleteSuggestions(
            q,
            limit
        );

        res.json({
            suggestions: suggestions.map(s => ({
                id: s._id,
                name: s.name,
                category: s.category,
                description: s.description
            }))
        });
    } catch (error) {
        console.error("Autocomplete error:", error);
        res.status(500).json({
            error: "Autocomplete failed",
            message: error.message,
        });
    }
}

module.exports = {
    addService,
    updateService,
    deleteService,
    getAllServices,
    getService,
    search,
    getAutocompleteSuggestions,
}