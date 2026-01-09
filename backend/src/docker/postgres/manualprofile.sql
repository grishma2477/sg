-- ═══════════════════════════════════════════════════════════════════════════════
-- MANUAL DRIVER PROFILE CREATION
-- Use this SQL to create driver profiles for existing users
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Update user role to 'driver' (if not already)
-- ─────────────────────────────────────────────────────────────────────────────

-- Replace 'YOUR_USER_EMAIL' with the actual email
UPDATE users 
SET role = 'driver' 
WHERE id IN (
  SELECT user_id FROM auth_credentials WHERE email = 'driver@test.com'
);

-- Verify
SELECT u.id, u.role, ac.email 
FROM users u 
JOIN auth_credentials ac ON u.id = ac.user_id 
WHERE ac.email = 'driver@test.com';

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Create driver profile
-- ─────────────────────────────────────────────────────────────────────────────

-- Replace with your user_id from step 1
DO $$
DECLARE
  v_user_id UUID := (SELECT user_id FROM auth_credentials WHERE email = 'driver@test.com');
  v_driver_id UUID;
BEGIN
  -- Create driver
  INSERT INTO drivers (user_id, is_online, is_available, status)
  VALUES (v_user_id, false, false, 'offline')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_driver_id;
  
  -- If already exists, get driver_id
  IF v_driver_id IS NULL THEN
    SELECT id INTO v_driver_id FROM drivers WHERE user_id = v_user_id;
  END IF;
  
  RAISE NOTICE 'Driver ID: %', v_driver_id;
  
  -- Create driver safety stats
  INSERT INTO driver_safety_stats (
    driver_id, 
    current_points, 
    average_rating, 
    completed_rides, 
    total_safety_concerns, 
    verified_safe_badge
  )
  VALUES (v_driver_id, 1000, 0.00, 0, 0, false)
  ON CONFLICT (driver_id) DO NOTHING;
  
  -- Create driver visibility
  INSERT INTO driver_visibility (
    driver_id, 
    visibility_multiplier, 
    max_request_radius_km, 
    max_concurrent_requests, 
    performance_tier
  )
  VALUES (v_driver_id, 1.00, 5.00, 10, 'standard')
  ON CONFLICT (driver_id) DO NOTHING;
  
  RAISE NOTICE 'Driver profile created successfully!';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Verify driver profile
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 
  d.id as driver_id,
  d.user_id,
  u.role,
  ac.email,
  d.is_online,
  d.is_available,
  d.status,
  dss.current_points,
  dss.average_rating,
  dss.completed_rides,
  dv.performance_tier
FROM drivers d
JOIN users u ON d.user_id = u.id
JOIN auth_credentials ac ON u.id = ac.user_id
LEFT JOIN driver_safety_stats dss ON d.id = dss.driver_id
LEFT JOIN driver_visibility dv ON d.id = dv.driver_id
WHERE ac.email = 'driver@test.com';

-- ═══════════════════════════════════════════════════════════════════════════════
-- QUICK VERSION - Create driver for specific email
-- ═══════════════════════════════════════════════════════════════════════════════

-- Just run this with your email:
DO $$
DECLARE
  v_email TEXT := 'driver@test.com';  -- ← CHANGE THIS
  v_user_id UUID;
  v_driver_id UUID;
BEGIN
  -- Get user_id
  SELECT user_id INTO v_user_id FROM auth_credentials WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', v_email;
  END IF;
  
  -- Update role
  UPDATE users SET role = 'driver' WHERE id = v_user_id;
  
  -- Create driver
  INSERT INTO drivers (user_id, is_online, is_available, status)
  VALUES (v_user_id, false, false, 'offline')
  ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_driver_id;
  
  IF v_driver_id IS NULL THEN
    SELECT id INTO v_driver_id FROM drivers WHERE user_id = v_user_id;
  END IF;
  
  -- Create safety stats
  INSERT INTO driver_safety_stats (driver_id, current_points, average_rating, completed_rides, total_safety_concerns, verified_safe_badge)
  VALUES (v_driver_id, 1000, 0.00, 0, 0, false)
  ON CONFLICT (driver_id) DO NOTHING;
  
  -- Create visibility
  INSERT INTO driver_visibility (driver_id, visibility_multiplier, max_request_radius_km, max_concurrent_requests, performance_tier)
  VALUES (v_driver_id, 1.00, 5.00, 10, 'standard')
  ON CONFLICT (driver_id) DO NOTHING;
  
  RAISE NOTICE '✅ Driver profile created for: % (driver_id: %)', v_email, v_driver_id;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BULK CREATE - Create drivers for multiple users
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_user RECORD;
  v_driver_id UUID;
BEGIN
  -- Loop through all users with driver role
  FOR v_user IN 
    SELECT id FROM users WHERE role = 'driver'
  LOOP
    -- Create driver
    INSERT INTO drivers (user_id, is_online, is_available, status)
    VALUES (v_user.id, false, false, 'offline')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_driver_id;
    
    IF v_driver_id IS NULL THEN
      SELECT id INTO v_driver_id FROM drivers WHERE user_id = v_user.id;
    END IF;
    
    -- Create safety stats
    INSERT INTO driver_safety_stats (driver_id, current_points, average_rating, completed_rides, total_safety_concerns, verified_safe_badge)
    VALUES (v_driver_id, 1000, 0.00, 0, 0, false)
    ON CONFLICT (driver_id) DO NOTHING;
    
    -- Create visibility
    INSERT INTO driver_visibility (driver_id, visibility_multiplier, max_request_radius_km, max_concurrent_requests, performance_tier)
    VALUES (v_driver_id, 1.00, 5.00, 10, 'standard')
    ON CONFLICT (driver_id) DO NOTHING;
    
    RAISE NOTICE 'Created driver profile for user: %', v_user.id;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- List all drivers with complete info
SELECT 
  ac.email,
  u.role,
  d.id as driver_db_id,
  d.user_id,
  d.status as driver_status,
  dss.current_points,
  dss.average_rating,
  dv.performance_tier
FROM auth_credentials ac
JOIN users u ON ac.user_id = u.id
LEFT JOIN drivers d ON u.id = d.user_id
LEFT JOIN driver_safety_stats dss ON d.id = dss.driver_id
LEFT JOIN driver_visibility dv ON d.id = dv.driver_id
WHERE u.role = 'driver'
ORDER BY ac.email;

-- Count drivers
SELECT COUNT(*) as total_drivers FROM drivers;

-- Find users with driver role but no driver profile
SELECT 
  u.id as user_id,
  ac.email,
  u.role
FROM users u
JOIN auth_credentials ac ON u.id = ac.user_id
LEFT JOIN drivers d ON u.id = d.user_id
WHERE u.role = 'driver' AND d.id IS NULL;