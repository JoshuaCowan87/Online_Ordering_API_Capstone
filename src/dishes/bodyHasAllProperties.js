const dishesController = require("./dishes.controller");

function dishHasName(req, res, next) {
  const { data: { name } = {} } = req.body;

  if (name) {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}

function dishHasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}

function dishHasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && typeof price === "number") {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a price",
  });
}

function dishHasImageUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

module.exports = {
  bodyHasAllProperties: [dishHasName, 
    dishHasDescription, 
    dishHasPrice, 
    dishHasImageUrl]
}