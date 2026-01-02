const { Driver } = require("../../../domain/entities/driver/Driver");
const { DriverSafetyStats } = require("../../../domain/entities/driver/DriverSafetyStats");
const { SafetyAuditLog } = require("../../../domain/entities/safety/SafetyAuditLog");

class DriverQueryManager {
  async findById(driverId) {
    return await Driver.findOne({ where: { id: driverId } });
  }

  async findSafetyStats(driverId) {
    return await DriverSafetyStats.findOne({ where: { driverId } });
  }

  async updateSafetyPoints(driverId, newPoints) {
    // Update safety stats
    await DriverSafetyStats.update(
      { safetyPoints: newPoints, updatedAt: new Date() },
      { where: { driverId } }
    );

    // Create safety audit log
    await SafetyAuditLog.create({
      driverId,
      safetyPoints: newPoints,
      impactSummary: `Safety points updated to ${newPoints}`,
      calculatedAt: new Date(),
      createdAt: new Date()
    });
  }

  async initSafetyPoints(driverId) {
    // Ensure every driver starts with 1000 safety points
    const exists = await this.findSafetyStats(driverId);
    if (!exists) {
      await DriverSafetyStats.create({
        driverId,
        safetyPoints: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
}

module.exports = new DriverQueryManager();
