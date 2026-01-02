// export const SafetyImpactFactory = {
//   create({ rating, taps }) {
//     //star impact
//     const starImpactMap = {
//       5: 2,
//       4: 1,
//       3: 0,
//       2: -5,
//       1: -10
//     };

//     const starImpact = starImpactMap[rating.stars] ?? 0;

//     //positive impact  
//     const positiveImpactRaw = taps
//       .filter(t => t.category === "positive")
//       .reduce((sum, t) => sum + t.pointValue, 0);

//     const positiveImpact = Math.min(positiveImpactRaw, 6);

//     // negative Impact 
//     const negativeImpactRaw = taps
//       .filter(t => t.category === "negative")
//       .reduce((sum, t) => sum + Math.abs(t.pointValue), 0);

//     const negativeImpact = -Math.min(negativeImpactRaw, 40);

//     // Total impact either positive or negative but never both 
//     let totalImpact = starImpact + positiveImpact + negativeImpact;

//     //capping 
//     totalImpact = Math.min(totalImpact, 8);
//     totalImpact = Math.max(totalImpact, -50);

//     return {
//       starImpact,
//       positiveImpact,
//       negativeImpact,
//       totalImpact
//     };
//   }
// };




export const SafetyImpactFactory = {
  create({ rating, taps }) {
    // ═══════════════════════════════════════════════════
    // 1️⃣ STAR IMPACT (Small & Stable)
    // ═══════════════════════════════════════════════════
    const starImpactMap = {
      5: 2,   // ⭐⭐⭐⭐⭐ → +2
      4: 1,   // ⭐⭐⭐⭐ → +1
      3: 0,   // ⭐⭐⭐ → 0
      2: 0,   // ⭐⭐ → 0 (no positive from low stars)
      1: 0    // ⭐ → 0 (no positive from low stars)
    };

    const stars = rating?.stars || 0;
    const starImpact = starImpactMap[stars] ?? 0;

    // ═══════════════════════════════════════════════════
    // 2️⃣ POSITIVE TAP IMPACT (Top 2 Only)
    // ═══════════════════════════════════════════════════
    // Sort by highest point value, take only top 2
    const positiveTaps = (taps || [])
      .filter(t => t.category === "positive")
      .map(t => t.pointValue)
      .sort((a, b) => b - a)  
      .slice(0, 2);           

    const positiveImpact = positiveTaps.reduce((sum, p) => sum + p, 0);

    // ═══════════════════════════════════════════════════
    // 3️⃣ NEGATIVE TAP IMPACT (All count, capped at -40)
    // ═══════════════════════════════════════════════════
    const negativeTaps = (taps || [])
      .filter(t => t.category === "negative")
      .map(t => Math.abs(t.pointValue));

    const negativeImpactRaw = negativeTaps.reduce((sum, p) => sum + p, 0);
    const negativeImpact = -Math.min(negativeImpactRaw, 40);

    // ═══════════════════════════════════════════════════
    // 4️⃣ TOTAL IMPACT CALCULATION
    // ═══════════════════════════════════════════════════
    // If there are negative taps, it's a negative ride
    // Otherwise calculate positive impact with cap
    
    let totalImpact;
    
    if (negativeImpact < 0) {
      // Negative ride: star impact doesn't help, negative dominates
      totalImpact = negativeImpact;
    } else {
      // Positive ride: star + top 2 taps, capped at +6
      totalImpact = Math.min(starImpact + positiveImpact, 6);
    }

    // Final safety bounds
    totalImpact = Math.max(totalImpact, -50);  // Floor at -50
    totalImpact = Math.min(totalImpact, 6);    // Ceiling at +6

    return {
      starImpact,
      positiveImpact,
      negativeImpact,
      totalImpact,
      breakdown: {
        stars,
        positiveTapsUsed: positiveTaps.length,
        negativeTapsCount: negativeTaps.length
      }
    };
  }
};