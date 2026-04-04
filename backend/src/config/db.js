const mongoose = require("mongoose");

async function connectDb(mongoUri) {
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
}

module.exports = { connectDb };
