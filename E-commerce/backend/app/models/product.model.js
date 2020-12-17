module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("products", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
      description: {
          type: Sequelize.STRING,
          allowNull: true
      },
      price: {
          type: Sequelize.FLOAT,
          allowNull: false
      },
      tax_rate: {
          type: Sequelize.FLOAT,
          allowNull: true
      },
      img: {
          type: Sequelize.BLOB,
          allowNull: true
      },
      category: {
          type: Sequelize.STRING,
          allowNull: true
      },
      quantity: {
          type: Sequelize.INTEGER,
          allowNull: true
      },
      available: {
          type: Sequelize.INTEGER,
          allowNull: false
      }
    }, { timestamps: false});

    Product.associate = function(models) {
        Product.belongsToMany(models.products, {
            through: "orderProduct",
            foreignKey: "id_product",
            as: "products"
          });
      }

    return Product;
};