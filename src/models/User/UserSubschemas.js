const mongoose = require("mongoose");

//friends list schema
const friendsListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

//current location schema
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], //format = [longitude, latitude]
    default: [0.0, 0.0],
  },
});

//indexing the coordinates for geospatial queries
locationSchema.index({ coordinates: "2dsphere" });

module.exports = {
  friendsListSchema,
  locationSchema,
};
