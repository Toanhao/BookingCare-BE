"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Clinic extends Model {
    static associate(models) {
      Clinic.hasMany(models.Doctor, { foreignKey: "clinicId", as: "doctors" });
    }
  }
  Clinic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: DataTypes.TEXT("long"),
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Clinic",
      tableName: "Clinics",
      timestamps: true,
    }
  );
  return Clinic;
};
