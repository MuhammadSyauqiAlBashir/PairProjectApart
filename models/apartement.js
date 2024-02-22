'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Apartement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Apartement.belongsToMany(models.User, {through: models.Booking,})
      Apartement.hasMany(models.Room)
    }
  }
  Apartement.init({
    name: DataTypes.STRING,
    rate: DataTypes.INTEGER,
    facility: DataTypes.STRING,
    price: DataTypes.INTEGER,
    location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Apartement',
  });
  return Apartement;
};