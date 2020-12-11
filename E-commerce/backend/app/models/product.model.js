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
          type: Sequelize.INTEGER,
          allowNull: false
      },
      tax_rate: {
          type: Sequelize.FLOAT,
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
          type: Sequelize.INTEGER,
          allowNull: true
      },
      availability: {
          type: Sequelize.INTEGER,
          allowNull: false
      }
    }, { timestamps: false});

    return Product;
};