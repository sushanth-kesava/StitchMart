const express = require("express");
const { checkPincodeAvailability } = require("../controllers/delivery.controller");

const router = express.Router();

router.get("/check", checkPincodeAvailability);

module.exports = router;
