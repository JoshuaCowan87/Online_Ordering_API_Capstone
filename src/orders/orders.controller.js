const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//middleware
function orderHasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}
function orderHasBody(req, res, next) {
  const body = req.body;
  if (body) {
    res.locals.body = body;
    next();
  } else {
    next();
  }
}
function orderHasMobileNumber(req, res, next) {
  const mobileNumber = req.body.data.mobileNumber;
  if (mobileNumber) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}

function orderHasDishes(req, res, next) {
  const dishes = req.body.data.dishes;
  if (dishes && dishes.length > 0 && Array.isArray(dishes)) {
    next();
  } else
    next({
      status: 400,
      message: "Order must include a dish",
    });
}

function orderHasDishQuantity(req, res, next) {
  const dishes = req.body.data.dishes;
  const index = dishes.findIndex(
    (dish) =>
      !dish.quantity > 0 || !dish.quantity || !Number.isInteger(dish.quantity)
  );
  if (index !== -1) {
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  } else {
    next();
  }
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.foundOrder = foundOrder;
    res.locals.orderId = orderId;
    next();
  } else
    next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
}

function idsMatchToUpdate(req, res, next) {
  const orderId = req.params.orderId;
  const id = req.body.data.id;
  if (!id) next();
  if (orderId !== id) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  next();
}

function orderHasStatus(req, res, next) {
  const status = req.body.data.status;
  console.log("status", status);
  if (status && status !== "invalid") {
    return next();
  } else
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
}

function statusNotPending(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder.status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  next();
}

// route handlers
function list(req, res, next) {
  res.json({ data: orders });
}

function read(req, res, next) {
  res.json({ data: res.locals.foundOrder });
}

function create(req, res, next) {
  const newOrder = { ...req.body.data, id: nextId() };
  orders.push(newOrder);
  res.status(201).send({ data: newOrder });
}

function update(req, res, next) {
  const { deliverTo, mobileNumber, status, dishes } = req.body.data;
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;
  res.status(200).json({ data: foundOrder });
}

function destroy(req, res, next) {
  const orderId = req.params.orderId;
  const indexToDelete = orders.findIndex((order) => order.id === orderId);
  orders.slice(indexToDelete, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    orderHasBody,
    orderHasDeliverTo,
    orderHasMobileNumber,
    orderHasDishes,
    orderHasDishQuantity,
    create,
  ],
  update: [
    orderHasBody,
    orderExists,
    orderHasDeliverTo,
    orderHasMobileNumber,
    orderHasDishes,
    orderHasDishQuantity,
    idsMatchToUpdate,
    orderHasStatus,
    update,
  ],
  destroy: [orderExists, statusNotPending, destroy],
};
