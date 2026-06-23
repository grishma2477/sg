import { pool } from '../database/DBConnection.js';

// Toggle driver online/offline status
// export const toggleDriverStatus = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { isOnline } = req.body;

//     console.log('🔄 Toggling driver status:', { userId, isOnline });

//     // Get driver's database ID
//     const driverResult = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [userId]
//     );

//     if (driverResult.rows.length === 0) {
//       // Create driver record if doesn't exist
//       const createResult = await pool.query(
//         `INSERT INTO drivers (user_id, is_online, is_available, created_at)
//          VALUES ($1, $2, $2, NOW())
//          RETURNING *`,
//         [userId, isOnline]
//       );

//       console.log('✅ Driver record created');

//       return res.status(200).json({
//         success: true,
//         message: 'STATUS_UPDATED',
//         data: {
//           isOnline: isOnline,
//           isAvailable: isOnline
//         }
//       });
//     }

//     const driverDbId = driverResult.rows[0].id;

//     // Update driver status
//     const updateResult = await pool.query(
//       `UPDATE drivers 
//        SET is_online = $1, 
//            is_available = $1,
//            updated_at = NOW()
//        WHERE id = $2
//        RETURNING *`,
//       [isOnline, driverDbId]
//     );

//     console.log('✅ Driver status updated:', isOnline ? 'ONLINE' : 'OFFLINE');

//     res.status(200).json({
//       success: true,
//       message: 'STATUS_UPDATED',
//       data: {
//         isOnline: updateResult.rows[0].is_online,
//         isAvailable: updateResult.rows[0].is_available
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error toggling driver status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

export const toggleDriverStatus = async (req, res) => {

  try {

    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE drivers
       SET
         is_online = NOT COALESCE(is_online,false),
         is_available = NOT COALESCE(is_available,false)
       WHERE user_id = $1
       RETURNING is_online, is_available`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "STATUS_UPDATED",
      data: {
        isOnline: result.rows[0].is_online,
        isAvailable: result.rows[0].is_available
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get driver current status
export const getDriverStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const driverResult = await pool.query(
      'SELECT is_online, is_available FROM drivers WHERE user_id = $1',
      [userId]
    );

    if (driverResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          isOnline: false,
          isAvailable: false
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isOnline: driverResult.rows[0].is_online,
        isAvailable: driverResult.rows[0].is_available
      }
    });

  } catch (error) {
    console.error('❌ Error getting driver status:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

export default {
  toggleDriverStatus,
  getDriverStatus
};