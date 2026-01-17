"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    static associate(models) {
      Doctor.belongsTo(models.User, { foreignKey: "id", as: "user" });
      Doctor.belongsTo(models.Clinic, { foreignKey: "clinicId", as: "clinic" });
      Doctor.belongsTo(models.Specialty, {
        foreignKey: "specialtyId",
        as: "specialty",
      });
      Doctor.hasMany(models.Handbook, {
        foreignKey: "doctorId",
        as: "handbooks",
      });
      Doctor.hasMany(models.Schedule, {
        foreignKey: "doctorId",
        as: "schedules",
      });
      Doctor.hasMany(models.MedicalRecord, {
        foreignKey: "doctorId",
        as: "medicalRecords",
      });
      Doctor.hasMany(models.Prescription, {
        foreignKey: "doctorId",
        as: "prescriptions",
      });
    }
  }

  Doctor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      clinicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      specialtyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fee: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      bio: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Doctor",
      tableName: "Doctors",
      timestamps: true,
    }
  );

  return Doctor;
};
