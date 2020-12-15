const db = require("../models");
const address = db.addresses;
const Op = db.Sequelize.Op;

// Create and Save a new Product
exports.create = (req, res) => {
    // Validate request
    if (!req.body.street || !req.body.number || !req.body.zip_code || !req.body.location || !req.body.province || !req.body.country || !req.body.id_user) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a address
    const address = {
        id: req.body.id,
        street: req.body.street,
        number: req.body.number,
        zip_code: req.body.zip_code,
        location: req.body.location,
        province: req.body.province,
        country: req.body.country,
        id_user: req.body.id_user
    };

    // Save address in the database
    address.create(address)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the address."
            });
        });
};

// Retrieve all address from the database.
exports.findAll = (req, res) => {
    address.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving product."
            });
        });
};

// Find a single address with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
console.log("esto es findOne")
address.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving address with id=" + id
            });
        });
};

// Update a address by the id in the request
exports.update = (req, res) => {
    console.log("pasa por update")
    const id = req.params.id;

    address.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "address was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update address with id=${id}. Maybe address was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating address with id=" + id
            });
        });
};

// Delete a Product with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    address.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "address was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete address with id=${id}. Maybe address was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete address with id=" + id
            });
        });
};

