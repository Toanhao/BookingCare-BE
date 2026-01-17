"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
    static associate(models) {
      Medicine.hasMany(models.PrescriptionItem, {
        foreignKey: "medicineId",
        as: "prescriptionItems",
      });
    }
  }

  Medicine.init(
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
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Medicine",
      tableName: "Medicines",
      timestamps: true,
    }
  );

  return Medicine;
};
