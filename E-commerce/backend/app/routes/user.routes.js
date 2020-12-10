module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const auth = require("../controllers/auth.js");
  
    var router = require("express").Router();
  
    // Create a new User
    router.post("/", users.create);
  
    // Retrieve all User
    router.get("/", auth.isAuthenticated, users.findAll);
    
    // Retrieve a single User with username
    router.get("/:username", auth.isAuthenticated, users.findOneByUserName);

    // Compare usersnames
    router.get("/compare/:username", auth.isAuthenticated, users.compareUsersNames);
  
    // Update a User with id
    router.put("/:username", auth.isAuthenticated, users.update);

    // Sign in
    router.post("/signin", auth.signin);
  
    // // Delete a User with id
    // router.delete("/:id", users.delete);
  
  
    app.use('/api/usuarios', router);
  };