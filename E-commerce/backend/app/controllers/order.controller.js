const db = require("../models");
const orders = db.orders;
const product = db.products;
const Op = db.Sequelize.Op;

// Create and Save a new orders
exports.create = (req, res) => {
    // Validate request
    if (!req.body.id_user) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a orders
    const orders = {
        id: req.body.id,
        date: req.body.date,
        status: req.body.status,
        id_user: req.body.id_user
    };

    // Save orders in the database
    orders.create(orders)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the orders."
            });
        });
};

// Retrieve all address from the database.
exports.findAll = (req, res) => {
    orders.findAll(
    //     {
    //     include: [{
    //         model: products,
    //         as: "Products",
    //         through: { 
    //             attributes: [] 
    //         }
    //     }]
    // }
    )
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving orders."
            });
        });
};

// Find a single orders with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
console.log("esto es findOne")
orders.findByPk(id, 
//     { 
//     include: [{
//         model: products,
//         as: "Products",
//         through: { 
//             attributes: [] 
//         }
//     }
// ]
// }
)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving orders with id=" + id
            });
        });
};

// Update a orders by the id in the request
exports.update = (req, res) => {
    console.log("pasa por update")
    const id = req.params.id;

    orders.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "orders was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update orders with id=${id}. Maybe orders was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating orders with id=" + id
            });
        });
};

// Delete a orders with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    orders.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "orders was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete orders with id=${id}. Maybe orders was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete orders with id=" + id
            });
        });
};

exports.addProduct = (req,res) =>{
 const   orderId = req.body.orderid;
 const   productId = req.body.productid;

 return orders.findByPk(orderId)
    .then((order) => {
      if (!order) {
        console.log("Order not found!");
        return null;
      }
      return product.findByPk(productId).then((product) => {
        if (!product) {
          console.log("product not found!");
          return null;
        }
        orders.addProduct(product);
        console.log(`>> added product id=${product.id} to order id=${order.id}`);
        return order;
      });
    })
    .catch((err) => {
      console.log(">> Error while adding product to order: ", err);
    });
}

// exports.deleteProduct = (req,res) =>{
//     const   orderId = req.body.orderid;
//     const   productId = req.body.productid;
   
//     return orders.findByPk(orderId)
//        .then((order) => {
//          if (!order) {
//            console.log("Order not found!");
//            return null;
//          }
//          return product.findByPk(productId).then((product) => {
//            if (!product) {
//              console.log("product not found!");
//              return null;
//            }
   
//            orders.addProduct(product);
//            console.log(`>> added product id=${product.id} to order id=${order.id}`);
//            return order;
//          });
//        })
//        .catch((err) => {
//          console.log(">> Error while adding product to order: ", err);
//        });
//    }