"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserTarget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({}) {
      // define association here
    }
  }
  UserTarget.init(
    {
      getUpAt: DataTypes.DATE,
      sleepAt: DataTypes.DATE,
      kcal: DataTypes.INTEGER,
      footsteps_amount: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserTarget",
      tableName: "usertargets",
    },
  );
  return UserTarget;
};