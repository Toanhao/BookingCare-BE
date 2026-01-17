"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
      Schedule.belongsTo(models.Doctor, {
        foreignKey: "doctorId",
        as: "doctor",
      });
      Schedule.belongsTo(models.TimeSlot, {
        foreignKey: "timeSlotId",
        as: "timeSlot",
      });
      Schedule.hasMany(models.Booking, {
        foreignKey: "scheduleId",
        as: "bookings",
      });
    }
  }
  Schedule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timeSlotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      workDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      maxPatient: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Schedule",
      tableName: "Schedules",
      timestamps: true,
    }
  );
  return Schedule;
};
