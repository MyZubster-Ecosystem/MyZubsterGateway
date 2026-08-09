// 2FA TOTP Service — Closes #713
const crypto = require('crypto');

class TOTPService {
  constructor() {
    this.step = 30; // 30-second window
    this.digits = 6;
  }

  generateSecret() {
    return crypto.randomBytes(20).toString('base64').replace(/[+=/]/g, '');
  }

  generateTOTP(secret) {
    const time = Math.floor(Date.now() / 1000 / this.step);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigUInt64BE(BigInt(time));
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base64'));
    hmac.update(timeBuffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary = ((digest[offset] & 0x7f) << 24) |
                   ((digest[offset + 1] & 0xff) << 16) |
                   ((digest[offset + 2] & 0xff) << 8) |
                   (digest[offset + 3] & 0xff);
    const token = binary % Math.pow(10, this.digits);
    return token.toString().padStart(this.digits, '0');
  }

  verifyTOTP(secret, token, window = 1) {
    const now = Math.floor(Date.now() / 1000 / this.step);
    for (let i = -window; i <= window; i++) {
      const timeBuffer = Buffer.alloc(8);
      timeBuffer.writeBigUInt64BE(BigInt(now + i));
      const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base64'));
      hmac.update(timeBuffer);
      const digest = hmac.digest();
      const offset = digest[digest.length - 1] & 0x0f;
      const binary = ((digest[offset] & 0x7f) << 24) |
                     ((digest[offset + 1] & 0xff) << 16) |
                     ((digest[offset + 2] & 0xff) << 8) |
                     (digest[offset + 3] & 0xff);
      const candidate = (binary % Math.pow(10, this.digits)).toString().padStart(this.digits, '0');
      if (candidate === token) return true;
    }
    return false;
  }

  generateQRUrl(secret, label = 'MyZubster', issuer = 'MyZubsterGateway') {
    const encodedLabel = encodeURIComponent(label);
    const encodedIssuer = encodeURIComponent(issuer);
    return otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer};
  }
}

module.exports = new TOTPService();
