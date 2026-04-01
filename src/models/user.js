"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Admin, { foreignKey: "id", as: "adminData" });
      User.hasOne(models.Doctor, { foreignKey: "id", as: "doctorData" });
      User.hasOne(models.Patient, { foreignKey: "id", as: "patientData" });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: DataTypes.STRING,
      birthday: DataTypes.DATE,
      phoneNumber: DataTypes.STRING,
      image: DataTypes.TEXT("long"),
      gender: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JWT refresh token để lấy access token mới",
      },
      refreshTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Thời gian hết hạn của refresh token",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
