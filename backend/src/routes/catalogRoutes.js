const express = require("express");
const catalogController = require("../controllers/catalogController");

const router = express.Router();

router.get("/districts", catalogController.getDistricts);
router.get("/districts/:id", catalogController.getDistrictById);
router.get("/departments", catalogController.getDepartments);
router.get("/departments/:id", catalogController.getDepartmentById);

module.exports = router;
