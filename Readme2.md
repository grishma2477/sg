# Driver Rating, Safety & Matching System  
(SG – Internal Backend Design)

## 1. Purpose of This System

This system exists to:
- Prioritize **rider safety** without unfairly punishing drivers
- Prevent **rating manipulation & collusion**
- Reward **long-term consistent behavior**, not single rides
- Keep ride matching **fast, fair, and explainable**
- Allow **graduated penalties**, not instant bans

This design is inspired by real-world trust & safety systems used by Uber, Bolt, Grab, etc., but simplified and made more transparent.

---

## 2. Core Principles

1. **Safety > Comfort > Speed**, but speed still matters
2. One bad ride should **not destroy** a driver
3. One good ride should **not inflate** reputation
4. Signals must be **hard to game**
5. All penalties should be **recoverable**
6. Matching must be **deterministic & explainable**

---

## 3. Driver Safety Point System (Foundation)

### 3.1 Base Rules

- Every driver starts with **1000 safety points**
- Points range: **0 → 1500**
- Points increase **slowly**
- Points decrease **faster on safety issues**
- System influence activates only after **50 completed rides**

This prevents early manipulation and revenge ratings.

---

## 4. Review Input Model (After Ride Completion)

Each completed ride produces:
- ⭐ Star rating (1–5)
- ✅ Positive taps (safety & comfort)
- ⚠️ Negative taps (concerns)
- 🚨 Optional safety concern flag

Raw reviews are **stored as-is** and later converted into system impact.

---

## 5. Star Rating Impact (Low Weight by Design)

Stars represent **overall satisfaction**, not safety.

| Stars | Point Impact |
|------|--------------|
| ⭐⭐⭐⭐⭐ | +2 |
| ⭐⭐⭐⭐ | +1 |
| ⭐⭐⭐ | 0 |
| ⭐⭐ | −5 |
| ⭐ | −10 |

**Why low impact?**
- Stars are subjective
- Riders misuse stars
- Stars alone must never control trust

---

## 6. Positive Tap System (Anti-Farming Design)

### 6.1 Allowed Positive Signals

| Tap | Points |
|---|---|
| Felt safe | +3 |
| Respectful | +2 |
| Followed traffic rules | +2 |
| Responsible driving | +2 |
| Route felt appropriate | +1 |
| Professional communication | +1 |

### 6.2 Critical Rule: **Top 2 Only**

- Only the **top 2 highest-value positive taps** count
- All others are ignored
- Max positive gain per ride ≈ **+6**

### 6.3 Why This Exists (Very Important)

Without a cap:
- Drivers can farm points
- Friends/family can inflate scores
- Trust system becomes meaningless
- “Safe Driver” badge becomes unsafe

This mirrors real-world fraud prevention used by ride platforms and credit scoring systems.

---

## 7. Negative Tap System (Safety-First)

### 7.1 Negative Signals

| Tap | Points |
|---|---|
| Felt uncomfortable | −15 |
| Reckless driving | −20 |
| Unnecessary routes | −10 |
| Inappropriate behavior | −25 |
| Ignored communication | −5 |
| **Safety concern** | **−40 + flag** |

### 7.2 Negative Rules

- All negative taps **stack**
- Max negative impact per ride = **−40**
- One ride cannot drop more than **−50 total points**

**Reason:**  
Safety is conservative. One serious issue is enough to reduce trust.

---

## 8. Per-Ride Protection Logic

After combining:
- Star impact
- Top 2 positive taps
- All negative taps

Apply:
- **Single-ride floor:** max −50
- **Optional gain cap:** ~+6 to +8

This prevents revenge ratings and artificial inflation.

---

## 9. Safety Concern Handling (Critical Path)

If a rider flags **Safety Concern**:

Immediate effects:
- −40 points
- `visibility_multiplier = 0.3`
- `review_required = true`
- Driver is **not banned**

Why this works:
- Instant rider protection
- No false permanent punishment
- Regulators prefer this model
- Driver has recovery path

---

## 10. Driver Safety Levels (Live Classification)

| Points | Level | Effect |
|---|---|---|
| ≥ 950 | Trusted | Highest priority |
| 900–949 | Very Good | Normal |
| 850–899 | Average | Slightly reduced |
| 800–849 | Low Trust | Fewer rides |
| < 800 | Risk Flagged | Restricted / review |

Drivers below **800 points** are excluded from normal matching.

---

## 11. “Verified Safe Driver” Badge (95%+ Safe)

### Criteria (ALL required)

- Average rating ≥ **4.7**
- “Felt safe” ≥ **95%** (last 100 rides, rolling window)
- **0 safety concerns** in last 60 days
- Points ≥ **950**

### Benefits

- Visibility boost
- Preferred for safety-sensitive riders
- Incentives / bonuses
- Higher matching priority

This badge is **hard to earn** and **easy to trust**.

---

## 12. Visibility Multiplier (Soft Control System)

Visibility multiplier adjusts how often a driver appears in matching.

| Situation | Multiplier |
|---|---|
| Normal | 1.0 |
| Verified Safe | 1.2 |
| Minor complaints | 0.8 |
| Low trust | 0.6 |
| Safety concern | 0.3 |
| Under investigation | 0.0 |

**Key idea:**  
Throttle visibility, don’t ban.

---

## 13. Matching Algorithm (PostGIS + Scoring)

### 13.1 Candidate Selection (DB)

- Use PostGIS to find drivers within radius (e.g. 5km)
- Filter out:
  - points < 800
  - restricted drivers

---

### 13.2 Score Components

**Distance Score (0–1)**
- Closer = better
- Beyond 5km → 0

**Point Score (0–1.2)**
- points / 1000
- Small boost for top drivers

**Safety Bonus**
- 1.2 if Verified Safe
- 1.0 otherwise

---

### 13.3 Base Score Formula

baseScore =
distanceScore * 0.4 +
pointScore * 0.4 +
safetyBonus * 0.2


Meaning:
- 40% pickup speed
- 40% trust history
- 20% safety priority

---

### 13.4 Final Score

finalScore = baseScore * visibilityMultiplier


Highest `finalScore` wins.

---

## 14. Why Distance Is Required (Non-Negotiable)

Without distance scoring:
- Long ETAs
- High cancellations
- Driver frustration
- Rider churn
- System gaming

Distance score is a **soft preference**, not a hard filter.

Safety still dominates **among nearby drivers**.

---

## 15. Time-Based Recovery

- +1 point per **7 clean days**
- Encourages long-term good behavior
- Prevents permanent damage from old incidents

---

## 16. Data Model (High-Level)

### ride_reviews
- Raw review storage
- Immutable
- Used for audits & analytics

### driver_safety_stats
- points
- avg_rating
- total_rides
- felt_safe_count
- safety_concerns_last_60_days
- last_incident_at

### driver_restrictions
- visibility_multiplier
- review_required
- restricted_until

---

## 17. End-to-End Flow (Mental Model)

1. Ride completes
2. Rider submits stars + taps
3. Review stored raw
4. Backend computes impact
5. Driver points updated
6. Safety concern → visibility throttled
7. New ride request arrives
8. Nearby drivers fetched
9. Scores computed
10. Visibility applied
11. Best driver matched

---

## 18. How to Move Forward (Professional Roadmap)

### Phase 1 – Foundation (Now)
- Implement review ingestion
- Implement point calculation
- Store audit events
- Implement visibility multiplier logic

### Phase 2 – Matching
- PostGIS driver queries
- Deterministic scoring
- Visibility-aware selection

### Phase 3 – Safety Ops
- Manual review dashboard
- Badge assignment
- Recovery workflows

### Phase 4 – Abuse & Analytics
- Collusion detection
- Repeated rider patterns
- Driver behavior trends

### Phase 5 – Mobile Integration
- Same backend
- Mobile only consumes scores & badges
- No logic duplicated

---

## Final Verdict

This system is:
- Fair
- Safety-first
- Hard to game
- Explainable to drivers
- Regulator-friendly
- Production-ready

