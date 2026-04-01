"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "refreshToken", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "JWT refresh token để lấy access token mới",
    });

    await queryInterface.addColumn("Users", "refreshTokenExpiresAt", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Thời gian hết hạn của refresh token",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "refreshToken");
    await queryInterface.removeColumn("Users", "refreshTokenExpiresAt");
  },
};
