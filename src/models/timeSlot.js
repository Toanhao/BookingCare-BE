"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TimeSlot extends Model {
    static associate(models) {
      TimeSlot.hasMany(models.Schedule, {
        foreignKey: "timeSlotId",
        as: "schedules",
      });
    }
  }

  TimeSlot.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TimeSlot",
      tableName: "TimeSlots",
      timestamps: true,
    }
  );

  return TimeSlot;
};
