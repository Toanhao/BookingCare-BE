"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Specialty extends Model {
    static associate(models) {
      Specialty.hasMany(models.Doctor, {
        foreignKey: "specialtyId",
        as: "doctors",
      });
    }
  }
  Specialty.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image: DataTypes.TEXT("long"),
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Specialty",
      tableName: "Specialties",
      timestamps: true,
    }
  );
  return Specialty;
};
