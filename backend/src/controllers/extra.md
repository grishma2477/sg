
// #--------------------------------------------------------

function starImpact(stars) {
  return {5: 2, 4: 1, 3: 0, 2: -5, 1: -10}[stars];
}
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
positiveImpact = sumTop2(positiveTaps);
negativeImpact = sumAll(negativeTaps);
negativeImpact = Math.max(negativeImpact, -40);

totalImpact =
  starImpact(rating) +
  positiveImpact +
  negativeImpact;

totalImpact = Math.max(totalImpact, -50);


UPDATE driver_safety_stats
SET
  points = LEAST(GREATEST(points + $impact, 0), 1500),
  total_rides = total_rides + 1,
  avg_rating = ((avg_rating * (total_rides)) + $rating) / (total_rides + 1),
  last_updated = NOW()
WHERE driver_id = $driverId;


if (hasSafetyConcern) {
  UPDATE driver_restrictions
  SET visibility_multiplier = 0.3,
      review_required = true
  WHERE driver_id = $driverId;
}


SELECT
  d.id,
  s.points,
  r.visibility_multiplier,
  ST_Distance(l.location, $pickup)::FLOAT AS distance_km
FROM driver_locations l
JOIN drivers d ON d.id = l.driver_id
JOIN driver_safety_stats s ON s.driver_id = d.id
LEFT JOIN driver_restrictions r ON r.driver_id = d.id
WHERE ST_DWithin(l.location, $pickup, 5000)
AND s.points >= 800;


Compute Matching Scores (Node.js)
A. Distance Score

Closer = better

distanceScore = Math.max(0, 1 - distanceKm / 5);

B. Point Score

Normalize points

pointScore = Math.min(driver.points / 1000, 1.2);

C. Safety Bonus
safetyBonus = driver.isVerifiedSafe ? 1.2 : 1.0;

8️⃣ What is baseScore?
baseScore =
  distanceScore * 0.4 +
  pointScore * 0.4 +
  safetyBonus * 0.2;


📌 Meaning:

40% closeness

40% driver trust

20% safety preference