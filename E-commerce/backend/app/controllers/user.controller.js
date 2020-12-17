const db = require("../models");
const User = db.users;
const Order = db.orders;
const Address = db.addresses;
const Op = db.Sequelize.Op;
const utils = require("../../utils");
const bcrypt = require('bcryptjs');

// Create and Save a new User
exports.create = (req, res) => {
  //Validate request
  if (!req.body.password || !req.body.email || !req.body.name || !req.body.username) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a User
  let user = {
    name: req.body.name,
    password: req.body.password,
    username: req.body.username,
    email: req.body.email,
    lastName: req.body.lastName,
    isAdmin: req.body.isAdmin ? req.body.isAdmin : false
  };

  User.findOne({ where: { username: user.username } })
    .then(data => {
      if (data) {
        const result = bcrypt.compareSync(user.password, data.password);
        if (!result) return res.status(401).send('Password not valid!');
        const token = utils.generateToken(data);
        // get basic user details
        const userObj = utils.getCleanUser(data);
        // return the token along with user details
        return res.json({ user: userObj, access_token: token });
      }

      user.password = bcrypt.hashSync(req.body.password);

      // User not found. Save new User in the database
      User.create(user)
        .then(data => {
          const token = utils.generateToken(data);
          // get basic user details
          const userObj = utils.getCleanUser(data);
          // return the token along with user details
          return res.json({ user: userObj, access_token: token });
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
        });

    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving user."
      });
    });

};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {

  User.findAll(
  //   {
  //   include: [{
  //     model: addresses,
  //     as: 'Address',
  //     through: {
  //       attributes: []
  //     }
  //   },
  //   {
  //     model: orders,
  //     as: 'Orders',
  //     through: {
  //       attributes: []
  //     }
  //   }
  //   ]
  // }
  )
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
};

// Find a single User with an id
exports.findOneByID = (req, res) => {
  const id = req.params.id;

  User.findByPk(id,
  //   {
  //   include: [{
  //     model: addresses,
  //     as: 'Address',
  //     through: {
  //       attributes: []
  //     }
  //   },
  //   {
  //     model: orders,
  //     as: 'Orders',
  //     through: {
  //       attributes: []
  //     }
  //   }
  //   ]
  // }
  )
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Find a single User with a username
exports.findOneByUserName = (req, res) => {
  const username = req.params.username;

  User.findOne({ where: { username: username } },
  //   {
  //   include: [{
  //     model: addresses,
  //     as: 'Address',
  //     through: {
  //       attributes: []
  //     }
  //   },
  //   {
  //     model: orders,
  //     as: 'Orders',
  //     through: {
  //       attributes: []
  //     }
  //   }
  //   ]
  // }
  )
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with email=" + email
      });
    });
}

exports.compareUserNameWithOtherUsers = (req, res) => {
  const username = req.params.username;
  const id = req.params.id;

  User.findOne({ where: { username: username, id:{[Op.ne]:[id] }} },
  //   {
  //   include: [{
  //     model: addresses,
  //     as: 'Address',
  //     through: {
  //       attributes: []
  //     }
  //   },
  //   {
  //     model: orders,
  //     as: 'Orders',
  //     through: {
  //       attributes: []
  //     }
  //   }
  //   ]
  // }
  )
    .then(data => {
      if (data) {
        res.send(true)
      }
      else {
        res.send(false)
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with username=" + username
      });
    });
}


exports.compareEmailWithOtherUsers = (req, res) => {
  const email = req.params.email;
  const id = req.params.id;

  User.findOne({ where: { email: email, id:{[Op.ne]:[id] }} },
  //   {
  //   include: [{
  //     model: addresses,
  //     as: 'Address',
  //     through: {
  //       attributes: []
  //     }
  //   },
  //   {
  //     model: orders,
  //     as: 'Orders',
  //     through: {
  //       attributes: []
  //     }
  //   }
  //   ]
  // }
  )
    .then(data => {
      if (data) {
        res.send(true)
      }
      else {
        res.send(false)
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with username=" + username
      });
    });
}

// Compare if email already exists
exports.compareUsersEmail = (req, res) => {
  const email = req.params.email;

  User.findOne({ where: { email: email } })
    .then(data => {
      if (data) {
        res.send(true)
      }
      else {
        res.send(false)
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with email=" + email
      });
    });

}


// Compare if username already exists
exports.compareUserName = (req, res) => {
  const username = req.params.username;

  User.findOne({ where: { username: username } })
    .then(data => {
      if (data) {
        res.send(true)
      }
      else {
        res.send(false)
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with username=" + username
      });
    });

}
// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
console.log(req.body)
  let user = {
    name: req.body.name,
    password: req.body.password,
    username: req.body.username,
    email: req.body.email,
    lastName: req.body.lastName,
    isAdmin: req.body.isAdmin ? req.body.isAdmin : false
  };

  user.password = bcrypt.hashSync(req.body.password);

  User.update(user, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// // Find user by username and password
// exports.findUserByUsernameAndPassword = (req, res) => {
//   const user = req.body.username;
//   const pwd = req.body.password;

//   User.findOne({ where: { username: user, password: pwd } })
//     .then(data => {
//       res.send(data);
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while retrieving user."
//       });
//     });
// };

exports.addOrder = (req, res) => {
  const orderId = req.body.orderId;
  const userId = req.body.userId;

  return User.findByPk(userId)
    .then((user) => {
      if (!user) {
        console.log("user not found!");
        return null;
      }
      return Order.findByPk(orderId).then((order) => {
        if (!order) {
          console.log("order not found!");
          return null;
        }
        user.addOrder(order);
        console.log(`>> added order id=${order.id} to user id=${user.id}`);
        return user;
      });
    })
    .catch((err) => {
      console.log(">> Error while adding order to user: ", err);
    });
}

exports.addAddress = (req, res) => {
  const userId = req.body.userId;
  const addressId = req.body.addressId;

  return User.findByPk(userId)
    .then((user) => {
      if (!user) {
        console.log("user not found!");
        return null;
      }
      return Address.findByPk(addressId).then((address) => {
        if (!address) {
          console.log("address not found!");
          return null;
        }
        user.addAddress(address);
        console.log(`>> added address id=${address.id} to user id=${user.id}`);
        return user;
      });
    })
    .catch((err) => {
      console.log(">> Error while adding order to user: ", err);
    });

}