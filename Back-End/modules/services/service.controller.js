const serviceService = require("./service.service");

const addService = async (req, res) => {
  try {
    const service = await serviceService.addService(req.body);
    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: service,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceService.updateService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await serviceService.deleteService(id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceService.getService(id);

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const search = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const results = await serviceService.searchServices(q, limit);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAutocompleteSuggestions = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const suggestions = await serviceService.getAutocompleteSuggestions(q, limit);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addService,
  updateService,
  deleteService,
  getAllServices,
  getService,
  search,
  getAutocompleteSuggestions,
};
