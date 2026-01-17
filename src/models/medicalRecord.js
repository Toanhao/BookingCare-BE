"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MedicalRecord extends Model {
    static associate(models) {
      MedicalRecord.belongsTo(models.Patient, {
        foreignKey: "patientId",
        as: "patient",
      });
      MedicalRecord.belongsTo(models.Doctor, {
        foreignKey: "doctorId",
        as: "doctor",
      });
      MedicalRecord.belongsTo(models.Booking, {
        foreignKey: "bookingId",
        as: "booking",
      });
      MedicalRecord.hasOne(models.Prescription, {
        foreignKey: "medicalRecordId",
        as: "prescription",
      });
      MedicalRecord.hasOne(models.Bill, {
        foreignKey: "medicalRecordId",
        as: "bill",
      });
    }
  }

  MedicalRecord.init(
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
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      diagnosis: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      conclusion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "MedicalRecord",
      tableName: "MedicalRecords",
      timestamps: true,
    }
  );

  return MedicalRecord;
};
