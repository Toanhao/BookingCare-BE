"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Prescription extends Model {
    static associate(models) {
      Prescription.belongsTo(models.MedicalRecord, {
        foreignKey: "medicalRecordId",
        as: "medicalRecord",
      });
      Prescription.belongsTo(models.Doctor, {
        foreignKey: "doctorId",
        as: "doctor",
      });
      Prescription.hasMany(models.PrescriptionItem, {
        foreignKey: "prescriptionId",
        as: "items",
      });
    }
  }

  Prescription.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      medicalRecordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Prescription",
      tableName: "Prescriptions",
      timestamps: true,
    }
  );

  return Prescription;
};
