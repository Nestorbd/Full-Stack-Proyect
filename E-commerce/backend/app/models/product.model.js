module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
      description: {
          type: Sequelize.STRING,
          allowNull: true
      },
      price: {
          type: Sequelize.NUMBER,
          allowNull: false
      },
      tax_rate: {
          type: Sequelize.NUMBER,
          allowNull: true
      },
      image: {
          type: Sequelize.BLOB,
          allowNull: true
      },
      category: {
          type: Sequelize.STRING,
          allowNull: true
      },
      quantity: {
          type: Sequelize.NUMBER,
          allowNull: true
      },
      availability: {
          type: Sequelize.BOOLEAN,
          allowNull: false
      }
    }, { timestamps: false});

    return Product;
};