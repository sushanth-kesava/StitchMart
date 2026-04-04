const Product = require("../models/Product");
const Order = require("../models/Order");

function normalizeOrder(order) {
  return {
    id: order._id.toString(),
    userId: order.userId,
    userEmail: order.userEmail,
    userRole: order.userRole,
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
  };
}

async function createOrder(req, res, next) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    const quantitiesByProductId = new Map();

    for (const item of items) {
      if (!item.productId || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 1) {
        return res.status(400).json({
          success: false,
          message: "Each order item must include productId and quantity >= 1",
        });
      }

      const productId = String(item.productId);
      const quantity = Number(item.quantity);
      quantitiesByProductId.set(productId, (quantitiesByProductId.get(productId) || 0) + quantity);
    }

    const productIds = [...quantitiesByProductId.keys()];
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products no longer exist",
      });
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const orderItems = [];
    let subtotal = 0;

    for (const [productId, quantity] of quantitiesByProductId.entries()) {
      const product = productMap.get(productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product lookup failed during checkout",
        });
      }

      if (product.stock < quantity) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });

      subtotal += product.price * quantity;
    }

    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    await Promise.all(
      orderItems.map((item) =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    const order = await Order.create({
      userId: req.auth.sub,
      userEmail: req.auth.email,
      userRole: req.auth.role === "admin" ? "admin" : "customer",
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      status: "Processing",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: normalizeOrder(order),
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ userId: req.auth.sub }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders: orders.map(normalizeOrder),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
};
