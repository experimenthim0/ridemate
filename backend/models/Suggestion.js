const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    // We can add more fields later if needed (e.g. category, status)
  },
  { timestamps: true },
);

module.exports = mongoose.model("Suggestion", suggestionSchema);
