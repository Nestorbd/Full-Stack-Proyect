module.exports = app => {
const address = require("../controllers/address.controller.js");
const auth = require("../controllers/auth.js");

var router = require("express").Router();

// Create a new address
router.post("/", auth.isAuthenticated, address.create);

// Retrieve all address
router.get("/", auth.isAuthenticated, address.findAll);

// Retrieve a single address with id
router.get("/:id",auth.isAuthenticated, address.findOne);

// Update a address with id
router.put("/:id", auth.isAuthenticated, address.update);

// Delete a address with id
router.delete("/:id", auth.isAuthenticated, address.delete);


app.use('/api/address', router);
};