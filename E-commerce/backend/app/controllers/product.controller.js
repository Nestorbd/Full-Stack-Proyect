const db = require("../models");
const Product = db.products;
const Op = db.Sequelize.Op;

// Create and Save a new Product
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.price || !req.body.availability || !req.body.quantity) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Product
    const product = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        tax_rate: req.body.tax_rate,
        image: req.body.image,
        category: req.body.category,
        quantity: req.body.quantity,
        availability: req.body.availability
    };

    // Save Product in the database
    Product.create(product)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the product."
            });
        });
};

// Retrieve all Product from the database.
exports.findAll = (req, res) => {
    Product.findAll(
    //     { 
    //     include: [{
    //         model: orders,
    //         as: 'Orders',
    //         through: {
    //             attributes: [],
    //           }
    //     }
    // ]
    // }
    )
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

// Find a single Product with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
console.log("esto es findOne")
    Product.findByPk(id,
    //      { 
    //     include: [{
    //         model: orders,
    //         as: 'Orders',
    //         through: {
    //             attributes: [],
    //           }
    //     }]
    // }
    )
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Product with id=" + id
            });
        });
};

// Update a Product by the id in the request
exports.update = (req, res) => {
    console.log("pasa por update")
    const id = req.params.id;

    Product.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Product was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Product with id=" + id
            });
        });
};

// Delete a Product with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Product.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Product was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Product with id=" + id
            });
        });
};

exports.compareProductName = (req,res) =>{
    const name = req.params.name;

    Product.findOne({ where: { name: name } })
.then(data => {
  if(data){
  res.send(true)
  }
  else{
    res.send(false)
  }
})
.catch(err => {
  res.status(500).send({
    message: "Error retrieving Product with name=" + name
  });
});
}