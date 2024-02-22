'use strict';
const {
  Model
} = require('sequelize');
const helper = require('../helper/helper');
module.exports = (sequelize, DataTypes) => {
  class Apartement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    get formatToIdr() {
      return helper.formatToIdr(this.price)
    }
    static associate(models) {
      // define association here
      Apartement.belongsToMany(models.User, {through: models.Booking})
      Apartement.hasMany(models.Room)
    }
  }
  Apartement.init({
    name: DataTypes.STRING,
    rate: DataTypes.INTEGER,
    facility: DataTypes.STRING,
    price: DataTypes.INTEGER,
    location: DataTypes.STRING,
    imgUrl: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Apartement',
  });
  return Apartement;
};