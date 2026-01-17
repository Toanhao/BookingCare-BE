"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PrescriptionItem extends Model {
    static associate(models) {
      PrescriptionItem.belongsTo(models.Prescription, {
        foreignKey: "prescriptionId",
        as: "prescription",
      });
      PrescriptionItem.belongsTo(models.Medicine, {
        foreignKey: "medicineId",
        as: "medicine",
      });
    }
  }

  PrescriptionItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      prescriptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      medicineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      usage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PrescriptionItem",
      tableName: "PrescriptionItems",
      timestamps: true,
    }
  );

  return PrescriptionItem;
};
