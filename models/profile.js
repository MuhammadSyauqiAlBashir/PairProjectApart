'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async showRoleAndName(id) {
      try {
        const dataProfile = await Profile.findOne({
          where : {
            UserId : id
          }
        })
        let name
        if (dataProfile.gender === "male"){
          name = `Bapak ${dataProfile.name}`
        }else if(dataProfile.gender === "female") {
          name =  `Ibu ${dataProfile.name}`
        }
        return name
      } catch (error) {
        throw error
      }
    }
    static associate(models) {
      // define association here
      Profile.belongsTo(models.User)
    }
  }
  Profile.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Input Profile Name'
        },
        notEmpty: {
          msg: 'Input Profile Name'
        }
      }
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Input Profile Gender'
        },
        notEmpty: {
          msg: 'Input Profile Gender'
        }
      }
    },
    nik: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Input NIK'
        },
        notEmpty: {
          msg: 'Input NIK'
        }
      }
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Input Birth Date'
        },
        notEmpty: {
          msg: 'Input Birth Date'
        },
        isBefore: {
          args: new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toLocaleString("en-CA", {year : "numeric", month : "numeric", day : "numeric"}),
          msg: "Minimum age is 18 Year"
        }
      }
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Input Email'
        },
        notEmpty: {
          msg: 'Input Email'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};