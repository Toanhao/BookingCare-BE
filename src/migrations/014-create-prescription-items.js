"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PrescriptionItems", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      prescriptionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Prescriptions", key: "id" },
      },
      medicineId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Medicines", key: "id" },
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      usage: { type: Sequelize.STRING, allowNull: false },
      duration: { type: Sequelize.INTEGER, allowNull: false },
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
    await queryInterface.dropTable("PrescriptionItems");
  },
};
