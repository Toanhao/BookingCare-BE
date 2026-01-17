"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Bill extends Model {
    static associate(models) {
      Bill.belongsTo(models.Patient, {
        foreignKey: "patientId",
        as: "patient",
      });
      Bill.belongsTo(models.MedicalRecord, {
        foreignKey: "medicalRecordId",
        as: "medicalRecord",
      });
    }
  }

  Bill.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      medicalRecordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Bill",
      tableName: "Bills",
      timestamps: true,
    }
  );

  return Bill;
};
