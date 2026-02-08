const { Service } = require("./service.model");

class ServiceService {
  async addService(data) {
    const { name } = data;

    const existing = await Service.findOne({ name });
    if (existing) throw new Error("Service already exists");

    return await Service.create(data);
  }

  async updateService(serviceId, updatedData) {
    const service = await Service.findByIdAndUpdate(
      serviceId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!service) throw new Error("Service not found");
    return service;
  }

  async deleteService(serviceId) {
    const service = await Service.findByIdAndDelete(serviceId);
    if (!service) throw new Error("Service not found");
    return service;
  }

  async getAllServices() {
    return await Service.find().sort({ createdAt: -1 });
  }

  async getService(serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found");
    return service;
  }

  async searchServices(query, limit = 20) {
    if (!query) return [];

    return await Service.find(
      { $text: { $search: query }, status: "available" },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(Number(limit));
  }

  async getAutocompleteSuggestions(query, limit = 5) {
    if (!query) return [];

    const regex = new RegExp(query, "i");
    return await Service.find({
      $or: [{ name: regex }, { category: regex }],
      status: "available",
    })
      .select("name category")
      .limit(Number(limit));
  }
}

module.exports = new ServiceService();
