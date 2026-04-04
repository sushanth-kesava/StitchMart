const express = require("express");
const { createOrder, getMyOrders } = require("../controllers/order.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/my", requireAuth, getMyOrders);
router.post("/", requireAuth, createOrder);

module.exports = router;
