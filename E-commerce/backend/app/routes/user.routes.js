module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const auth = require("../controllers/auth.js");
    const order = require("../controllers/order.controller.js");
    const address = require("../controllers/address.controller.js");

    var router = require("express").Router();
  
    // Create a new User
    router.post("/", users.create);
  
    // Retrieve all User
    router.get("/", auth.isAuthenticated, users.findAll);
    
    // Retrieve a single User with username
    router.get("/:username", auth.isAuthenticated, users.findOneByUserName);

    // Compare email
    router.get("/email/compare/:email", users.compareUsersEmail);
  
    // Compare username
    router.get("/username/compare/:username", users.compareUserName);

    // Compare username with others users
    router.get("/users/update/compare/username/:username/:id",auth.isAuthenticated, users.compareUserNameWithOtherUsers);
    
    // Compare email with others users
    router.get("/users/update/compare/email/:email/:id",auth.isAuthenticated, users.compareEmailWithOtherUsers);

    // Update a User with id
    router.put("/:id", auth.isAuthenticated, users.update);

    // Sign in
    router.post("/signin", auth.signin);
  
    // Delete a User with id
    router.delete("/:id",auth.isAuthenticated, users.delete);
  
    // Add order
    router.post("/order",auth.isAuthenticated, order.create, users.addOrder);

    // Add address
    router.post("/address",auth.isAuthenticated, address.create, users.addAddress);
  
    app.use('/api/usuarios', router);
  };