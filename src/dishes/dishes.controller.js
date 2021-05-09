const path = require("path");
const bodyHasAllProperties = require("./bodyHasAllProperties");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// Middleware
function bodyHasDish(req, res, next) {    //bodyHasDish
  const { data: dish } = req.body;
  if (dish) {
    return next();
  } else
    next({
      status: 400,
      message: "Request is missing dish prperty",
    });
}
function dishHasName(req, res, next) {    //dishHasName
  const { data: { name } = {} } = req.body;
  if (name) {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}
function dishHasDescription(req, res, next) {   //dishHasDescription
  const { data: { description } = {} } = req.body;
  if (description) {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}
function dishHasPrice(req, res, next) {     //dishHasPrice
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && typeof price === "number") {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a price",
  });
}
function dishHasImageUrl(req, res, next) {    //dishHasImageUrl
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}
function dishExists(req, res, next) {   //dishExists
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.use = foundDish;
    return next();
  } else
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    });
}
function idsMatchToUpdate(req, res, next) {   //idsMatchToUpdate
  const dishId = req.params.dishId;
  const { id } = req.body.data;
  if (!id) next();
  if (id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
 else next();
}


// Route Handlers
function list(req, res, next) {
  res.json({ data: dishes });
}

function create(req, res, next) {
  const { data: { name } = {} } = req.body;
  const newDish = {
    id: nextId + 1,
    name,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function update(req, res, next) {
  const { name, description, price, image_url } = req.body.data;
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;
  foundDish.id = dishId;
  res.status(200).json({ data: foundDish });
}

function read(req, res, next) {
  res.json({ data: res.locals.use });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    dishHasName,
    dishHasDescription,
    dishHasPrice,
    dishHasImageUrl,
    bodyHasDish,
    create,
  ],
  update: [
    dishExists,
    dishHasName,
    dishHasDescription,
    dishHasPrice,
    dishHasImageUrl,
    idsMatchToUpdate,
    update,
  ],
};

