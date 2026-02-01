const { Service } = require("./service.model");

class ServiceService {
    async addService(data) {
        const { name, description, base_price, category, duration_minutes } = data;

        const existing = await Service.findOne({ name });
        if (existing) {
            throw new Error("Service already is Added");
        }
        const service = await Service.create({
            name,
            description,
            base_price,
            category,
            duration_minutes,
        });
        return service;
    }

    async updateService(serviceId, updatedData) {
        const service = await Service.findByIdAndUpdate(serviceId, updatedData, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            throw new Error("Service not found");
        }
        return service;
    }

    async deleteService(serviceId) {
        const service = await Service.findByIdAndDelete(serviceId);
        if (!service) {
            throw new Error("Service not found");
        }
        return service;
    }

    async getAllServices() {
        const services = await Service.find().sort({ timestamps: -1 })
        if (!services) {
            throw new Error("Services not found");
        }
        return services
    }

    async getService(serviceId) {
        const service = await Service.findById(serviceId);
        if (!service) {
            throw new Error("Services not found");
        }
        return service
    }

    // **SIMPLE SEARCH BY NAME, CATEGORY, AND DESCRIPTION**
    async searchServices(searchQuery, limit = 20) {
        try {
            if (!searchQuery || searchQuery.trim() === "") {
                return [];
            }

            // Text search using MongoDB's $text operator
            const services = await Service.find(
                {
                    $text: { $search: searchQuery },
                    status: "available", // Only show available services
                },
                { score: { $meta: "textScore" } }, // Include relevance score
            )
                .sort({ score: { $meta: "textScore" } }) // Sort by relevance
                .limit(parseInt(limit))
                .select("-__v");

            return services;
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    // **AUTOCOMPLETE SUGGESTIONS (searches name, category, description)**
    async getAutocompleteSuggestions(query, limit = 5) {
        try {
            if (!query || query.trim() === "") {
                return [];
            }

            // Use regex for autocomplete (case-insensitive)
            const regex = new RegExp(query, "i");

            const suggestions = await Service.find({
                $or: [{ name: regex }, { category: regex }, { description: regex }],
                status: "available",
            })
                .select("name category description")
                .limit(limit)
                .sort({ name: 1 });

            return suggestions;
        } catch (error) {
            throw new Error(`Autocomplete failed: ${error.message}`);
        }
    }
}

module.exports = { ServiceService };
