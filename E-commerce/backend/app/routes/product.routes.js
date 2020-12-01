module.exports = app => {
    const product = require("../controllers/product.controller.js");
    const auth = require("../controllers/auth.js");
  
    var router = require("express").Router();
  
    // Create a new Product
    router.post("/", auth.isAuthenticated, product.create);
  
    // Retrieve all Product
    router.get("/", product.findAll);

    // Retrieve a single Product with id
    router.get("/:id", auth.isAuthenticated, product.findOne);
  
    // Update a Product with id
    router.put("/:id", auth.isAuthenticated, product.update);
  
    // Delete a Product with id
    router.delete("/:id", auth.isAuthenticated, product.delete);
  
    app.use('/api/productos', router);
  };