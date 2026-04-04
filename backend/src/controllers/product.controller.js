const Product = require("../models/Product");

const seedProductsData = [
  {
    name: "Royal Zardosi Floral Pack",
    description: "A collection of 5 traditional Indian floral designs optimized for high-speed machines.",
    price: 49.99,
    category: "Embroidery Designs",
    dealerId: "seed-admin",
    image: "https://picsum.photos/seed/design1/600/600",
    stock: 999,
    fileDownloadLink: "/designs/royal-zardosi.zip",
    rating: 4.8,
    customizable: false,
  },
  {
    name: "Vibrant Silk Thread Set",
    description: "Set of 24 colors, 1000m each. High sheen and break resistance.",
    price: 35,
    category: "Machine Threads",
    dealerId: "seed-admin",
    image: "https://picsum.photos/seed/thread1/400/400",
    stock: 50,
    rating: 4.5,
    customizable: false,
  },
  {
    name: "Premium Cotton Hoodie - Jet Black",
    description: "Heavyweight 400GSM cotton hoodie, perfect for intricate embroidery work.",
    price: 25,
    category: "Hoodies",
    dealerId: "seed-admin",
    image: "https://picsum.photos/seed/hoodie1/600/600",
    stock: 100,
    rating: 4.7,
    customizable: true,
  },
  {
    name: "Silk Blend Blouse Piece",
    description: "Unstitched blouse piece in rich silk, ready for custom zardosi embroidery.",
    price: 18.5,
    category: "Blouses",
    dealerId: "seed-admin",
    image: "https://picsum.photos/seed/blouse1/600/600",
    stock: 150,
    rating: 4.6,
    customizable: true,
  },
];

function normalizeProduct(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    category: doc.category,
    dealerId: doc.dealerId,
    image: doc.image,
    stock: doc.stock,
    fileDownloadLink: doc.fileDownloadLink,
    rating: doc.rating,
    customizable: doc.customizable,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getProducts(req, res, next) {
  try {
    const { category, search, dealerId, customizable } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (dealerId) {
      filter.dealerId = dealerId;
    }

    if (typeof customizable !== "undefined") {
      filter.customizable = customizable === "true";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products: products.map(normalizeProduct),
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: normalizeProduct(product),
    });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    if (req.auth?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin users can create products",
      });
    }

    const { name, description, price, category, image, stock, rating, customizable, fileDownloadLink } = req.body;

    if (!name || !description || typeof price === "undefined" || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "Missing required product fields",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
      rating: Number.isFinite(Number(rating)) ? Number(rating) : 0,
      customizable: Boolean(customizable),
      fileDownloadLink: fileDownloadLink || null,
      dealerId: req.auth.sub,
    });

    return res.status(201).json({
      success: true,
      message: "Product created",
      product: normalizeProduct(product),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    if (req.auth?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin users can delete products",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.dealerId !== req.auth.sub) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    return next(error);
  }
}

async function seedProducts(req, res, next) {
  try {
    const existingCount = await Product.countDocuments();

    if (existingCount > 0) {
      return res.status(200).json({
        success: false,
        message: "Database already has data.",
      });
    }

    const inserted = await Product.insertMany(seedProductsData);

    return res.status(201).json({
      success: true,
      message: "Database seeded successfully!",
      count: inserted.length,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  seedProducts,
};
