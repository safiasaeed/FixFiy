const Job = require("./job.model");
const { createNotification } =
  require("../notifications/notification.service");
const { emitNotification } =
  require("../../utils/emitNotification");

const DEPOSIT_PERCENT = 20;
let GLOBAL_COMMISSION_RATE = 10;

class JobService {
  /* ================= CREATE JOB ================= */
  async createJob({
    title,
    description,
    total_price,
    clientId,
    jobType,
    serviceId,
    technicianServiceId,
  }) {
    if (jobType === "ADMIN_SERVICE" && !serviceId)
      throw new Error("serviceId is required");

    if (jobType === "TECHNICIAN_SERVICE" && !technicianServiceId)
      throw new Error("technicianServiceId is required");

    const depositAmount = +(
      (total_price * DEPOSIT_PERCENT) /
      100
    ).toFixed(2);

    return Job.create({
      title,
      description,
      total_price,
      clientId,
      jobType,
      serviceId,
      technicianServiceId,
      depositAmount,
      site_commission: GLOBAL_COMMISSION_RATE,
    });
  }

  /* ================= ACCEPT JOB ================= */
  async acceptJob(jobId, workerId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (job.paymentStatus !== "DEPOSIT_PAID")
      throw new Error("Deposit not paid");

    job.workerId = workerId;
    job.status = "ACCEPTED";
    await job.save();

    await createNotification({
      userId: job.clientId,
      type: "JOB_ACCEPTED",
      title: "Job Accepted",
      message: "A technician accepted your job",
      referenceId: job._id,
    });

    emitNotification(job.clientId, {
      type: "JOB_ACCEPTED",
      jobId: job._id,
    });

    return job;
  }

  /* ================= START JOB ================= */
  async startJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = "ACTIVE";
    await job.save();
    return job;
  }

  /* ================= COMPLETE JOB ================= */
  async completeJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = "DONE";
    job.paymentStatus = "PAID";
    await job.save();

    await createNotification({
      userId: job.clientId,
      type: "JOB_COMPLETED",
      title: "Job Completed",
      message: "Job completed successfully",
      referenceId: job._id,
    });

    return job;
  }

  /* ================= CANCEL JOB ================= */
  async cancelJob(jobId, userId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (
      !job.clientId.equals(userId) &&
      !job.workerId?.equals(userId)
    )
      throw new Error("Not authorized");

    job.status = "CANCELED";
    await job.save();

    return job;
  }

  /* ================= GET ================= */
  async getJob(jobId) {
    return Job.findById(jobId)
      .populate("clientId workerId", "name email")
      .populate("serviceId technicianServiceId");
  }

  async getAllJobs(filters = {}) {
    return Job.find(filters).sort({ createdAt: -1 });
  }

  /* ================= ADMIN ================= */
  getCommissionRate() {
    return { rate: GLOBAL_COMMISSION_RATE };
  }

  updateCommissionRate(rate) {
    GLOBAL_COMMISSION_RATE = rate;
    return { rate };
  }
}

module.exports = new JobService();
