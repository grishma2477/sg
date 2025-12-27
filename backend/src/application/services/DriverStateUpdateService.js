// export class DriverStateUpdateService {
//   apply({ driverSafetyState, safetyImpact }) {
//     const newPoints =
//       driverSafetyState.points.value + safetyImpact.totalImpact;

//     return {
//       ...driverSafetyState,
//       points: driverSafetyState.points.constructor(newPoints),
//       lastUpdatedAt: new Date()
//     };
//   }
// }
import DriverModel from "../../models/driver/Driver.js";

export class DriverStateUpdateService {
  async apply({ driverId, totalImpact }) {
    const driver = await DriverModel.findById(driverId);

    const previousPoints = driver.safety_points || 0;
    const newPoints = previousPoints + totalImpact;

    await DriverModel.findByIdAndUpdate(driverId, {
      safety_points: newPoints
    });

    return { previousPoints, newPoints };
  }
}
