const jobService = require("./job.service");

/* ============ CLIENT ============ */

exports.createJob = async (req, res) => {
  try {
    const job = await jobService.createJob({
      ...req.body,
      clientId: req.user.id,
    });
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.cancelJob = async (req, res) => {
  try {
    const job = await jobService.cancelJob(
      req.params.id,
      req.user.id
    );
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ============ TECHNICIAN ============ */

exports.acceptJob = async (req, res) => {
  try {
    const job = await jobService.acceptJob(
      req.params.id,
      req.user.id
    );
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.startJob = async (req, res) => {
  try {
    const job = await jobService.startJob(req.params.id);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const job = await jobService.completeJob(req.params.id);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ============ SHARED ============ */

exports.getJob = async (req, res) => {
  const job = await jobService.getJob(req.params.id);
  res.json({ success: true, data: job });
};

exports.getAllJobs = async (req, res) => {
  const jobs = await jobService.getAllJobs(req.query);
  res.json({ success: true, data: jobs });
};

/* ============ ADMIN ============ */

exports.getCommissionRate = (req, res) => {
  res.json({
    success: true,
    data: jobService.getCommissionRate(),
  });
};

exports.updateCommissionRate = (req, res) => {
  res.json({
    success: true,
    data: jobService.updateCommissionRate(req.body.rate),
  });
};
