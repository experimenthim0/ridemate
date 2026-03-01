const mongoose = require("mongoose");

const systemStatSchema = new mongoose.Schema(
  {
    totalRidesCreated: {
      type: Number,
      default: 0,
    },
    // Add other persistent global stats here as needed
  },
  { timestamps: true }, // Keeping timestamps just in case we need to track when stats were last updated
);

module.exports = mongoose.model("SystemStat", systemStatSchema);
