"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Patient, {
        foreignKey: "patientId",
        as: "patient",
      });
      Booking.belongsTo(models.Schedule, {
        foreignKey: "scheduleId",
        as: "schedule",
      });
      Booking.hasOne(models.MedicalRecord, {
        foreignKey: "bookingId",
        as: "medicalRecord",
      });
    }
  }
  Booking.init(
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
      scheduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      queueNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "Bookings",
      timestamps: true,
    }
  );
  return Booking;
};
