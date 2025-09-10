const axios = require('axios');

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

async function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET) {
    // no secret configured -> skip verification
    return { ok: true, reason: 'no-secret-configured' };
  }
  if (!token) return { ok: false, reason: 'no-token' };

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);

    const resp = await axios.post('https://www.google.com/recaptcha/api/siteverify', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = resp.data;
    // data: { success: boolean, score?: number, action?: string, challenge_ts, hostname, 'error-codes' }
    if (!data.success) return { ok: false, reason: 'verification-failed', data };

    // If score exists (v3), enforce threshold
    if (typeof data.score === 'number' && data.score < 0.4) {
      return { ok: false, reason: 'low-score', score: data.score, data };
    }

    return { ok: true, data };
  } catch (err) {
    return { ok: false, reason: 'request-error', error: err.message };
  }
}

module.exports = { verifyRecaptcha };
