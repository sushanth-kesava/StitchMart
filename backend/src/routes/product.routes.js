const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  seedProducts,
} = require("../controllers/product.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", requireAuth, createProduct);
router.delete("/:id", requireAuth, deleteProduct);
router.post("/seed", seedProducts);

module.exports = router;
