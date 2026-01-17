"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Doctors", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      clinicId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Clinics", key: "id" },
      },
      specialtyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Specialties", key: "id" },
      },
      title: { type: Sequelize.STRING, allowNull: false },
      fee: { type: Sequelize.FLOAT, allowNull: false },
      bio: { type: Sequelize.TEXT, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Doctors");
  },
};
