const Store = require("../models/Store");
const multer = require("multer");
const User = require("../models/User");
const uuid = require("uuid");
const jimp = require("jimp");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "This file type isn't supported!" });
    }
  }
};

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  const photo = await jimp.read(req.file.buffer);
  photo.resize(800, jimp.AUTO);
  photo.write(`./public/uploads/${req.body.photo}`);

  next();
};

exports.homePage = (req, res) => {
  req.flash("error", "Hey");
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore");
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successfully Created ${store.name}. Care to leave review now?`
  );

  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = (page - 1) * limit;
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: "desc" });

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  if (!stores.length && skip) {
    req.flash("info", "Required page does not exists. I put you on the last page");
    res.redirect(`/stores/page/${pages}`);
  }

  res.render("stores", { title: "Stores", stores, count, page, pages });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw new Error("You must be store owner to edit this store!");
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });

  confirmOwner(store, req.user);

  res.render("editStore", { title: `Edit ${store.name} store`, store });
};

exports.updateStore = async (req, res) => {
  req.body.location.type = "Point";
  const store = await Store.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  ).exec();

  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View -></a>`
  );

  res.redirect(`/stores/${store.id}/edit`);
};

exports.getStore = async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author reviews"
  );
  if (!store) {
    next();
    return;
  }

  res.render("store", { store });
};

exports.getTags = async (req, res) => {
  const tag = req.params.tag || { $exists: true };

  const tagsPromise = Store.getTagsWithCount();

  const storesPromise = Store.find({ tags: tag });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render("tags", { tags, title: "Tags", tag, stores });
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      score: {
        $meta: "textScore"
      }
    }
  )
    .sort({
      score: {
        $meta: "textScore"
      }
    })
    .limit(5);

  res.json({ stores });
};

exports.getNearestStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);

  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: 10000
      }
    }
  };

  const store = await Store.find(q, "name location slug description photo");
  res.json(store);
};

exports.mapStores = async (req, res) => {
  res.render("map", { title: "Map" });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: {
        hearts: req.params.id
      }
    },
    { new: true }
  );

  res.json(user);
};

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: {
      $in: req.user.hearts
    }
  });

  res.render("stores", { title: "Hearted Stores", stores });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStoresByRating();

  res.render("topStores", { stores });
};
