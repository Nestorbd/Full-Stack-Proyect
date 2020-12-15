'use strict';
module.exports = (sequelize, Sequelize) => {
    const Address = sequelize.define('addresses', {
        street: {
            type: Sequelize.STRING,
            allowNull: false
        },
        number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        zip_code: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        location: {
            type: Sequelize.STRING,
            allowNull: false
        },
        province: {
            type: Sequelize.STRING,
            allowNull: false
        },
        country: {
            type: Sequelize.STRING,
            allowNull: false
        },
        id_user: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {});

    Address.associate = function(models) {
        Address.belongsTo(models.users, {
          foreignKey: "id_user",
          as: "users"
        });
      }
    return Address;
}