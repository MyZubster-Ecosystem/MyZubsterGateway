const crypto = require('crypto');
const TwoFactor = require('../models/TwoFactor');

class TwoFactorService {
  /**
   * Generate a new TOTP secret for a user
   */
  static generateSecret() {
    return crypto.randomBytes(20).toString('base32').replace(/=/g, '');
  }

  /**
   * Generate TOTP token for a given secret and time step
   */
  static generateTOTP(secret, timeStep = 30, digits = 6) {
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    return this._hotp(secret, counter, digits);
  }

  /**
   * Verify a TOTP token with time drift tolerance
   */
  static verifyTOTP(secret, token, timeStep = 30, digits = 6, window = 1) {
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    
    for (let i = -window; i <= window; i++) {
      const expected = this._hotp(secret, counter + i, digits);
      if (expected === token) {
        return true;
      }
    }
    return false;
  }

  /**
   * HOTP: HMAC-based One-Time Password (RFC 4226)
   */
  static _hotp(secret, counter, digits = 6) {
    // Decode base32 secret
    const decodedSecret = this._base32Decode(secret);
    
    // Counter to buffer (8 bytes, big-endian)
    const buffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
      buffer[i] = counter & 0xff;
      counter = Math.floor(counter / 256);
    }
    
    // HMAC-SHA1
    const hmac = crypto.createHmac('sha1', decodedSecret);
    hmac.update(buffer);
    const hmacResult = hmac.digest();
    
    // Dynamic truncation (RFC 4226 section 5.3)
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const binary = 
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);
    
    const otp = binary % Math.pow(10, digits);
    return otp.toString().padStart(digits, '0');
  }

  /**
   * Base32 decode implementation
   */
  static _base32Decode(encoded) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let value = '';
    
    for (let i = 0; i < encoded.length; i++) {
      const idx = alphabet.indexOf(encoded[i].toUpperCase());
      if (idx === -1) continue;
      bits += idx.toString(2).padStart(5, '0');
    }
    
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      value += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
    }
    
    return Buffer.from(value, 'binary');
  }

  /**
   * Generate QR code URL for Google Authenticator / Authy
   */
  static generateQRUrl(secret, email, issuer = 'MyZubsterGateway') {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedEmail = encodeURIComponent(email);
    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Generate backup codes
   */
  static generateBackupCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push({
        code: crypto.randomBytes(4).toString('hex').toUpperCase(),
        used: false
      });
    }
    return codes;
  }

  /**
   * Setup 2FA for a user
   */
  static async setupTwoFactor(userId, email) {
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes();
    
    let tf = await TwoFactor.findOne({ userId });
    if (tf) {
      tf.secret = secret;
      tf.backupCodes = backupCodes;
      tf.enabled = false; // Requires verification before enabling
    } else {
      tf = new TwoFactor({
        userId,
        secret,
        backupCodes,
        enabled: false
      });
    }
    
    await tf.save();
    
    return {
      secret,
      qrUrl: this.generateQRUrl(secret, email),
      backupCodes: backupCodes.map(b => b.code)
    };
  }

  /**
   * Verify and enable 2FA
   */
  static async verifyAndEnable(userId, token) {
    const tf = await TwoFactor.findOne({ userId });
    if (!tf) {
      throw new Error('2FA not initialized. Call setup first.');
    }
    
    if (!token || token.length !== 6) {
      throw new Error('Invalid token format. Must be 6 digits.');
    }
    
    const isValid = this.verifyTOTP(tf.secret, token);
    if (!isValid) {
      throw new Error('Invalid TOTP token.');
    }
    
    tf.enabled = true;
    tf.lastVerified = new Date();
    await tf.save();
    
    return { enabled: true, verified: true };
  }

  /**
   * Verify token during login/sensitive operation
   */
  static async verifyToken(userId, token) {
    const tf = await TwoFactor.findOne({ userId });
    if (!tf || !tf.enabled) {
      return { valid: true, reason: '2FA not enabled' };
    }
    
    // Check backup codes
    const backupMatch = tf.backupCodes.find(b => b.code === token.toUpperCase() && !b.used);
    if (backupMatch) {
      backupMatch.used = true;
      await tf.save();
      return { valid: true, method: 'backup', remainingBackups: tf.backupCodes.filter(b => !b.used).length };
    }
    
    // Check TOTP
    const isValid = this.verifyTOTP(tf.secret, token);
    if (isValid) {
      tf.lastVerified = new Date();
      await tf.save();
      return { valid: true, method: 'totp' };
    }
    
    return { valid: false, reason: 'Invalid token' };
  }

  /**
   * Check if 2FA is enabled for user
   */
  static async isEnabled(userId) {
    const tf = await TwoFactor.findOne({ userId });
    return tf ? tf.enabled : false;
  }

  /**
   * Disable 2FA (requires valid token)
   */
  static async disableTwoFactor(userId, token) {
    const tf = await TwoFactor.findOne({ userId });
    if (!tf || !tf.enabled) {
      throw new Error('2FA is not enabled.');
    }
    
    const isValid = this.verifyTOTP(tf.secret, token);
    if (!isValid) {
      throw new Error('Invalid TOTP token. Cannot disable 2FA.');
    }
    
    tf.enabled = false;
    await tf.save();
    
    return { enabled: false };
  }
}

module.exports = TwoFactorService;
