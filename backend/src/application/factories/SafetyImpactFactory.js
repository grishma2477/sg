



// export const SafetyImpactFactory = {
//   create({ rating, taps }) {
//     // ═══════════════════════════════════════════════════
//     // 1️⃣ STAR IMPACT (Small & Stable)
//     // ═══════════════════════════════════════════════════
//     const starImpactMap = {
//       5: 2,   // ⭐⭐⭐⭐⭐ → +2
//       4: 1,   // ⭐⭐⭐⭐ → +1
//       3: 0,   // ⭐⭐⭐ → 0
//       2: 0,   // ⭐⭐ → 0 (no positive from low stars)
//       1: 0    // ⭐ → 0 (no positive from low stars)
//     };

//     const stars = rating?.stars || 0;
//     const starImpact = starImpactMap[stars] ?? 0;

//     // ═══════════════════════════════════════════════════
//     // 2️⃣ POSITIVE TAP IMPACT (Top 2 Only)
//     // ═══════════════════════════════════════════════════
//     // Sort by highest point value, take only top 2
//     const positiveTaps = (taps || [])
//       .filter(t => t.category === "positive")
//       .map(t => t.pointValue)
//       .sort((a, b) => b - a)  
//       .slice(0, 2);           

//     const positiveImpact = positiveTaps.reduce((sum, p) => sum + p, 0);

//     // ═══════════════════════════════════════════════════
//     // 3️⃣ NEGATIVE TAP IMPACT (All count, capped at -40)
//     // ═══════════════════════════════════════════════════
//     const negativeTaps = (taps || [])
//       .filter(t => t.category === "negative")
//       .map(t => Math.abs(t.pointValue));

//     const negativeImpactRaw = negativeTaps.reduce((sum, p) => sum + p, 0);
//     const negativeImpact = -Math.min(negativeImpactRaw, 40);

//     // ═══════════════════════════════════════════════════
//     // 4️⃣ TOTAL IMPACT CALCULATION
//     // ═══════════════════════════════════════════════════
//     // If there are negative taps, it's a negative ride
//     // Otherwise calculate positive impact with cap
    
//     let totalImpact;
    
//     if (negativeImpact < 0) {
//       // Negative ride: star impact doesn't help, negative dominates
//       totalImpact = negativeImpact;
//     } else {
//       // Positive ride: star + top 2 taps, capped at +6
//       totalImpact = Math.min(starImpact + positiveImpact, 6);
//     }

//     // Final safety bounds
//     totalImpact = Math.max(totalImpact, -50);  // Floor at -50
//     totalImpact = Math.min(totalImpact, 6);    // Ceiling at +6

//     return {
//       starImpact,
//       positiveImpact,
//       negativeImpact,
//       totalImpact,
//       breakdown: {
//         stars,
//         positiveTapsUsed: positiveTaps.length,
//         negativeTapsCount: negativeTaps.length
//       }
//     };
//   }
// };


// Canonical definitions (single source of truth)
const POSITIVE_TAPS = {
  FELT_SAFE: 3,
  RESPECTFUL: 2,
  FOLLOWED_RULES: 2,
  RESPONSIBLE: 2,
  ROUTE_OK: 1,
  COMMUNICATION: 1
};

const NEGATIVE_TAPS = {
  UNCOMFORTABLE: -15,
  RECKLESS: -20,
  UNNECESSARY_ROUTE: -10,
  INAPPROPRIATE: -25,
  IGNORED_COMM: -5,
  SAFETY_CONCERN: -40
};

export const SafetyImpactFactory = {
  create({ rating, taps }) {

    // ═══════════════════════════════════════════════════
    // 1️⃣ STAR IMPACT (low weight)
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
    // 2️⃣ NORMALIZE & SPLIT TAPS
    // ═══════════════════════════════════════════════════
    const normalized = (taps || []).map(t => ({
      key: String(t.key || "").toUpperCase(),
      category: t.category
    }));

    // ═══════════════════════════════════════════════════
    // 3️⃣ POSITIVE IMPACT (TOP 2 ONLY)
    // ═══════════════════════════════════════════════════
    const positiveImpact = normalized
      .filter(t => t.category === "positive" && POSITIVE_TAPS[t.key])
      .map(t => POSITIVE_TAPS[t.key])
      .sort((a, b) => b - a)
      .slice(0, 2)
      .reduce((sum, v) => sum + v, 0);

    // ═══════════════════════════════════════════════════
    // 4️⃣ NEGATIVE IMPACT (ALL, CAPPED)
    // ═══════════════════════════════════════════════════
    const negativeImpactRaw = normalized
      .filter(t => t.category === "negative" && NEGATIVE_TAPS[t.key])
      .map(t => Math.abs(NEGATIVE_TAPS[t.key]))
      .reduce((sum, v) => sum + v, 0);

    const negativeImpact = -Math.min(negativeImpactRaw, 40);

    // ═══════════════════════════════════════════════════
    // 5️⃣ TOTAL IMPACT (SINGLE-RIDE PROTECTION)
    // ═══════════════════════════════════════════════════
    let totalImpact;

    if (negativeImpact < 0) {
      totalImpact = negativeImpact; // negatives dominate
    } else {
      totalImpact = Math.min(starImpact + positiveImpact, 6);
    }

    totalImpact = Math.max(totalImpact, -50);
    totalImpact = Math.min(totalImpact, 6);

    // ═══════════════════════════════════════════════════
    // 6️⃣ HARD SAFETY GUARD
    // ═══════════════════════════════════════════════════
    if (!Number.isInteger(totalImpact)) {
      throw new Error(`Invalid safety impact calculated: ${totalImpact}`);
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
