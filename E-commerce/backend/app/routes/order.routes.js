module.exports = app => {
    const order = require("../controllers/order.controller.js");
    const auth = require("../controllers/auth.js");
  
    var router = require("express").Router();
  
    // Create a new order
    router.post("/", auth.isAuthenticated, order.create);
  
    // Retrieve all order
    router.get("/", auth.isAuthenticated, order.findAll);

    // Retrieve a single order with id
    router.get("/:id",auth.isAuthenticated, order.findOne);

    // Update a order with id
    router.put("/:id", auth.isAuthenticated, order.update);
  
    // Delete a order with id
    router.delete("/:id", auth.isAuthenticated, order.delete);

    //Add product
  router.post("/product", auth.isAuthenticated, order.addProduct);

    app.use('/api/orders', router);
  };