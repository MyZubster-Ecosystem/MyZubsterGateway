'use strict';

const fs = require('fs');
const path = require('path');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_MAX_FILES = 5;

class Logger {
  constructor(options = {}) {
    this.level = process.env.LOG_LEVEL || options.level || 'info';
    this.logFile = process.env.LOG_FILE || options.logFile || path.join(__dirname, 'logs', 'gateway.log');
    this.maxSize = parseInt(process.env.LOG_MAX_SIZE, 10) || options.maxSize || DEFAULT_MAX_SIZE;
    this.maxFiles = parseInt(process.env.LOG_MAX_FILES, 10) || options.maxFiles || DEFAULT_MAX_FILES;
    this._ensureDir();
  }

  _ensureDir() {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  _shouldLog(level) {
    return (LOG_LEVELS[level] || -1) <= (LOG_LEVELS[this.level] || 2);
  }

  _rotate() {
    if (!fs.existsSync(this.logFile)) return;
    const stat = fs.statSync(this.logFile);
    if (stat.size < this.maxSize) return;

    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = `${this.logFile}.${i}`;
      const newFile = `${this.logFile}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        if (i === this.maxFiles - 1) {
          fs.unlinkSync(oldFile);
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }
    fs.renameSync(this.logFile, `${this.logFile}.1`);
  }

  _write(level, message, extra = {}) {
    if (!this._shouldLog(level)) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...extra
    };

    this._rotate();

    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.logFile, line, 'utf8');

    if (level === 'error') {
      console.error(line.trim());
    } else if (level === 'warn') {
      console.warn(line.trim());
    }
  }

  error(message, extra) { this._write('error', message, extra); }
  warn(message, extra)  { this._write('warn', message, extra); }
  info(message, extra)  { this._write('info', message, extra); }
  debug(message, extra) { this._write('debug', message, extra); }

  getLogPath() { return this.logFile; }
}

const logger = new Logger();
module.exports = { Logger, logger };
