


// const POSITIVE_TAPS = {
//   FELT_SAFE: 3,
//   RESPECTFUL: 2,
//   FOLLOWED_RULES: 2,
//   RESPONSIBLE: 2,
//   ROUTE_OK: 1,
//   COMMUNICATION: 1
// };

// const NEGATIVE_TAPS = {
//   UNCOMFORTABLE: -15,
//   RECKLESS: -20,
//   UNNECESSARY_ROUTE: -10,
//   INAPPROPRIATE: -25,
//   IGNORED_COMM: -5,
//   SAFETY_CONCERN: -40
// };

// export const SafetyImpactFactory = {
//   create({ rating, taps }) {

//     // ═══════════════════════════════════════════════════
//     // 1️⃣ STAR IMPACT (low weight)
//     // ═══════════════════════════════════════════════════
//     const STAR_IMPACT = {
//       5: 2,
//       4: 1,
//       3: 0,
//       2: -10,
//       1: -20
//     };

//     const stars = Number(rating?.stars ?? 0);
//     const starImpact = STAR_IMPACT[stars] ?? 0;

//     // ═══════════════════════════════════════════════════
//     // 2️⃣ NORMALIZE & SPLIT TAPS
//     // ═══════════════════════════════════════════════════
//     const normalized = (taps || []).map(t => ({
//       key: String(t.key || "").toUpperCase(),
//       category: t.category
//     }));

//     // ═══════════════════════════════════════════════════
//     // 3️⃣ POSITIVE IMPACT (TOP 2 ONLY)
//     // ═══════════════════════════════════════════════════
//     const positiveImpact = normalized
//       .filter(t => t.category === "positive" && POSITIVE_TAPS[t.key])
//       .map(t => POSITIVE_TAPS[t.key])
//       .sort((a, b) => b - a)
//       .slice(0, 2)
//       .reduce((sum, v) => sum + v, 0);

//     // ═══════════════════════════════════════════════════
//     // 4️⃣ NEGATIVE IMPACT (ALL, CAPPED)
//     // ═══════════════════════════════════════════════════
//     const negativeImpactRaw = normalized
//       .filter(t => t.category === "negative" && NEGATIVE_TAPS[t.key])
//       .map(t => Math.abs(NEGATIVE_TAPS[t.key]))
//       .reduce((sum, v) => sum + v, 0);

//     const negativeImpact = -Math.min(negativeImpactRaw, 40);

//     // ═══════════════════════════════════════════════════
//     // 5️⃣ TOTAL IMPACT (SINGLE-RIDE PROTECTION)
//     // ═══════════════════════════════════════════════════
//     let totalImpact;

//     if (negativeImpact < 0) {
//       totalImpact = negativeImpact; 
//     } else {
//       totalImpact = Math.min(starImpact + positiveImpact, 6);
//     }

//     totalImpact = Math.max(totalImpact, -50);
//     totalImpact = Math.min(totalImpact, 6);

//     // ═══════════════════════════════════════════════════
//     // 6️⃣ HARD SAFETY GUARD
//     // ═══════════════════════════════════════════════════
//     if (!Number.isInteger(totalImpact)) {
//       throw new Error(`Invalid safety impact calculated: ${totalImpact}`);
//     }

//     return {
//       starImpact,
//       positiveImpact,
//       negativeImpact,
//       totalImpact,
//       breakdown: {
//         stars,
//         positiveTapsUsed: Math.min(2, positiveImpact),
//         negativeTapsCount: negativeImpactRaw > 0 ? 1 : 0
//       }
//     };
//   }
// };

const POSITIVE_TAPS = {
  // Rider rating driver
  FELT_SAFE: 3,
  RESPECTFUL: 2,
  FOLLOWED_RULES: 2,
  RESPONSIBLE: 2,
  ROUTE_OK: 1,
  COMMUNICATION: 1,
  
  // Driver rating rider 
  POLITE: 2,
  PUNCTUAL: 2,
  CLEAN: 2,
  EASY_RIDER: 1,
  ACCEPTABLE: 1
};

const NEGATIVE_TAPS = {
  // Rider rating driver
  UNCOMFORTABLE: -15,
  RECKLESS: -20,
  UNNECESSARY_ROUTE: -10,
  INAPPROPRIATE: -25,
  IGNORED_COMM: -5,
  SAFETY_CONCERN: -40,
  
  // Driver rating rider 
  LATE: -10,
  RUDE: -15,
  MESSY: -10,
  VERY_RUDE: -25,
  NO_SHOW: -20,
  DAMAGED_CAR: -30,
  INTOXICATED: -40
};

export const SafetyImpactFactory = {
  create({ rating, taps }) {

    // ═══════════════════════════════════════════════════
    // 1️⃣ STAR IMPACT
    // ═══════════════════════════════════════════════════
    const STAR_IMPACT = {
      5: 2,
      4: 1,
      3: 0,
      2: -10,
      1: -20
    };

    const stars = Number(rating?.stars ?? 0);
    const starImpact = STAR_IMPACT[stars] ?? 0;

    // ═══════════════════════════════════════════════════
    // 2️⃣ NORMALIZE TAPS
    // ═══════════════════════════════════════════════════
    const normalized = (taps || []).map(t => ({
      key: String(t.key || "").toUpperCase(),
      category: t.category
    }));

    // ═══════════════════════════════════════════════════
    // 3️⃣ POSITIVE IMPACT (TOP 2)
    // ═══════════════════════════════════════════════════
    const positiveImpact = normalized
      .filter(t => t.category === "positive" && POSITIVE_TAPS[t.key])
      .map(t => POSITIVE_TAPS[t.key])
      .sort((a, b) => b - a)
      .slice(0, 2)
      .reduce((sum, v) => sum + v, 0);

    // ═══════════════════════════════════════════════════
    // 4️⃣ NEGATIVE IMPACT (CAPPED AT -40 ONLY)
    // ═══════════════════════════════════════════════════
    const negativeImpactRaw = normalized
      .filter(t => t.category === "negative" && NEGATIVE_TAPS[t.key])
      .map(t => Math.abs(NEGATIVE_TAPS[t.key]))
      .reduce((sum, v) => sum + v, 0);

    const negativeImpact = -Math.min(negativeImpactRaw, 40);

    // ═══════════════════════════════════════════════════
    // 5️⃣ TOTAL IMPACT (NO SHORT-CIRCUIT, EVER)
    // ═══════════════════════════════════════════════════
    const rawTotalImpact = negativeImpact + starImpact + positiveImpact;

    // ONLY final clamp allowed
    const totalImpact = Math.max(Math.min(rawTotalImpact, 6), -50);

    // ═══════════════════════════════════════════════════
    // 6️⃣ HARD ASSERTIONS (SAFETY CONTRACT)
    // ═══════════════════════════════════════════════════
    if (!Number.isInteger(totalImpact)) {
      throw new Error(`Invalid safety impact calculated: ${totalImpact}`);
    }

    // 🚨 Contract enforcement: this must NEVER happen
    if (
      negativeImpact === -40 &&
      starImpact < 0 &&
      totalImpact > -50
    ) {
      throw new Error("SAFETY SCORING VIOLATION: star impact ignored");
    }

    return {
      starImpact,
      positiveImpact,
      negativeImpact,
      totalImpact,
      breakdown: {
        stars,
        positiveTapsUsed: Math.min(2, positiveImpact),
        negativeTapsCount: negativeImpactRaw > 0 ? 1 : 0
      }
    };
  }
};
