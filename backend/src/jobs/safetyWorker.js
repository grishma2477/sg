import { SafetyCalculationService } from "../application/services/SafetyCalculationService.js";
import { DriverStateUpdateService } from "../application/services/DriverStateUpdateService.js";
import { AuditService } from "../application/services/AuditService.js";

export async function runSafetyWorker({ review }) {
  // 1️⃣ Calculate safety impact
  const safetyImpact =
    new SafetyCalculationService().calculate(review);

  // 2️⃣ Update driver state
  const { previousPoints, newPoints } =
    await new DriverStateUpdateService().apply({
      driverId: review.driverId,
      totalImpact: safetyImpact.totalImpact
    });

  // 3️⃣ Audit
  await new AuditService().record({
    driverId: review.driverId,
    reviewId: review.id,
    before: previousPoints,
    after: newPoints
  });

  return { safetyImpact, newPoints };
}


// import { SafetyCalculationService } from "../application/services/SafetyCalculationService.js";
// import DriverModel from "../models/driver/Driver.js";
// import SafetyAuditModel from "../models/safety/SafetyAudit.js";

// export async function runSafetyWorker({ review }) {
//   const safetyService = new SafetyCalculationService();

//   // 1️⃣ Calculate impact
//   const impact = safetyService.calculate(review);

//   // 2️⃣ Fetch driver
//   const driver = await DriverModel.findById(review.driverId);

//   const previousPoints = driver.safety_points || 0;
//   const newPoints = previousPoints + impact.totalImpact;

//   // 3️⃣ Update driver profile
//   await DriverModel.findByIdAndUpdate(driver.id, {
//     safety_points: newPoints
//   });

//   // 4️⃣ Audit (VERY IMPORTANT)
//   await SafetyAuditModel.create({
//     driver_id: driver.id,
//     review_id: review.id,
//     before_points: previousPoints,
//     after_points: newPoints,
//     reason: "REVIEW_IMPACT"
//   });

//   return { newPoints, impact };
// }
