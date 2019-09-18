const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please Enter a store name"
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply coordinates!"
      }
    ],
    address: {
      type: String,
      required: "You must supply an address!"
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must be a store owner"
  }
});

storeSchema.index({ name: "text", description: "text" });

storeSchema.index({ location: "2dsphere" });

// middle ware before saving to the db
storeSchema.pre("save", async function(next) {
  if (!this.isModified("name")) {
    next();
    return;
  }
  this.slug = slug(this.name);

  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");

  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });

  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});


function autoPopulate(next) {
  this.populate('reviews');

  next();
}

storeSchema.pre('find', autoPopulate);

storeSchema.pre('findOne', autoPopulate);

storeSchema.statics.getTagsWithCount = function() {
  return this.aggregate([
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 }
      }
    }
  ]);
};

storeSchema.statics.getTopStoresByRating = function() {
  return this.aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "store",
        as: "reviews"
      }
    },
    {
      $match: {
        "reviews.1": {
          $exists: true
        }
      }
    },
    {
      $addFields: {
        averageRating: { $avg: "$reviews.rating" }
      }
    },
    { $limit: 10 }
  ]);
};

storeSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "store"
});

module.exports = mongoose.model("Store", storeSchema);
