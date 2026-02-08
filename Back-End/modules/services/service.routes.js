const router = require("express").Router();
const controller = require("./service.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

router.get("/services", controller.getAllServices);
router.get("/service/:id", controller.getService);

router.post(
  "/service",
  protect,
  authorize("admin"),
  controller.addService
);

router.put(
  "/service/:id",
  protect,
  authorize("admin"),
  controller.updateService
);

router.delete(
  "/service/:id",
  protect,
  authorize("admin"),
  controller.deleteService
);

router.get("/services/search", controller.search);
router.get("/services/autocomplete", controller.getAutocompleteSuggestions);

module.exports = router;
