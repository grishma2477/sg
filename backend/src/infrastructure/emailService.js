import nodemailer from 'nodemailer';
import logger from './logger.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sawagaadi.com';

function createTransport() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev: log to console only, no actual send
    return null;
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,       // TODO: set SMTP_HOST in .env
    port:   parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,       // TODO: set SMTP_USER in .env
      pass: process.env.SMTP_PASS,       // TODO: set SMTP_PASS in .env
    },
  });
}

async function sendAdminEmail(subject, text) {
  logger.info('admin_email', { subject, to: ADMIN_EMAIL });
  const transport = createTransport();
  if (!transport) {
    logger.debug('email_skipped_dev', { subject });
    return;
  }
  try {
    await transport.sendMail({
      from:    `"SG System" <${process.env.SMTP_USER}>`,
      to:      ADMIN_EMAIL,
      subject: `[SG Admin] ${subject}`,
      text,
    });
  } catch (err) {
    logger.error('email_send_failed', { subject, err: err.message });
  }
}

export const EmailService = {
  driverApplicationSubmitted(driverName, driverId) {
    return sendAdminEmail(
      'New Driver Application',
      `Driver ${driverName} (ID: ${driverId}) has submitted a new application.\nReview at: ${process.env.FRONTEND_URL || 'https://sawagaadi.com'}/admin/drivers`
    );
  },

  safetyConcernFiled(rideId, raterId, rating) {
    return sendAdminEmail(
      `Safety Concern Filed — Ride #${rideId}`,
      `A safety concern was filed for ride #${rideId} by user #${raterId} (rating: ${rating}/5).\nReview at: ${process.env.FRONTEND_URL || 'https://sawagaadi.com'}/admin`
    );
  },

  payoutBatchReady(count, totalAmount) {
    return sendAdminEmail(
      'Payout Batch Ready',
      `${count} payout requests totalling NPR ${totalAmount} are ready for processing.\nApprove at: ${process.env.FRONTEND_URL || 'https://sawagaadi.com'}/admin/payouts`
    );
  },

  ledgerVerificationFailed(rideId, discrepancyAmount) {
    return sendAdminEmail(
      `Ledger Mismatch — Ride #${rideId}`,
      `Ledger verification failed for ride #${rideId}. Discrepancy: NPR ${discrepancyAmount}.\nInvestigate at: ${process.env.FRONTEND_URL || 'https://sawagaadi.com'}/admin`
    );
  },

  serverErrorRateSpike(errorRate, window) {
    return sendAdminEmail(
      `High Server Error Rate: ${errorRate}%`,
      `Server error rate spiked to ${errorRate}% in the last ${window} minutes.\nCheck Sentry and server logs immediately.`
    );
  },
};
