"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    static associate(models) {
      Patient.belongsTo(models.User, { foreignKey: "id", as: "user" });
      Patient.hasMany(models.Booking, {
        foreignKey: "patientId",
        as: "bookings",
      });
      Patient.hasMany(models.MedicalRecord, {
        foreignKey: "patientId",
        as: "medicalRecords",
      });
      Patient.hasMany(models.Bill, { foreignKey: "patientId", as: "bills" });
    }
  }

  Patient.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "Users", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "Patient",
      tableName: "Patients",
      timestamps: true,
    }
  );

  return Patient;
};
