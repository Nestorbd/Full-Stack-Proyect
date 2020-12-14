'use strict';
module.exports = (sequelize, Sequelize) => {
    const Orders = sequelize.define("orders", {
        date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true
        },
        id_user: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, { timestamp: false });

    Orders.associate = function(models) {
        Orders.belongsToMany(models.orders, {
            through: "orderProduct",
            foreignKey: "id_order",
            as: "orders"
          });
      }
    return Orders;
}