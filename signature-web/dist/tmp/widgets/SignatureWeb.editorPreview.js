'use strict';

var React = require('react');
var reactDom = require('react-dom');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;
  if (!css || typeof document === 'undefined') {
    return;
  }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".widget-signature-wrapper {\n  overflow: hidden;\n  padding: 0 !important;\n  display: flex;\n  flex-direction: column;\n}\n.widget-signature-canvas {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  background: transparent;\n}\n.widget-signature-canvas-area {\n  position: relative;\n  flex: 1;\n  min-height: 0;\n}\n.widget-signature-grid {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 0;\n}\n.widget-signature-controls {\n  position: relative;\n  margin: 8px;\n  z-index: 2;\n  display: flex;\n  gap: 8px;\n  align-items: center;\n  background: rgba(255, 255, 255, 0.9);\n  padding: 6px 8px;\n  border-radius: 6px;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);\n}\n.widget-signature-toggle {\n  display: inline-flex;\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.widget-signature-toggle button {\n  border: 0;\n  background: transparent;\n  padding: 4px 10px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.widget-signature-toggle button.active {\n  background: #f0f0f0;\n  font-weight: 600;\n}\n.widget-signature-typed-input {\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  padding: 4px 8px;\n  font-size: 12px;\n  min-width: 180px;\n}\n.widget-signature-header {\n  position: relative;\n  margin: 8px 8px 0;\n  z-index: 2;\n  background: rgba(255, 255, 255, 0.9);\n  padding: 6px 8px;\n  border-radius: 6px;\n  font-size: 12px;\n  line-height: 1.35;\n}\n.widget-signature-clear {\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  background: #ffffff;\n  padding: 4px 10px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.widget-signature-save {\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  background: #ffffff;\n  padding: 4px 10px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.widget-signature-save:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.widget-signature-watermark-input, .widget-signature-watermark-text {\n  position: absolute;\n  left: 8px;\n  bottom: 8px;\n  z-index: 2;\n  font-size: 11px;\n  color: #5b5b5b;\n  background: rgba(255, 255, 255, 0.8);\n  border-radius: 4px;\n  padding: 2px 6px;\n  max-width: calc(100% - 16px);\n}\n.widget-signature-watermark-input {\n  border: 1px solid #c8c8c8;\n}\n.widget-signature .alert {\n  position: absolute;\n}\n/*# sourceMappingURL=inline */\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvd2Rvb2QvTWVuZGl4L215UGx1Z2dhYmxlV2lkZ2V0cy9TaWduYXR1cmUvc2lnbmF0dXJlLXdlYi9zcmMvdWkvU2lnbmF0dXJlLnNjc3MiLCJTaWduYXR1cmUuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDSTtFQUNJLGdCQUFBO0VBQ0EscUJBQUE7RUFDQSxhQUFBO0VBQ0Esc0JBQUE7QUNBUjtBREdJO0VBQ0ksa0JBQUE7RUFDQSxPQUFBO0VBQ0EsTUFBQTtFQUNBLFVBQUE7RUFDQSx1QkFBQTtBQ0RSO0FESUk7RUFDSSxrQkFBQTtFQUNBLE9BQUE7RUFDQSxhQUFBO0FDRlI7QURLSTtFQUNJLGtCQUFBO0VBQ0EsT0FBQTtFQUNBLE1BQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLFVBQUE7QUNIUjtBRE1JO0VBQ0ksa0JBQUE7RUFDQSxXQUFBO0VBQ0EsVUFBQTtFQUNBLGFBQUE7RUFDQSxRQUFBO0VBQ0EsbUJBQUE7RUFDQSxvQ0FBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSx5Q0FBQTtBQ0pSO0FET0k7RUFDSSxvQkFBQTtFQUNBLHlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtBQ0xSO0FET1E7RUFDSSxTQUFBO0VBQ0EsdUJBQUE7RUFDQSxpQkFBQTtFQUNBLGVBQUE7RUFDQSxlQUFBO0FDTFo7QURRUTtFQUNJLG1CQUFBO0VBQ0EsZ0JBQUE7QUNOWjtBRFVJO0VBQ0kseUJBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0FDUlI7QURXSTtFQUNJLGtCQUFBO0VBQ0EsaUJBQUE7RUFDQSxVQUFBO0VBQ0Esb0NBQUE7RUFDQSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0FDVFI7QURZSTtFQUNJLHlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxtQkFBQTtFQUNBLGlCQUFBO0VBQ0EsZUFBQTtFQUNBLGVBQUE7QUNWUjtBRGFJO0VBQ0kseUJBQUE7RUFDQSxrQkFBQTtFQUNBLG1CQUFBO0VBQ0EsaUJBQUE7RUFDQSxlQUFBO0VBQ0EsZUFBQTtBQ1hSO0FEY0k7RUFDSSxZQUFBO0VBQ0EsbUJBQUE7QUNaUjtBRGVJO0VBRUksa0JBQUE7RUFDQSxTQUFBO0VBQ0EsV0FBQTtFQUNBLFVBQUE7RUFDQSxlQUFBO0VBQ0EsY0FBQTtFQUNBLG9DQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLDRCQUFBO0FDZFI7QURpQkk7RUFDSSx5QkFBQTtBQ2ZSO0FEa0JJO0VBQ0ksa0JBQUE7QUNoQlI7QUFFQSw2QkFBNkIiLCJmaWxlIjoiU2lnbmF0dXJlLnNjc3MifQ== */";
var stylesheet=".widget-signature-wrapper {\n  overflow: hidden;\n  padding: 0 !important;\n  display: flex;\n  flex-direction: column;\n}\n.widget-signature-canvas {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  background: transparent;\n}\n.widget-signature-canvas-area {\n  position: relative;\n  flex: 1;\n  min-height: 0;\n}\n.widget-signature-grid {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 0;\n}\n.widget-signature-controls {\n  position: relative;\n  margin: 8px;\n  z-index: 2;\n  display: flex;\n  gap: 8px;\n  align-items: center;\n  background: rgba(255, 255, 255, 0.9);\n  padding: 6px 8px;\n  border-radius: 6px;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);\n}\n.widget-signature-toggle {\n  display: inline-flex;\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.widget-signature-toggle button {\n  border: 0;\n  background: transparent;\n  padding: 4px 10px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.widget-signature-toggle button.active {\n  background: #f0f0f0;\n  font-weight: 600;\n}\n.widget-signature-typed-input {\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  padding: 4px 8px;\n  font-size: 12px;\n  min-width: 180px;\n}\n.widget-signature-header {\n  position: relative;\n  margin: 8px 8px 0;\n  z-index: 2;\n  background: rgba(255, 255, 255, 0.9);\n  padding: 6px 8px;\n  border-radius: 6px;\n  font-size: 12px;\n  line-height: 1.35;\n}\n.widget-signature-clear {\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  background: #ffffff;\n  padding: 4px 10px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.widget-signature-save {\n  border: 1px solid #c8c8c8;\n  border-radius: 4px;\n  background: #ffffff;\n  padding: 4px 10px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.widget-signature-save:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.widget-signature-watermark-input, .widget-signature-watermark-text {\n  position: absolute;\n  left: 8px;\n  bottom: 8px;\n  z-index: 2;\n  font-size: 11px;\n  color: #5b5b5b;\n  background: rgba(255, 255, 255, 0.8);\n  border-radius: 4px;\n  padding: 2px 6px;\n  max-width: calc(100% - 16px);\n}\n.widget-signature-watermark-input {\n  border: 1px solid #c8c8c8;\n}\n.widget-signature .alert {\n  position: absolute;\n}\n/*# sourceMappingURL=inline */\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvd2Rvb2QvTWVuZGl4L215UGx1Z2dhYmxlV2lkZ2V0cy9TaWduYXR1cmUvc2lnbmF0dXJlLXdlYi9zcmMvdWkvU2lnbmF0dXJlLnNjc3MiLCJTaWduYXR1cmUuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDSTtFQUNJLGdCQUFBO0VBQ0EscUJBQUE7RUFDQSxhQUFBO0VBQ0Esc0JBQUE7QUNBUjtBREdJO0VBQ0ksa0JBQUE7RUFDQSxPQUFBO0VBQ0EsTUFBQTtFQUNBLFVBQUE7RUFDQSx1QkFBQTtBQ0RSO0FESUk7RUFDSSxrQkFBQTtFQUNBLE9BQUE7RUFDQSxhQUFBO0FDRlI7QURLSTtFQUNJLGtCQUFBO0VBQ0EsT0FBQTtFQUNBLE1BQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLFVBQUE7QUNIUjtBRE1JO0VBQ0ksa0JBQUE7RUFDQSxXQUFBO0VBQ0EsVUFBQTtFQUNBLGFBQUE7RUFDQSxRQUFBO0VBQ0EsbUJBQUE7RUFDQSxvQ0FBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSx5Q0FBQTtBQ0pSO0FET0k7RUFDSSxvQkFBQTtFQUNBLHlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtBQ0xSO0FET1E7RUFDSSxTQUFBO0VBQ0EsdUJBQUE7RUFDQSxpQkFBQTtFQUNBLGVBQUE7RUFDQSxlQUFBO0FDTFo7QURRUTtFQUNJLG1CQUFBO0VBQ0EsZ0JBQUE7QUNOWjtBRFVJO0VBQ0kseUJBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0FDUlI7QURXSTtFQUNJLGtCQUFBO0VBQ0EsaUJBQUE7RUFDQSxVQUFBO0VBQ0Esb0NBQUE7RUFDQSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0FDVFI7QURZSTtFQUNJLHlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxtQkFBQTtFQUNBLGlCQUFBO0VBQ0EsZUFBQTtFQUNBLGVBQUE7QUNWUjtBRGFJO0VBQ0kseUJBQUE7RUFDQSxrQkFBQTtFQUNBLG1CQUFBO0VBQ0EsaUJBQUE7RUFDQSxlQUFBO0VBQ0EsZUFBQTtBQ1hSO0FEY0k7RUFDSSxZQUFBO0VBQ0EsbUJBQUE7QUNaUjtBRGVJO0VBRUksa0JBQUE7RUFDQSxTQUFBO0VBQ0EsV0FBQTtFQUNBLFVBQUE7RUFDQSxlQUFBO0VBQ0EsY0FBQTtFQUNBLG9DQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLDRCQUFBO0FDZFI7QURpQkk7RUFDSSx5QkFBQTtBQ2ZSO0FEa0JJO0VBQ0ksa0JBQUE7QUNoQlI7QUFFQSw2QkFBNkIiLCJmaWxlIjoiU2lnbmF0dXJlLnNjc3MifQ== */";
styleInject(css_248z);

var Signature$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: css_248z,
	stylesheet: stylesheet
});

var require$$0 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(Signature$1);

/*!
 * Signature Pad v4.0.0 | https://github.com/szimek/signature_pad
 * (c) 2021 Szymon Nowak | Released under the MIT license
 */

class Point {
  constructor(x, y, pressure, time) {
    if (isNaN(x) || isNaN(y)) {
      throw new Error(`Point is invalid: (${x}, ${y})`);
    }
    this.x = +x;
    this.y = +y;
    this.pressure = pressure || 0;
    this.time = time || Date.now();
  }
  distanceTo(start) {
    return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
  }
  equals(other) {
    return this.x === other.x && this.y === other.y && this.pressure === other.pressure && this.time === other.time;
  }
  velocityFrom(start) {
    return this.time !== start.time ? this.distanceTo(start) / (this.time - start.time) : 0;
  }
}
class Bezier {
  constructor(startPoint, control2, control1, endPoint, startWidth, endWidth) {
    this.startPoint = startPoint;
    this.control2 = control2;
    this.control1 = control1;
    this.endPoint = endPoint;
    this.startWidth = startWidth;
    this.endWidth = endWidth;
  }
  static fromPoints(points, widths) {
    const c2 = this.calculateControlPoints(points[0], points[1], points[2]).c2;
    const c3 = this.calculateControlPoints(points[1], points[2], points[3]).c1;
    return new Bezier(points[1], c2, c3, points[2], widths.start, widths.end);
  }
  static calculateControlPoints(s1, s2, s3) {
    const dx1 = s1.x - s2.x;
    const dy1 = s1.y - s2.y;
    const dx2 = s2.x - s3.x;
    const dy2 = s2.y - s3.y;
    const m1 = {
      x: (s1.x + s2.x) / 2.0,
      y: (s1.y + s2.y) / 2.0
    };
    const m2 = {
      x: (s2.x + s3.x) / 2.0,
      y: (s2.y + s3.y) / 2.0
    };
    const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const dxm = m1.x - m2.x;
    const dym = m1.y - m2.y;
    const k = l2 / (l1 + l2);
    const cm = {
      x: m2.x + dxm * k,
      y: m2.y + dym * k
    };
    const tx = s2.x - cm.x;
    const ty = s2.y - cm.y;
    return {
      c1: new Point(m1.x + tx, m1.y + ty),
      c2: new Point(m2.x + tx, m2.y + ty)
    };
  }
  length() {
    const steps = 10;
    let length = 0;
    let px;
    let py;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const cx = this.point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
      const cy = this.point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
      if (i > 0) {
        const xdiff = cx - px;
        const ydiff = cy - py;
        length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      }
      px = cx;
      py = cy;
    }
    return length;
  }
  point(t, start, c1, c2, end) {
    return start * (1.0 - t) * (1.0 - t) * (1.0 - t) + 3.0 * c1 * (1.0 - t) * (1.0 - t) * t + 3.0 * c2 * (1.0 - t) * t * t + end * t * t * t;
  }
}
function throttle$1(fn, wait = 250) {
  let previous = 0;
  let timeout = null;
  let result;
  let storedContext;
  let storedArgs;
  const later = () => {
    previous = Date.now();
    timeout = null;
    result = fn.apply(storedContext, storedArgs);
    if (!timeout) {
      storedContext = null;
      storedArgs = [];
    }
  };
  return function wrapper(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    storedContext = this;
    storedArgs = args;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = fn.apply(storedContext, storedArgs);
      if (!timeout) {
        storedContext = null;
        storedArgs = [];
      }
    } else if (!timeout) {
      timeout = window.setTimeout(later, remaining);
    }
    return result;
  };
}
class SignaturePad extends EventTarget {
  constructor(canvas, options = {}) {
    super();
    this.canvas = canvas;
    this.options = options;
    this._handleMouseDown = event => {
      if (event.buttons === 1) {
        this._drawningStroke = true;
        this._strokeBegin(event);
      }
    };
    this._handleMouseMove = event => {
      if (this._drawningStroke) {
        this._strokeMoveUpdate(event);
      }
    };
    this._handleMouseUp = event => {
      if (event.buttons === 1 && this._drawningStroke) {
        this._drawningStroke = false;
        this._strokeEnd(event);
      }
    };
    this._handleTouchStart = event => {
      event.preventDefault();
      if (event.targetTouches.length === 1) {
        const touch = event.changedTouches[0];
        this._strokeBegin(touch);
      }
    };
    this._handleTouchMove = event => {
      event.preventDefault();
      const touch = event.targetTouches[0];
      this._strokeMoveUpdate(touch);
    };
    this._handleTouchEnd = event => {
      const wasCanvasTouched = event.target === this.canvas;
      if (wasCanvasTouched) {
        event.preventDefault();
        const touch = event.changedTouches[0];
        this._strokeEnd(touch);
      }
    };
    this._handlePointerStart = event => {
      this._drawningStroke = true;
      event.preventDefault();
      this._strokeBegin(event);
    };
    this._handlePointerMove = event => {
      if (this._drawningStroke) {
        event.preventDefault();
        this._strokeMoveUpdate(event);
      }
    };
    this._handlePointerEnd = event => {
      this._drawningStroke = false;
      const wasCanvasTouched = event.target === this.canvas;
      if (wasCanvasTouched) {
        event.preventDefault();
        this._strokeEnd(event);
      }
    };
    this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
    this.minWidth = options.minWidth || 0.5;
    this.maxWidth = options.maxWidth || 2.5;
    this.throttle = 'throttle' in options ? options.throttle : 16;
    this.minDistance = 'minDistance' in options ? options.minDistance : 5;
    this.dotSize = options.dotSize || 0;
    this.penColor = options.penColor || 'black';
    this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
    this._strokeMoveUpdate = this.throttle ? throttle$1(SignaturePad.prototype._strokeUpdate, this.throttle) : SignaturePad.prototype._strokeUpdate;
    this._ctx = canvas.getContext('2d');
    this.clear();
    this.on();
  }
  clear() {
    const {
      _ctx: ctx,
      canvas
    } = this;
    ctx.fillStyle = this.backgroundColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this._data = [];
    this._reset();
    this._isEmpty = true;
  }
  fromDataURL(dataUrl, options = {}) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const ratio = options.ratio || window.devicePixelRatio || 1;
      const width = options.width || this.canvas.width / ratio;
      const height = options.height || this.canvas.height / ratio;
      const xOffset = options.xOffset || 0;
      const yOffset = options.yOffset || 0;
      this._reset();
      image.onload = () => {
        this._ctx.drawImage(image, xOffset, yOffset, width, height);
        resolve();
      };
      image.onerror = error => {
        reject(error);
      };
      image.crossOrigin = 'anonymous';
      image.src = dataUrl;
      this._isEmpty = false;
    });
  }
  toDataURL(type = 'image/png', encoderOptions) {
    switch (type) {
      case 'image/svg+xml':
        return this._toSVG();
      default:
        return this.canvas.toDataURL(type, encoderOptions);
    }
  }
  on() {
    this.canvas.style.touchAction = 'none';
    this.canvas.style.msTouchAction = 'none';
    if (window.PointerEvent) {
      this._handlePointerEvents();
    } else {
      this._handleMouseEvents();
      if ('ontouchstart' in window) {
        this._handleTouchEvents();
      }
    }
  }
  off() {
    this.canvas.style.touchAction = 'auto';
    this.canvas.style.msTouchAction = 'auto';
    this.canvas.removeEventListener('pointerdown', this._handlePointerStart);
    this.canvas.removeEventListener('pointermove', this._handlePointerMove);
    document.removeEventListener('pointerup', this._handlePointerEnd);
    this.canvas.removeEventListener('mousedown', this._handleMouseDown);
    this.canvas.removeEventListener('mousemove', this._handleMouseMove);
    document.removeEventListener('mouseup', this._handleMouseUp);
    this.canvas.removeEventListener('touchstart', this._handleTouchStart);
    this.canvas.removeEventListener('touchmove', this._handleTouchMove);
    this.canvas.removeEventListener('touchend', this._handleTouchEnd);
  }
  isEmpty() {
    return this._isEmpty;
  }
  fromData(pointGroups, {
    clear = true
  } = {}) {
    if (clear) {
      this.clear();
    }
    this._fromData(pointGroups, this._drawCurve.bind(this), this._drawDot.bind(this));
    this._data = clear ? pointGroups : this._data.concat(pointGroups);
  }
  toData() {
    return this._data;
  }
  _strokeBegin(event) {
    this.dispatchEvent(new CustomEvent('beginStroke', {
      detail: event
    }));
    const newPointGroup = {
      dotSize: this.dotSize,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      penColor: this.penColor,
      points: []
    };
    this._data.push(newPointGroup);
    this._reset();
    this._strokeUpdate(event);
  }
  _strokeUpdate(event) {
    if (this._data.length === 0) {
      this._strokeBegin(event);
      return;
    }
    this.dispatchEvent(new CustomEvent('beforeUpdateStroke', {
      detail: event
    }));
    const x = event.clientX;
    const y = event.clientY;
    const pressure = event.pressure !== undefined ? event.pressure : event.force !== undefined ? event.force : 0;
    const point = this._createPoint(x, y, pressure);
    const lastPointGroup = this._data[this._data.length - 1];
    const lastPoints = lastPointGroup.points;
    const lastPoint = lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
    const isLastPointTooClose = lastPoint ? point.distanceTo(lastPoint) <= this.minDistance : false;
    const {
      penColor,
      dotSize,
      minWidth,
      maxWidth
    } = lastPointGroup;
    if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
      const curve = this._addPoint(point);
      if (!lastPoint) {
        this._drawDot(point, {
          penColor,
          dotSize,
          minWidth,
          maxWidth
        });
      } else if (curve) {
        this._drawCurve(curve, {
          penColor,
          dotSize,
          minWidth,
          maxWidth
        });
      }
      lastPoints.push({
        time: point.time,
        x: point.x,
        y: point.y,
        pressure: point.pressure
      });
    }
    this.dispatchEvent(new CustomEvent('afterUpdateStroke', {
      detail: event
    }));
  }
  _strokeEnd(event) {
    this._strokeUpdate(event);
    this.dispatchEvent(new CustomEvent('endStroke', {
      detail: event
    }));
  }
  _handlePointerEvents() {
    this._drawningStroke = false;
    this.canvas.addEventListener('pointerdown', this._handlePointerStart);
    this.canvas.addEventListener('pointermove', this._handlePointerMove);
    document.addEventListener('pointerup', this._handlePointerEnd);
  }
  _handleMouseEvents() {
    this._drawningStroke = false;
    this.canvas.addEventListener('mousedown', this._handleMouseDown);
    this.canvas.addEventListener('mousemove', this._handleMouseMove);
    document.addEventListener('mouseup', this._handleMouseUp);
  }
  _handleTouchEvents() {
    this.canvas.addEventListener('touchstart', this._handleTouchStart);
    this.canvas.addEventListener('touchmove', this._handleTouchMove);
    this.canvas.addEventListener('touchend', this._handleTouchEnd);
  }
  _reset() {
    this._lastPoints = [];
    this._lastVelocity = 0;
    this._lastWidth = (this.minWidth + this.maxWidth) / 2;
    this._ctx.fillStyle = this.penColor;
  }
  _createPoint(x, y, pressure) {
    const rect = this.canvas.getBoundingClientRect();
    return new Point(x - rect.left, y - rect.top, pressure, new Date().getTime());
  }
  _addPoint(point) {
    const {
      _lastPoints
    } = this;
    _lastPoints.push(point);
    if (_lastPoints.length > 2) {
      if (_lastPoints.length === 3) {
        _lastPoints.unshift(_lastPoints[0]);
      }
      const widths = this._calculateCurveWidths(_lastPoints[1], _lastPoints[2]);
      const curve = Bezier.fromPoints(_lastPoints, widths);
      _lastPoints.shift();
      return curve;
    }
    return null;
  }
  _calculateCurveWidths(startPoint, endPoint) {
    const velocity = this.velocityFilterWeight * endPoint.velocityFrom(startPoint) + (1 - this.velocityFilterWeight) * this._lastVelocity;
    const newWidth = this._strokeWidth(velocity);
    const widths = {
      end: newWidth,
      start: this._lastWidth
    };
    this._lastVelocity = velocity;
    this._lastWidth = newWidth;
    return widths;
  }
  _strokeWidth(velocity) {
    return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
  }
  _drawCurveSegment(x, y, width) {
    const ctx = this._ctx;
    ctx.moveTo(x, y);
    ctx.arc(x, y, width, 0, 2 * Math.PI, false);
    this._isEmpty = false;
  }
  _drawCurve(curve, options) {
    const ctx = this._ctx;
    const widthDelta = curve.endWidth - curve.startWidth;
    const drawSteps = Math.ceil(curve.length()) * 2;
    ctx.beginPath();
    ctx.fillStyle = options.penColor;
    for (let i = 0; i < drawSteps; i += 1) {
      const t = i / drawSteps;
      const tt = t * t;
      const ttt = tt * t;
      const u = 1 - t;
      const uu = u * u;
      const uuu = uu * u;
      let x = uuu * curve.startPoint.x;
      x += 3 * uu * t * curve.control1.x;
      x += 3 * u * tt * curve.control2.x;
      x += ttt * curve.endPoint.x;
      let y = uuu * curve.startPoint.y;
      y += 3 * uu * t * curve.control1.y;
      y += 3 * u * tt * curve.control2.y;
      y += ttt * curve.endPoint.y;
      const width = Math.min(curve.startWidth + ttt * widthDelta, options.maxWidth);
      this._drawCurveSegment(x, y, width);
    }
    ctx.closePath();
    ctx.fill();
  }
  _drawDot(point, options) {
    const ctx = this._ctx;
    const width = options.dotSize > 0 ? options.dotSize : (options.minWidth + options.maxWidth) / 2;
    ctx.beginPath();
    this._drawCurveSegment(point.x, point.y, width);
    ctx.closePath();
    ctx.fillStyle = options.penColor;
    ctx.fill();
  }
  _fromData(pointGroups, drawCurve, drawDot) {
    for (const group of pointGroups) {
      const {
        penColor,
        dotSize,
        minWidth,
        maxWidth,
        points
      } = group;
      if (points.length > 1) {
        for (let j = 0; j < points.length; j += 1) {
          const basicPoint = points[j];
          const point = new Point(basicPoint.x, basicPoint.y, basicPoint.pressure, basicPoint.time);
          this.penColor = penColor;
          if (j === 0) {
            this._reset();
          }
          const curve = this._addPoint(point);
          if (curve) {
            drawCurve(curve, {
              penColor,
              dotSize,
              minWidth,
              maxWidth
            });
          }
        }
      } else {
        this._reset();
        drawDot(points[0], {
          penColor,
          dotSize,
          minWidth,
          maxWidth
        });
      }
    }
  }
  _toSVG() {
    const pointGroups = this._data;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const minX = 0;
    const minY = 0;
    const maxX = this.canvas.width / ratio;
    const maxY = this.canvas.height / ratio;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.canvas.width.toString());
    svg.setAttribute('height', this.canvas.height.toString());
    this._fromData(pointGroups, (curve, {
      penColor
    }) => {
      const path = document.createElement('path');
      if (!isNaN(curve.control1.x) && !isNaN(curve.control1.y) && !isNaN(curve.control2.x) && !isNaN(curve.control2.y)) {
        const attr = `M ${curve.startPoint.x.toFixed(3)},${curve.startPoint.y.toFixed(3)} ` + `C ${curve.control1.x.toFixed(3)},${curve.control1.y.toFixed(3)} ` + `${curve.control2.x.toFixed(3)},${curve.control2.y.toFixed(3)} ` + `${curve.endPoint.x.toFixed(3)},${curve.endPoint.y.toFixed(3)}`;
        path.setAttribute('d', attr);
        path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
        path.setAttribute('stroke', penColor);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
      }
    }, (point, {
      penColor,
      dotSize,
      minWidth,
      maxWidth
    }) => {
      const circle = document.createElement('circle');
      const size = dotSize > 0 ? dotSize : (minWidth + maxWidth) / 2;
      circle.setAttribute('r', size.toString());
      circle.setAttribute('cx', point.x.toString());
      circle.setAttribute('cy', point.y.toString());
      circle.setAttribute('fill', penColor);
      svg.appendChild(circle);
    });
    const prefix = 'data:image/svg+xml;base64,';
    const header = '<svg' + ' xmlns="http://www.w3.org/2000/svg"' + ' xmlns:xlink="http://www.w3.org/1999/xlink"' + ` viewBox="${minX} ${minY} ${this.canvas.width} ${this.canvas.height}"` + ` width="${maxX}"` + ` height="${maxY}"` + '>';
    let body = svg.innerHTML;
    if (body === undefined) {
      const dummy = document.createElement('dummy');
      const nodes = svg.childNodes;
      dummy.innerHTML = '';
      for (let i = 0; i < nodes.length; i += 1) {
        dummy.appendChild(nodes[i].cloneNode(true));
      }
      body = dummy.innerHTML;
    }
    const footer = '</svg>';
    const data = header + body + footer;
    return prefix + btoa(data);
  }
}

var classnames = {exports: {}};

/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/

var hasRequiredClassnames;

function requireClassnames () {
	if (hasRequiredClassnames) return classnames.exports;
	hasRequiredClassnames = 1;
	(function (module) {
		/* global define */

		(function () {

		  var hasOwn = {}.hasOwnProperty;
		  function classNames() {
		    var classes = '';
		    for (var i = 0; i < arguments.length; i++) {
		      var arg = arguments[i];
		      if (arg) {
		        classes = appendClass(classes, parseValue(arg));
		      }
		    }
		    return classes;
		  }
		  function parseValue(arg) {
		    if (typeof arg === 'string' || typeof arg === 'number') {
		      return arg;
		    }
		    if (typeof arg !== 'object') {
		      return '';
		    }
		    if (Array.isArray(arg)) {
		      return classNames.apply(null, arg);
		    }
		    if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
		      return arg.toString();
		    }
		    var classes = '';
		    for (var key in arg) {
		      if (hasOwn.call(arg, key) && arg[key]) {
		        classes = appendClass(classes, key);
		      }
		    }
		    return classes;
		  }
		  function appendClass(value, newClass) {
		    if (!newClass) {
		      return value;
		    }
		    if (value) {
		      return value + ' ' + newClass;
		    }
		    return value + newClass;
		  }
		  if (module.exports) {
		    classNames.default = classNames;
		    module.exports = classNames;
		  } else {
		    window.classNames = classNames;
		  }
		})(); 
	} (classnames));
	return classnames.exports;
}

var classnamesExports = requireClassnames();
var classNames = /*@__PURE__*/getDefaultExportFromCjs(classnamesExports);

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */

var isObject_1;
var hasRequiredIsObject;

function requireIsObject () {
	if (hasRequiredIsObject) return isObject_1;
	hasRequiredIsObject = 1;
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}
	isObject_1 = isObject;
	return isObject_1;
}

/** Detect free variable `global` from Node.js. */

var _freeGlobal;
var hasRequired_freeGlobal;

function require_freeGlobal () {
	if (hasRequired_freeGlobal) return _freeGlobal;
	hasRequired_freeGlobal = 1;
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
	_freeGlobal = freeGlobal;
	return _freeGlobal;
}

var _root;
var hasRequired_root;

function require_root () {
	if (hasRequired_root) return _root;
	hasRequired_root = 1;
	var freeGlobal = require_freeGlobal();

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	_root = root;
	return _root;
}

var now_1;
var hasRequiredNow;

function requireNow () {
	if (hasRequiredNow) return now_1;
	hasRequiredNow = 1;
	var root = require_root();

	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => Logs the number of milliseconds it took for the deferred invocation.
	 */
	var now = function () {
	  return root.Date.now();
	};
	now_1 = now;
	return now_1;
}

/** Used to match a single whitespace character. */

var _trimmedEndIndex;
var hasRequired_trimmedEndIndex;

function require_trimmedEndIndex () {
	if (hasRequired_trimmedEndIndex) return _trimmedEndIndex;
	hasRequired_trimmedEndIndex = 1;
	var reWhitespace = /\s/;

	/**
	 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
	 * character of `string`.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {number} Returns the index of the last non-whitespace character.
	 */
	function trimmedEndIndex(string) {
	  var index = string.length;
	  while (index-- && reWhitespace.test(string.charAt(index))) {}
	  return index;
	}
	_trimmedEndIndex = trimmedEndIndex;
	return _trimmedEndIndex;
}

var _baseTrim;
var hasRequired_baseTrim;

function require_baseTrim () {
	if (hasRequired_baseTrim) return _baseTrim;
	hasRequired_baseTrim = 1;
	var trimmedEndIndex = require_trimmedEndIndex();

	/** Used to match leading whitespace. */
	var reTrimStart = /^\s+/;

	/**
	 * The base implementation of `_.trim`.
	 *
	 * @private
	 * @param {string} string The string to trim.
	 * @returns {string} Returns the trimmed string.
	 */
	function baseTrim(string) {
	  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '') : string;
	}
	_baseTrim = baseTrim;
	return _baseTrim;
}

var _Symbol;
var hasRequired_Symbol;

function require_Symbol () {
	if (hasRequired_Symbol) return _Symbol;
	hasRequired_Symbol = 1;
	var root = require_root();

	/** Built-in value references. */
	var Symbol = root.Symbol;
	_Symbol = Symbol;
	return _Symbol;
}

var _getRawTag;
var hasRequired_getRawTag;

function require_getRawTag () {
	if (hasRequired_getRawTag) return _getRawTag;
	hasRequired_getRawTag = 1;
	var Symbol = require_Symbol();

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	    tag = value[symToStringTag];
	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}
	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}
	_getRawTag = getRawTag;
	return _getRawTag;
}

/** Used for built-in method references. */

var _objectToString;
var hasRequired_objectToString;

function require_objectToString () {
	if (hasRequired_objectToString) return _objectToString;
	hasRequired_objectToString = 1;
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}
	_objectToString = objectToString;
	return _objectToString;
}

var _baseGetTag;
var hasRequired_baseGetTag;

function require_baseGetTag () {
	if (hasRequired_baseGetTag) return _baseGetTag;
	hasRequired_baseGetTag = 1;
	var Symbol = require_Symbol(),
	  getRawTag = require_getRawTag(),
	  objectToString = require_objectToString();

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	  undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	_baseGetTag = baseGetTag;
	return _baseGetTag;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */

var isObjectLike_1;
var hasRequiredIsObjectLike;

function requireIsObjectLike () {
	if (hasRequiredIsObjectLike) return isObjectLike_1;
	hasRequiredIsObjectLike = 1;
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}
	isObjectLike_1 = isObjectLike;
	return isObjectLike_1;
}

var isSymbol_1;
var hasRequiredIsSymbol;

function requireIsSymbol () {
	if (hasRequiredIsSymbol) return isSymbol_1;
	hasRequiredIsSymbol = 1;
	var baseGetTag = require_baseGetTag(),
	  isObjectLike = requireIsObjectLike();

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
	}
	isSymbol_1 = isSymbol;
	return isSymbol_1;
}

var toNumber_1;
var hasRequiredToNumber;

function requireToNumber () {
	if (hasRequiredToNumber) return toNumber_1;
	hasRequiredToNumber = 1;
	var baseTrim = require_baseTrim(),
	  isObject = requireIsObject(),
	  isSymbol = requireIsSymbol();

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? other + '' : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = baseTrim(value);
	  var isBinary = reIsBinary.test(value);
	  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
	}
	toNumber_1 = toNumber;
	return toNumber_1;
}

var debounce_1;
var hasRequiredDebounce;

function requireDebounce () {
	if (hasRequiredDebounce) return debounce_1;
	hasRequiredDebounce = 1;
	var isObject = requireIsObject(),
	  now = requireNow(),
	  toNumber = requireToNumber();

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max,
	  nativeMin = Math.min;

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=false]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {number} [options.maxWait]
	 *  The maximum time `func` is allowed to be delayed before it's invoked.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce(func, wait, options) {
	  var lastArgs,
	    lastThis,
	    maxWait,
	    result,
	    timerId,
	    lastCallTime,
	    lastInvokeTime = 0,
	    leading = false,
	    maxing = false,
	    trailing = true;
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  wait = toNumber(wait) || 0;
	  if (isObject(options)) {
	    leading = !!options.leading;
	    maxing = 'maxWait' in options;
	    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }
	  function invokeFunc(time) {
	    var args = lastArgs,
	      thisArg = lastThis;
	    lastArgs = lastThis = undefined;
	    lastInvokeTime = time;
	    result = func.apply(thisArg, args);
	    return result;
	  }
	  function leadingEdge(time) {
	    // Reset any `maxWait` timer.
	    lastInvokeTime = time;
	    // Start the timer for the trailing edge.
	    timerId = setTimeout(timerExpired, wait);
	    // Invoke the leading edge.
	    return leading ? invokeFunc(time) : result;
	  }
	  function remainingWait(time) {
	    var timeSinceLastCall = time - lastCallTime,
	      timeSinceLastInvoke = time - lastInvokeTime,
	      timeWaiting = wait - timeSinceLastCall;
	    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
	  }
	  function shouldInvoke(time) {
	    var timeSinceLastCall = time - lastCallTime,
	      timeSinceLastInvoke = time - lastInvokeTime;

	    // Either this is the first call, activity has stopped and we're at the
	    // trailing edge, the system time has gone backwards and we're treating
	    // it as the trailing edge, or we've hit the `maxWait` limit.
	    return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
	  }
	  function timerExpired() {
	    var time = now();
	    if (shouldInvoke(time)) {
	      return trailingEdge(time);
	    }
	    // Restart the timer.
	    timerId = setTimeout(timerExpired, remainingWait(time));
	  }
	  function trailingEdge(time) {
	    timerId = undefined;

	    // Only invoke if we have `lastArgs` which means `func` has been
	    // debounced at least once.
	    if (trailing && lastArgs) {
	      return invokeFunc(time);
	    }
	    lastArgs = lastThis = undefined;
	    return result;
	  }
	  function cancel() {
	    if (timerId !== undefined) {
	      clearTimeout(timerId);
	    }
	    lastInvokeTime = 0;
	    lastArgs = lastCallTime = lastThis = timerId = undefined;
	  }
	  function flush() {
	    return timerId === undefined ? result : trailingEdge(now());
	  }
	  function debounced() {
	    var time = now(),
	      isInvoking = shouldInvoke(time);
	    lastArgs = arguments;
	    lastThis = this;
	    lastCallTime = time;
	    if (isInvoking) {
	      if (timerId === undefined) {
	        return leadingEdge(lastCallTime);
	      }
	      if (maxing) {
	        // Handle invocations in a tight loop.
	        clearTimeout(timerId);
	        timerId = setTimeout(timerExpired, wait);
	        return invokeFunc(lastCallTime);
	      }
	    }
	    if (timerId === undefined) {
	      timerId = setTimeout(timerExpired, wait);
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}
	debounce_1 = debounce;
	return debounce_1;
}

var debounceExports = requireDebounce();
var debounce = /*@__PURE__*/getDefaultExportFromCjs(debounceExports);

var throttle_1;
var hasRequiredThrottle;

function requireThrottle () {
	if (hasRequiredThrottle) return throttle_1;
	hasRequiredThrottle = 1;
	var debounce = requireDebounce(),
	  isObject = requireIsObject();

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/**
	 * Creates a throttled function that only invokes `func` at most once per
	 * every `wait` milliseconds. The throttled function comes with a `cancel`
	 * method to cancel delayed `func` invocations and a `flush` method to
	 * immediately invoke them. Provide `options` to indicate whether `func`
	 * should be invoked on the leading and/or trailing edge of the `wait`
	 * timeout. The `func` is invoked with the last arguments provided to the
	 * throttled function. Subsequent calls to the throttled function return the
	 * result of the last `func` invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the throttled function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.throttle` and `_.debounce`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to throttle.
	 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=true]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new throttled function.
	 * @example
	 *
	 * // Avoid excessively updating the position while scrolling.
	 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	 *
	 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
	 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
	 * jQuery(element).on('click', throttled);
	 *
	 * // Cancel the trailing throttled invocation.
	 * jQuery(window).on('popstate', throttled.cancel);
	 */
	function throttle(func, wait, options) {
	  var leading = true,
	    trailing = true;
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  if (isObject(options)) {
	    leading = 'leading' in options ? !!options.leading : leading;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }
	  return debounce(func, wait, {
	    'leading': leading,
	    'maxWait': wait,
	    'trailing': trailing
	  });
	}
	throttle_1 = throttle;
	return throttle_1;
}

var throttleExports = requireThrottle();
var throttle = /*@__PURE__*/getDefaultExportFromCjs(throttleExports);

/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
var patchResizeCallback = function (resizeCallback, refreshMode, refreshRate, refreshOptions) {
  switch (refreshMode) {
    case 'debounce':
      return debounce(resizeCallback, refreshRate, refreshOptions);
    case 'throttle':
      return throttle(resizeCallback, refreshRate, refreshOptions);
    default:
      return resizeCallback;
  }
};
var isFunction = function (fn) {
  return typeof fn === 'function';
};
var isSSR = function () {
  return typeof window === 'undefined';
};
var isDOMElement = function (element) {
  return element instanceof Element || element instanceof HTMLDocument;
};
var ResizeDetector = /** @class */function (_super) {
  __extends(ResizeDetector, _super);
  function ResizeDetector(props) {
    var _this = _super.call(this, props) || this;
    _this.cancelHandler = function () {
      if (_this.resizeHandler && _this.resizeHandler.cancel) {
        // cancel debounced handler
        _this.resizeHandler.cancel();
        _this.resizeHandler = null;
      }
    };
    _this.attachObserver = function () {
      var _a = _this.props,
        targetRef = _a.targetRef,
        observerOptions = _a.observerOptions;
      if (isSSR()) {
        return;
      }
      if (targetRef && targetRef.current) {
        _this.targetRef.current = targetRef.current;
      }
      var element = _this.getElement();
      if (!element) {
        // can't find element to observe
        return;
      }
      if (_this.observableElement && _this.observableElement === element) {
        // element is already observed
        return;
      }
      _this.observableElement = element;
      _this.resizeObserver.observe(element, observerOptions);
    };
    _this.getElement = function () {
      var _a = _this.props,
        querySelector = _a.querySelector,
        targetDomEl = _a.targetDomEl;
      if (isSSR()) return null;
      // in case we pass a querySelector
      if (querySelector) return document.querySelector(querySelector);
      // in case we pass a DOM element
      if (targetDomEl && isDOMElement(targetDomEl)) return targetDomEl;
      // in case we pass a React ref using React.createRef()
      if (_this.targetRef && isDOMElement(_this.targetRef.current)) return _this.targetRef.current;
      // the worse case when we don't receive any information from the parent and the library doesn't add any wrappers
      // we have to use a deprecated `findDOMNode` method in order to find a DOM element to attach to
      var currentElement = reactDom.findDOMNode(_this);
      if (!currentElement) return null;
      var renderType = _this.getRenderType();
      switch (renderType) {
        case 'renderProp':
          return currentElement;
        case 'childFunction':
          return currentElement;
        case 'child':
          return currentElement;
        case 'childArray':
          return currentElement;
        default:
          return currentElement.parentElement;
      }
    };
    _this.createResizeHandler = function (entries) {
      var _a = _this.props,
        _b = _a.handleWidth,
        handleWidth = _b === void 0 ? true : _b,
        _c = _a.handleHeight,
        handleHeight = _c === void 0 ? true : _c,
        onResize = _a.onResize;
      if (!handleWidth && !handleHeight) return;
      var notifyResize = function (_a) {
        var width = _a.width,
          height = _a.height;
        if (_this.state.width === width && _this.state.height === height) {
          // skip if dimensions haven't changed
          return;
        }
        if (_this.state.width === width && !handleHeight || _this.state.height === height && !handleWidth) {
          // process `handleHeight/handleWidth` props
          return;
        }
        onResize === null || onResize === void 0 ? void 0 : onResize(width, height);
        _this.setState({
          width: width,
          height: height
        });
      };
      entries.forEach(function (entry) {
        var _a = entry && entry.contentRect || {},
          width = _a.width,
          height = _a.height;
        var shouldSetSize = !_this.skipOnMount && !isSSR();
        if (shouldSetSize) {
          notifyResize({
            width: width,
            height: height
          });
        }
        _this.skipOnMount = false;
      });
    };
    _this.getRenderType = function () {
      var _a = _this.props,
        render = _a.render,
        children = _a.children;
      if (isFunction(render)) {
        // DEPRECATED. Use `Child Function Pattern` instead
        return 'renderProp';
      }
      if (isFunction(children)) {
        return 'childFunction';
      }
      if (React.isValidElement(children)) {
        return 'child';
      }
      if (Array.isArray(children)) {
        // DEPRECATED. Wrap children with a single parent
        return 'childArray';
      }
      // DEPRECATED. Use `Child Function Pattern` instead
      return 'parent';
    };
    var skipOnMount = props.skipOnMount,
      refreshMode = props.refreshMode,
      _a = props.refreshRate,
      refreshRate = _a === void 0 ? 1000 : _a,
      refreshOptions = props.refreshOptions;
    _this.state = {
      width: undefined,
      height: undefined
    };
    _this.sizeRef = {
      current: _this.state
    };
    _this.skipOnMount = skipOnMount;
    _this.targetRef = React.createRef();
    _this.observableElement = null;
    if (isSSR()) {
      return _this;
    }
    _this.resizeHandler = patchResizeCallback(_this.createResizeHandler, refreshMode, refreshRate, refreshOptions);
    _this.resizeObserver = new window.ResizeObserver(_this.resizeHandler);
    return _this;
  }
  ResizeDetector.prototype.componentDidMount = function () {
    this.attachObserver();
  };
  ResizeDetector.prototype.componentDidUpdate = function () {
    this.attachObserver();
    this.sizeRef.current = this.state;
  };
  ResizeDetector.prototype.componentWillUnmount = function () {
    if (isSSR()) {
      return;
    }
    this.observableElement = null;
    this.resizeObserver.disconnect();
    this.cancelHandler();
  };
  ResizeDetector.prototype.render = function () {
    var _a = this.props,
      render = _a.render,
      children = _a.children,
      _b = _a.nodeType,
      WrapperTag = _b === void 0 ? 'div' : _b;
    var _c = this.state,
      width = _c.width,
      height = _c.height;
    var childProps = {
      width: width,
      height: height,
      targetRef: this.targetRef
    };
    var renderType = this.getRenderType();
    switch (renderType) {
      case 'renderProp':
        return render === null || render === void 0 ? void 0 : render(childProps);
      case 'childFunction':
        {
          var childFunction = children;
          return childFunction === null || childFunction === void 0 ? void 0 : childFunction(childProps);
        }
      case 'child':
        {
          // @TODO bug prone logic
          var child = children;
          if (child.type && typeof child.type === 'string') {
            // child is a native DOM elements such as div, span etc
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            childProps.targetRef;
            var nativeProps = __rest(childProps, ["targetRef"]);
            return React.cloneElement(child, nativeProps);
          }
          // class or functional component otherwise
          return React.cloneElement(child, childProps);
        }
      case 'childArray':
        {
          var childArray = children;
          return childArray.map(function (el) {
            return !!el && React.cloneElement(el, childProps);
          });
        }
      default:
        return React.createElement(WrapperTag, null);
    }
  };
  return ResizeDetector;
}(React.PureComponent);

const Alert = ({ bootstrapStyle = "danger", className, children }) => children ? React.createElement("div", { className: classNames(`alert alert-${bootstrapStyle}`, className) }, children) : null;
Alert.displayName = "Alert";

const Grid = ({ gridCellWidth, gridCellHeight, gridBorderColor, gridBorderWidth, showGrid = true }) => {
    const id = `grid${Math.floor(Math.random() * 1000000)}`;
    return showGrid ? (React.createElement("svg", { className: "widget-signature-grid", width: "100%", height: "100%", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("defs", null,
            React.createElement("pattern", { id: id, width: gridCellWidth, height: gridCellHeight, patternUnits: "userSpaceOnUse" },
                React.createElement("line", { x1: "0", y1: gridCellHeight, x2: gridCellWidth, y2: gridCellHeight, stroke: gridBorderColor, strokeWidth: gridBorderWidth }),
                React.createElement("line", { x1: gridCellWidth, y1: "0", x2: gridCellWidth, y2: gridCellHeight, stroke: gridBorderColor, strokeWidth: gridBorderWidth }))),
        React.createElement("rect", { width: "100%", height: "100%", fill: `url(#${id})` }))) : null;
};
Grid.displayName = "Grid";

const SizeContainer = ({ className, classNameInner, widthUnit, width, heightUnit, height, children, style, readOnly = false }) => {
    const styleWidth = widthUnit === "percentage" ? `${width}%` : `${width}px`;
    return React.createElement("div", {
        className: classNames(className, "size-box"),
        style: {
            position: "relative",
            width: styleWidth,
            ...getHeight(heightUnit, height, widthUnit, width),
            ...style
        }
    }, React.createElement("div", {
        className: classNames("size-box-inner", classNameInner),
        readOnly,
        disabled: readOnly,
        style: {
            position: "absolute",
            top: "0",
            right: "0",
            bottom: "0",
            left: "0"
        }
    }, children));
};
SizeContainer.displayName = "SizeContainer";
const getHeight = (heightUnit, height, widthUnit, width) => {
    const style = {};
    if (heightUnit === "percentageOfWidth") {
        const ratio = (height / 100) * width;
        if (widthUnit === "percentage") {
            style.height = "auto";
            style.paddingBottom = `${ratio}%`;
        }
        else {
            style.height = `${ratio}px`;
        }
    }
    else if (heightUnit === "pixels") {
        style.height = `${height}px`;
    }
    else if (heightUnit === "percentageOfParent") {
        style.height = `${height}%`;
    }
    return style;
};

class Signature extends React.PureComponent {
    canvasNode = null;
    // @ts-expect-error signature_pad has no types
    signaturePad;
    constructor(props) {
        super(props);
        this.state = {
            mode: props.signatureMode,
            typedText: "",
            hasSignature: false
        };
    }
    render() {
        const { className, alertMessage, wrapperStyle } = this.props;
        return (React.createElement(SizeContainer, { ...this.props, className: classNames("widget-signature", className), classNameInner: "widget-signature-wrapper form-control mx-textarea-input mx-textarea", style: wrapperStyle },
            React.createElement(Alert, { bootstrapStyle: "danger" }, alertMessage),
            this.renderHeader(),
            this.renderControls(),
            React.createElement("div", { className: "widget-signature-canvas-area" },
                React.createElement(Grid, { ...this.props }),
                React.createElement("canvas", { className: "widget-signature-canvas", ref: (node) => {
                        this.canvasNode = node;
                    } }),
                this.renderWatermark()),
            React.createElement(ResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize })));
    }
    renderHeader() {
        if (!this.props.showHeader || !this.props.headerText) {
            return null;
        }
        return React.createElement("div", { className: "widget-signature-header" }, this.props.headerText);
    }
    renderControls() {
        if (this.props.readOnly) {
            return null;
        }
        const showToggle = this.props.showModeToggle;
        const showInput = this.state.mode === "type";
        const showClear = this.props.showClearButton;
        const showSave = this.props.showSaveButton;
        if (!showToggle && !showInput && !showClear && !showSave) {
            return null;
        }
        return (React.createElement("div", { className: "widget-signature-controls" },
            showToggle ? (React.createElement("div", { className: "widget-signature-toggle" },
                React.createElement("button", { type: "button", className: this.state.mode === "draw" ? "active" : "", onClick: () => this.setMode("draw") }, "Draw"),
                React.createElement("button", { type: "button", className: this.state.mode === "type" ? "active" : "", onClick: () => this.setMode("type") }, "Type"))) : null,
            showInput ? (React.createElement("input", { className: "widget-signature-typed-input", type: "text", placeholder: this.props.typePlaceholder, value: this.state.typedText, onChange: this.onTypedChange })) : null,
            showClear ? (React.createElement("button", { type: "button", className: "widget-signature-clear", onClick: this.handleClearClick }, "Clear")) : null,
            showSave ? (React.createElement("button", { type: "button", className: "widget-signature-save", onClick: this.handleSaveClick, disabled: !this.props.isSaveEnabled }, this.props.saveButtonCaption || this.props.saveButtonCaptionDefault || "Save")) : null));
    }
    componentDidMount() {
        if (this.canvasNode) {
            this.signaturePad = new SignaturePad(this.canvasNode, {
                penColor: this.props.penColor,
                onEnd: this.handleSignEnd,
                ...this.signaturePadOptions()
            });
            this.applyMode();
        }
    }
    componentDidUpdate(prevProps) {
        if (this.signaturePad) {
            if (prevProps.clearSignature !== this.props.clearSignature && this.props.clearSignature) {
                this.clearCanvas();
                this.setState({ typedText: "", hasSignature: false });
            }
            if (prevProps.readOnly !== this.props.readOnly) {
                this.applyMode();
            }
            if (prevProps.penColor !== this.props.penColor) {
                this.signaturePad.penColor = this.props.penColor;
                if (this.state.mode === "type" && this.state.typedText) {
                    this.renderTypedSignature(this.state.typedText);
                }
            }
            if (prevProps.signatureMode !== this.props.signatureMode) {
                this.setMode(this.props.signatureMode);
            }
            if (prevProps.typeFontFamily !== this.props.typeFontFamily ||
                prevProps.typeFontSize !== this.props.typeFontSize) {
                if (this.state.mode === "type" && this.state.typedText) {
                    this.renderTypedSignature(this.state.typedText);
                }
            }
        }
    }
    onResize = () => {
        if (this.canvasNode) {
            this.canvasNode.width =
                this.canvasNode && this.canvasNode.parentElement ? this.canvasNode.parentElement.offsetWidth : 0;
            this.canvasNode.height =
                this.canvasNode && this.canvasNode.parentElement ? this.canvasNode.parentElement.offsetHeight : 0;
            if (this.state.mode === "type") {
                this.renderTypedSignature(this.state.typedText);
            }
            else {
                const data = this.signaturePad.toData();
                this.signaturePad.clear();
                this.signaturePad.fromData(data);
            }
        }
    };
    signaturePadOptions() {
        let options = {};
        if (this.props.penType === "fountain") {
            options = { minWidth: 0.6, maxWidth: 2.6, velocityFilterWeight: 0.6 };
        }
        else if (this.props.penType === "ballpoint") {
            options = { minWidth: 1.4, maxWidth: 1.5, velocityFilterWeight: 1.5 };
        }
        else if (this.props.penType === "marker") {
            options = { minWidth: 2, maxWidth: 4, velocityFilterWeight: 0.9 };
        }
        return options;
    }
    handleSignEnd = () => {
        if (this.props.onSignEndAction && this.state.mode === "draw") {
            this.props.onSignEndAction(this.signaturePad.toDataURL());
        }
        if (this.signaturePad && !this.signaturePad.isEmpty()) {
            this.setState({ hasSignature: true });
        }
    };
    setMode(mode) {
        if (mode === this.state.mode) {
            return;
        }
        this.setState({ mode }, () => this.applyMode());
    }
    applyMode() {
        if (!this.signaturePad) {
            return;
        }
        if (this.props.readOnly) {
            this.signaturePad.off();
            return;
        }
        if (this.state.mode === "type") {
            this.clearCanvas();
            this.signaturePad.off();
            this.renderTypedSignature(this.state.typedText);
        }
        else {
            this.clearCanvas();
            this.signaturePad.on();
        }
    }
    onTypedChange = (event) => {
        const text = event.target.value;
        this.setState({ typedText: text, hasSignature: text.trim().length > 0 }, () => {
            this.renderTypedSignature(text);
            if (this.props.onSignEndAction && text.trim()) {
                this.props.onSignEndAction(this.signaturePad.toDataURL());
            }
        });
    };
    renderTypedSignature(text) {
        if (!this.canvasNode) {
            return;
        }
        const ctx = this.canvasNode.getContext("2d");
        if (!ctx) {
            return;
        }
        this.clearCanvas();
        if (!text.trim()) {
            return;
        }
        const maxWidth = this.canvasNode.width * 0.9;
        let fontSize = Math.max(this.props.typeFontSize, 8);
        ctx.font = `${fontSize}px ${this.props.typeFontFamily}`;
        while (ctx.measureText(text).width > maxWidth && fontSize > 8) {
            fontSize -= 2;
            ctx.font = `${fontSize}px ${this.props.typeFontFamily}`;
        }
        ctx.fillStyle = this.props.penColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, this.canvasNode.width / 2, this.canvasNode.height / 2);
    }
    handleClearClick = () => {
        this.clearCanvas();
        if (this.state.typedText) {
            this.setState({ typedText: "", hasSignature: false });
        }
        else if (this.state.hasSignature) {
            this.setState({ hasSignature: false });
        }
    };
    handleSaveClick = () => {
        if (!this.props.onSave) {
            return;
        }
        const dataUrl = this.canvasNode ? this.canvasNode.toDataURL("image/png") : undefined;
        this.props.onSave(dataUrl);
    };
    renderWatermark() {
        if (!this.props.showWatermark || !this.state.hasSignature) {
            return null;
        }
        if (this.props.onWatermarkChange) {
            return (React.createElement("input", { className: "widget-signature-watermark-input", type: "text", value: this.props.watermarkText ?? "", onChange: this.onWatermarkChange, disabled: this.props.isWatermarkReadOnly }));
        }
        return React.createElement("div", { className: "widget-signature-watermark-text" }, this.props.watermarkText);
    }
    onWatermarkChange = (event) => {
        if (this.props.onWatermarkChange) {
            this.props.onWatermarkChange(event.target.value);
        }
    };
    clearCanvas() {
        if (!this.canvasNode) {
            return;
        }
        const ctx = this.canvasNode.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.canvasNode.width, this.canvasNode.height);
        }
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }
}

function preview(props) {
    return (React.createElement(Signature, { className: props.class, wrapperStyle: props.styleObject, width: props.width ?? 100, widthUnit: props.widthUnit, height: props.height ?? 50, heightUnit: props.heightUnit, showGrid: props.showGrid, gridBorderColor: props.gridBorderColor, gridBorderWidth: props.gridBorderWidth ?? 1, gridCellHeight: props.gridCellHeight ?? 50, gridCellWidth: props.gridCellWidth ?? 50, penColor: props.penColor, penType: props.penType, signatureMode: props.signatureMode, showModeToggle: false, showClearButton: props.showClearButton, showSaveButton: props.showSaveButton, saveButtonCaption: props.saveButtonCaption || props.saveButtonCaptionDefault, saveButtonCaptionDefault: props.saveButtonCaptionDefault, isSaveEnabled: true, showHeader: props.showHeader, headerText: props.headerText || props.headerTextDefault, showWatermark: props.showWatermark, watermarkText: props.watermarkAttribute || "Watermark", isWatermarkReadOnly: true, typeFontFamily: props.typeFontFamily, typeFontSize: props.typeFontSize ?? 32, typePlaceholder: props.typePlaceholder, clearSignature: false, readOnly: true }));
}
function getPreviewCss() {
    return require$$0;
}

exports.getPreviewCss = getPreviewCss;
exports.preview = preview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmF0dXJlV2ViLmVkaXRvclByZXZpZXcuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1pbmplY3QvZGlzdC9zdHlsZS1pbmplY3QuZXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc2lnbmF0dXJlX3BhZC9kaXN0L3NpZ25hdHVyZV9wYWQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvbm93LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fdHJpbW1lZEVuZEluZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRyaW0uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRSYXdUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNTeW1ib2wuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL3RvTnVtYmVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9kZWJvdW5jZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvdGhyb3R0bGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QtcmVzaXplLWRldGVjdG9yL2J1aWxkL2luZGV4LmVzbS5qcyIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL0FsZXJ0LnRzeCIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL0dyaWQudHN4IiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvU2l6ZUNvbnRhaW5lci50cyIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1NpZ25hdHVyZS50c3giLCIuLi8uLi8uLi9zcmMvU2lnbmF0dXJlV2ViLmVkaXRvclByZXZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIHN0eWxlSW5qZWN0KGNzcywgcmVmKSB7XG4gIGlmICggcmVmID09PSB2b2lkIDAgKSByZWYgPSB7fTtcbiAgdmFyIGluc2VydEF0ID0gcmVmLmluc2VydEF0O1xuXG4gIGlmICghY3NzIHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuOyB9XG5cbiAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gIGlmIChpbnNlcnRBdCA9PT0gJ3RvcCcpIHtcbiAgICBpZiAoaGVhZC5maXJzdENoaWxkKSB7XG4gICAgICBoZWFkLmluc2VydEJlZm9yZShzdHlsZSwgaGVhZC5maXJzdENoaWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R5bGVJbmplY3Q7XG4iLCIvKiFcbiAqIFNpZ25hdHVyZSBQYWQgdjQuMC4wIHwgaHR0cHM6Ly9naXRodWIuY29tL3N6aW1lay9zaWduYXR1cmVfcGFkXG4gKiAoYykgMjAyMSBTenltb24gTm93YWsgfCBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG5jbGFzcyBQb2ludCB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgcHJlc3N1cmUsIHRpbWUpIHtcbiAgICAgICAgaWYgKGlzTmFOKHgpIHx8IGlzTmFOKHkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBvaW50IGlzIGludmFsaWQ6ICgke3h9LCAke3l9KWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueCA9ICt4O1xuICAgICAgICB0aGlzLnkgPSAreTtcbiAgICAgICAgdGhpcy5wcmVzc3VyZSA9IHByZXNzdXJlIHx8IDA7XG4gICAgICAgIHRoaXMudGltZSA9IHRpbWUgfHwgRGF0ZS5ub3coKTtcbiAgICB9XG4gICAgZGlzdGFuY2VUbyhzdGFydCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHRoaXMueCAtIHN0YXJ0LngsIDIpICsgTWF0aC5wb3codGhpcy55IC0gc3RhcnQueSwgMikpO1xuICAgIH1cbiAgICBlcXVhbHMob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnggPT09IG90aGVyLnggJiZcbiAgICAgICAgICAgIHRoaXMueSA9PT0gb3RoZXIueSAmJlxuICAgICAgICAgICAgdGhpcy5wcmVzc3VyZSA9PT0gb3RoZXIucHJlc3N1cmUgJiZcbiAgICAgICAgICAgIHRoaXMudGltZSA9PT0gb3RoZXIudGltZSk7XG4gICAgfVxuICAgIHZlbG9jaXR5RnJvbShzdGFydCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aW1lICE9PSBzdGFydC50aW1lXG4gICAgICAgICAgICA/IHRoaXMuZGlzdGFuY2VUbyhzdGFydCkgLyAodGhpcy50aW1lIC0gc3RhcnQudGltZSlcbiAgICAgICAgICAgIDogMDtcbiAgICB9XG59XG5cbmNsYXNzIEJlemllciB7XG4gICAgY29uc3RydWN0b3Ioc3RhcnRQb2ludCwgY29udHJvbDIsIGNvbnRyb2wxLCBlbmRQb2ludCwgc3RhcnRXaWR0aCwgZW5kV2lkdGgpIHtcbiAgICAgICAgdGhpcy5zdGFydFBvaW50ID0gc3RhcnRQb2ludDtcbiAgICAgICAgdGhpcy5jb250cm9sMiA9IGNvbnRyb2wyO1xuICAgICAgICB0aGlzLmNvbnRyb2wxID0gY29udHJvbDE7XG4gICAgICAgIHRoaXMuZW5kUG9pbnQgPSBlbmRQb2ludDtcbiAgICAgICAgdGhpcy5zdGFydFdpZHRoID0gc3RhcnRXaWR0aDtcbiAgICAgICAgdGhpcy5lbmRXaWR0aCA9IGVuZFdpZHRoO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVBvaW50cyhwb2ludHMsIHdpZHRocykge1xuICAgICAgICBjb25zdCBjMiA9IHRoaXMuY2FsY3VsYXRlQ29udHJvbFBvaW50cyhwb2ludHNbMF0sIHBvaW50c1sxXSwgcG9pbnRzWzJdKS5jMjtcbiAgICAgICAgY29uc3QgYzMgPSB0aGlzLmNhbGN1bGF0ZUNvbnRyb2xQb2ludHMocG9pbnRzWzFdLCBwb2ludHNbMl0sIHBvaW50c1szXSkuYzE7XG4gICAgICAgIHJldHVybiBuZXcgQmV6aWVyKHBvaW50c1sxXSwgYzIsIGMzLCBwb2ludHNbMl0sIHdpZHRocy5zdGFydCwgd2lkdGhzLmVuZCk7XG4gICAgfVxuICAgIHN0YXRpYyBjYWxjdWxhdGVDb250cm9sUG9pbnRzKHMxLCBzMiwgczMpIHtcbiAgICAgICAgY29uc3QgZHgxID0gczEueCAtIHMyLng7XG4gICAgICAgIGNvbnN0IGR5MSA9IHMxLnkgLSBzMi55O1xuICAgICAgICBjb25zdCBkeDIgPSBzMi54IC0gczMueDtcbiAgICAgICAgY29uc3QgZHkyID0gczIueSAtIHMzLnk7XG4gICAgICAgIGNvbnN0IG0xID0geyB4OiAoczEueCArIHMyLngpIC8gMi4wLCB5OiAoczEueSArIHMyLnkpIC8gMi4wIH07XG4gICAgICAgIGNvbnN0IG0yID0geyB4OiAoczIueCArIHMzLngpIC8gMi4wLCB5OiAoczIueSArIHMzLnkpIC8gMi4wIH07XG4gICAgICAgIGNvbnN0IGwxID0gTWF0aC5zcXJ0KGR4MSAqIGR4MSArIGR5MSAqIGR5MSk7XG4gICAgICAgIGNvbnN0IGwyID0gTWF0aC5zcXJ0KGR4MiAqIGR4MiArIGR5MiAqIGR5Mik7XG4gICAgICAgIGNvbnN0IGR4bSA9IG0xLnggLSBtMi54O1xuICAgICAgICBjb25zdCBkeW0gPSBtMS55IC0gbTIueTtcbiAgICAgICAgY29uc3QgayA9IGwyIC8gKGwxICsgbDIpO1xuICAgICAgICBjb25zdCBjbSA9IHsgeDogbTIueCArIGR4bSAqIGssIHk6IG0yLnkgKyBkeW0gKiBrIH07XG4gICAgICAgIGNvbnN0IHR4ID0gczIueCAtIGNtLng7XG4gICAgICAgIGNvbnN0IHR5ID0gczIueSAtIGNtLnk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjMTogbmV3IFBvaW50KG0xLnggKyB0eCwgbTEueSArIHR5KSxcbiAgICAgICAgICAgIGMyOiBuZXcgUG9pbnQobTIueCArIHR4LCBtMi55ICsgdHkpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBsZW5ndGgoKSB7XG4gICAgICAgIGNvbnN0IHN0ZXBzID0gMTA7XG4gICAgICAgIGxldCBsZW5ndGggPSAwO1xuICAgICAgICBsZXQgcHg7XG4gICAgICAgIGxldCBweTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc3RlcHM7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgdCA9IGkgLyBzdGVwcztcbiAgICAgICAgICAgIGNvbnN0IGN4ID0gdGhpcy5wb2ludCh0LCB0aGlzLnN0YXJ0UG9pbnQueCwgdGhpcy5jb250cm9sMS54LCB0aGlzLmNvbnRyb2wyLngsIHRoaXMuZW5kUG9pbnQueCk7XG4gICAgICAgICAgICBjb25zdCBjeSA9IHRoaXMucG9pbnQodCwgdGhpcy5zdGFydFBvaW50LnksIHRoaXMuY29udHJvbDEueSwgdGhpcy5jb250cm9sMi55LCB0aGlzLmVuZFBvaW50LnkpO1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeGRpZmYgPSBjeCAtIHB4O1xuICAgICAgICAgICAgICAgIGNvbnN0IHlkaWZmID0gY3kgLSBweTtcbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gTWF0aC5zcXJ0KHhkaWZmICogeGRpZmYgKyB5ZGlmZiAqIHlkaWZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB4ID0gY3g7XG4gICAgICAgICAgICBweSA9IGN5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICAgIHBvaW50KHQsIHN0YXJ0LCBjMSwgYzIsIGVuZCkge1xuICAgICAgICByZXR1cm4gKHN0YXJ0ICogKDEuMCAtIHQpICogKDEuMCAtIHQpICogKDEuMCAtIHQpKVxuICAgICAgICAgICAgKyAoMy4wICogYzEgKiAoMS4wIC0gdCkgKiAoMS4wIC0gdCkgKiB0KVxuICAgICAgICAgICAgKyAoMy4wICogYzIgKiAoMS4wIC0gdCkgKiB0ICogdClcbiAgICAgICAgICAgICsgKGVuZCAqIHQgKiB0ICogdCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0aHJvdHRsZShmbiwgd2FpdCA9IDI1MCkge1xuICAgIGxldCBwcmV2aW91cyA9IDA7XG4gICAgbGV0IHRpbWVvdXQgPSBudWxsO1xuICAgIGxldCByZXN1bHQ7XG4gICAgbGV0IHN0b3JlZENvbnRleHQ7XG4gICAgbGV0IHN0b3JlZEFyZ3M7XG4gICAgY29uc3QgbGF0ZXIgPSAoKSA9PiB7XG4gICAgICAgIHByZXZpb3VzID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHJlc3VsdCA9IGZuLmFwcGx5KHN0b3JlZENvbnRleHQsIHN0b3JlZEFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgICAgIHN0b3JlZENvbnRleHQgPSBudWxsO1xuICAgICAgICAgICAgc3RvcmVkQXJncyA9IFtdO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gd3JhcHBlciguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgICBzdG9yZWRDb250ZXh0ID0gdGhpcztcbiAgICAgICAgc3RvcmVkQXJncyA9IGFyZ3M7XG4gICAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICAgICAgcmVzdWx0ID0gZm4uYXBwbHkoc3RvcmVkQ29udGV4dCwgc3RvcmVkQXJncyk7XG4gICAgICAgICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBzdG9yZWRDb250ZXh0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzdG9yZWRBcmdzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgICAgIHRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59XG5cbmNsYXNzIFNpZ25hdHVyZVBhZCBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcbiAgICBjb25zdHJ1Y3RvcihjYW52YXMsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5faGFuZGxlTW91c2VEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9ucyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXduaW5nU3Ryb2tlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VCZWdpbihldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZU1vdXNlTW92ZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RyYXduaW5nU3Ryb2tlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Ryb2tlTW92ZVVwZGF0ZShldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZU1vdXNlVXAgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5idXR0b25zID09PSAxICYmIHRoaXMuX2RyYXduaW5nU3Ryb2tlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhd25pbmdTdHJva2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VFbmQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVUb3VjaFN0YXJ0ID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VCZWdpbih0b3VjaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZVRvdWNoTW92ZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcbiAgICAgICAgICAgIHRoaXMuX3N0cm9rZU1vdmVVcGRhdGUodG91Y2gpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVUb3VjaEVuZCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2FzQ2FudmFzVG91Y2hlZCA9IGV2ZW50LnRhcmdldCA9PT0gdGhpcy5jYW52YXM7XG4gICAgICAgICAgICBpZiAod2FzQ2FudmFzVG91Y2hlZCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VFbmQodG91Y2gpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVQb2ludGVyU3RhcnQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2RyYXduaW5nU3Ryb2tlID0gdHJ1ZTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLl9zdHJva2VCZWdpbihldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZVBvaW50ZXJNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZHJhd25pbmdTdHJva2UpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0cm9rZU1vdmVVcGRhdGUoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVQb2ludGVyRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9kcmF3bmluZ1N0cm9rZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3Qgd2FzQ2FudmFzVG91Y2hlZCA9IGV2ZW50LnRhcmdldCA9PT0gdGhpcy5jYW52YXM7XG4gICAgICAgICAgICBpZiAod2FzQ2FudmFzVG91Y2hlZCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Ryb2tlRW5kKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eUZpbHRlcldlaWdodCA9IG9wdGlvbnMudmVsb2NpdHlGaWx0ZXJXZWlnaHQgfHwgMC43O1xuICAgICAgICB0aGlzLm1pbldpZHRoID0gb3B0aW9ucy5taW5XaWR0aCB8fCAwLjU7XG4gICAgICAgIHRoaXMubWF4V2lkdGggPSBvcHRpb25zLm1heFdpZHRoIHx8IDIuNTtcbiAgICAgICAgdGhpcy50aHJvdHRsZSA9ICgndGhyb3R0bGUnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRocm90dGxlIDogMTYpO1xuICAgICAgICB0aGlzLm1pbkRpc3RhbmNlID0gKCdtaW5EaXN0YW5jZScgaW4gb3B0aW9ucyA/IG9wdGlvbnMubWluRGlzdGFuY2UgOiA1KTtcbiAgICAgICAgdGhpcy5kb3RTaXplID0gb3B0aW9ucy5kb3RTaXplIHx8IDA7XG4gICAgICAgIHRoaXMucGVuQ29sb3IgPSBvcHRpb25zLnBlbkNvbG9yIHx8ICdibGFjayc7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgfHwgJ3JnYmEoMCwwLDAsMCknO1xuICAgICAgICB0aGlzLl9zdHJva2VNb3ZlVXBkYXRlID0gdGhpcy50aHJvdHRsZVxuICAgICAgICAgICAgPyB0aHJvdHRsZShTaWduYXR1cmVQYWQucHJvdG90eXBlLl9zdHJva2VVcGRhdGUsIHRoaXMudGhyb3R0bGUpXG4gICAgICAgICAgICA6IFNpZ25hdHVyZVBhZC5wcm90b3R5cGUuX3N0cm9rZVVwZGF0ZTtcbiAgICAgICAgdGhpcy5fY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5vbigpO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgY29uc3QgeyBfY3R4OiBjdHgsIGNhbnZhcyB9ID0gdGhpcztcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZENvbG9yO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLl9kYXRhID0gW107XG4gICAgICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgICAgIHRoaXMuX2lzRW1wdHkgPSB0cnVlO1xuICAgIH1cbiAgICBmcm9tRGF0YVVSTChkYXRhVXJsLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBjb25zdCByYXRpbyA9IG9wdGlvbnMucmF0aW8gfHwgd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gb3B0aW9ucy53aWR0aCB8fCB0aGlzLmNhbnZhcy53aWR0aCAvIHJhdGlvO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgfHwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gcmF0aW87XG4gICAgICAgICAgICBjb25zdCB4T2Zmc2V0ID0gb3B0aW9ucy54T2Zmc2V0IHx8IDA7XG4gICAgICAgICAgICBjb25zdCB5T2Zmc2V0ID0gb3B0aW9ucy55T2Zmc2V0IHx8IDA7XG4gICAgICAgICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N0eC5kcmF3SW1hZ2UoaW1hZ2UsIHhPZmZzZXQsIHlPZmZzZXQsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWFnZS5vbmVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWFnZS5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnO1xuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gZGF0YVVybDtcbiAgICAgICAgICAgIHRoaXMuX2lzRW1wdHkgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRvRGF0YVVSTCh0eXBlID0gJ2ltYWdlL3BuZycsIGVuY29kZXJPcHRpb25zKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnaW1hZ2Uvc3ZnK3htbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RvU1ZHKCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbnZhcy50b0RhdGFVUkwodHlwZSwgZW5jb2Rlck9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uKCkge1xuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3VjaEFjdGlvbiA9ICdub25lJztcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUubXNUb3VjaEFjdGlvbiA9ICdub25lJztcbiAgICAgICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZVBvaW50ZXJFdmVudHMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZU1vdXNlRXZlbnRzKCk7XG4gICAgICAgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlVG91Y2hFdmVudHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBvZmYoKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnRvdWNoQWN0aW9uID0gJ2F1dG8nO1xuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5tc1RvdWNoQWN0aW9uID0gJ2F1dG8nO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMuX2hhbmRsZVBvaW50ZXJTdGFydCk7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgdGhpcy5faGFuZGxlUG9pbnRlck1vdmUpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCB0aGlzLl9oYW5kbGVQb2ludGVyRW5kKTtcbiAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5faGFuZGxlTW91c2VEb3duKTtcbiAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZU1vdXNlVXApO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlVG91Y2hTdGFydCk7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZVRvdWNoTW92ZSk7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlVG91Y2hFbmQpO1xuICAgIH1cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNFbXB0eTtcbiAgICB9XG4gICAgZnJvbURhdGEocG9pbnRHcm91cHMsIHsgY2xlYXIgPSB0cnVlIH0gPSB7fSkge1xuICAgICAgICBpZiAoY2xlYXIpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9mcm9tRGF0YShwb2ludEdyb3VwcywgdGhpcy5fZHJhd0N1cnZlLmJpbmQodGhpcyksIHRoaXMuX2RyYXdEb3QuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX2RhdGEgPSBjbGVhciA/IHBvaW50R3JvdXBzIDogdGhpcy5fZGF0YS5jb25jYXQocG9pbnRHcm91cHMpO1xuICAgIH1cbiAgICB0b0RhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICAgIH1cbiAgICBfc3Ryb2tlQmVnaW4oZXZlbnQpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnYmVnaW5TdHJva2UnLCB7IGRldGFpbDogZXZlbnQgfSkpO1xuICAgICAgICBjb25zdCBuZXdQb2ludEdyb3VwID0ge1xuICAgICAgICAgICAgZG90U2l6ZTogdGhpcy5kb3RTaXplLFxuICAgICAgICAgICAgbWluV2lkdGg6IHRoaXMubWluV2lkdGgsXG4gICAgICAgICAgICBtYXhXaWR0aDogdGhpcy5tYXhXaWR0aCxcbiAgICAgICAgICAgIHBlbkNvbG9yOiB0aGlzLnBlbkNvbG9yLFxuICAgICAgICAgICAgcG9pbnRzOiBbXSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fZGF0YS5wdXNoKG5ld1BvaW50R3JvdXApO1xuICAgICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgICB0aGlzLl9zdHJva2VVcGRhdGUoZXZlbnQpO1xuICAgIH1cbiAgICBfc3Ryb2tlVXBkYXRlKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fc3Ryb2tlQmVnaW4oZXZlbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2JlZm9yZVVwZGF0ZVN0cm9rZScsIHsgZGV0YWlsOiBldmVudCB9KSk7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgY29uc3QgcHJlc3N1cmUgPSBldmVudC5wcmVzc3VyZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGV2ZW50LnByZXNzdXJlXG4gICAgICAgICAgICA6IGV2ZW50LmZvcmNlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICA/IGV2ZW50LmZvcmNlXG4gICAgICAgICAgICAgICAgOiAwO1xuICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMuX2NyZWF0ZVBvaW50KHgsIHksIHByZXNzdXJlKTtcbiAgICAgICAgY29uc3QgbGFzdFBvaW50R3JvdXAgPSB0aGlzLl9kYXRhW3RoaXMuX2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IGxhc3RQb2ludHMgPSBsYXN0UG9pbnRHcm91cC5wb2ludHM7XG4gICAgICAgIGNvbnN0IGxhc3RQb2ludCA9IGxhc3RQb2ludHMubGVuZ3RoID4gMCAmJiBsYXN0UG9pbnRzW2xhc3RQb2ludHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IGlzTGFzdFBvaW50VG9vQ2xvc2UgPSBsYXN0UG9pbnRcbiAgICAgICAgICAgID8gcG9pbnQuZGlzdGFuY2VUbyhsYXN0UG9pbnQpIDw9IHRoaXMubWluRGlzdGFuY2VcbiAgICAgICAgICAgIDogZmFsc2U7XG4gICAgICAgIGNvbnN0IHsgcGVuQ29sb3IsIGRvdFNpemUsIG1pbldpZHRoLCBtYXhXaWR0aCB9ID0gbGFzdFBvaW50R3JvdXA7XG4gICAgICAgIGlmICghbGFzdFBvaW50IHx8ICEobGFzdFBvaW50ICYmIGlzTGFzdFBvaW50VG9vQ2xvc2UpKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJ2ZSA9IHRoaXMuX2FkZFBvaW50KHBvaW50KTtcbiAgICAgICAgICAgIGlmICghbGFzdFBvaW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhd0RvdChwb2ludCwge1xuICAgICAgICAgICAgICAgICAgICBwZW5Db2xvcixcbiAgICAgICAgICAgICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIG1heFdpZHRoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY3VydmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3Q3VydmUoY3VydmUsIHtcbiAgICAgICAgICAgICAgICAgICAgcGVuQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICAgICAgIG1pbldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3RQb2ludHMucHVzaCh7XG4gICAgICAgICAgICAgICAgdGltZTogcG9pbnQudGltZSxcbiAgICAgICAgICAgICAgICB4OiBwb2ludC54LFxuICAgICAgICAgICAgICAgIHk6IHBvaW50LnksXG4gICAgICAgICAgICAgICAgcHJlc3N1cmU6IHBvaW50LnByZXNzdXJlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnYWZ0ZXJVcGRhdGVTdHJva2UnLCB7IGRldGFpbDogZXZlbnQgfSkpO1xuICAgIH1cbiAgICBfc3Ryb2tlRW5kKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX3N0cm9rZVVwZGF0ZShldmVudCk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2VuZFN0cm9rZScsIHsgZGV0YWlsOiBldmVudCB9KSk7XG4gICAgfVxuICAgIF9oYW5kbGVQb2ludGVyRXZlbnRzKCkge1xuICAgICAgICB0aGlzLl9kcmF3bmluZ1N0cm9rZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMuX2hhbmRsZVBvaW50ZXJTdGFydCk7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgdGhpcy5faGFuZGxlUG9pbnRlck1vdmUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCB0aGlzLl9oYW5kbGVQb2ludGVyRW5kKTtcbiAgICB9XG4gICAgX2hhbmRsZU1vdXNlRXZlbnRzKCkge1xuICAgICAgICB0aGlzLl9kcmF3bmluZ1N0cm9rZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9oYW5kbGVNb3VzZURvd24pO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlTW91c2VVcCk7XG4gICAgfVxuICAgIF9oYW5kbGVUb3VjaEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX2hhbmRsZVRvdWNoU3RhcnQpO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVUb3VjaE1vdmUpO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZVRvdWNoRW5kKTtcbiAgICB9XG4gICAgX3Jlc2V0KCkge1xuICAgICAgICB0aGlzLl9sYXN0UG9pbnRzID0gW107XG4gICAgICAgIHRoaXMuX2xhc3RWZWxvY2l0eSA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RXaWR0aCA9ICh0aGlzLm1pbldpZHRoICsgdGhpcy5tYXhXaWR0aCkgLyAyO1xuICAgICAgICB0aGlzLl9jdHguZmlsbFN0eWxlID0gdGhpcy5wZW5Db2xvcjtcbiAgICB9XG4gICAgX2NyZWF0ZVBvaW50KHgsIHksIHByZXNzdXJlKSB7XG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludCh4IC0gcmVjdC5sZWZ0LCB5IC0gcmVjdC50b3AsIHByZXNzdXJlLCBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgfVxuICAgIF9hZGRQb2ludChwb2ludCkge1xuICAgICAgICBjb25zdCB7IF9sYXN0UG9pbnRzIH0gPSB0aGlzO1xuICAgICAgICBfbGFzdFBvaW50cy5wdXNoKHBvaW50KTtcbiAgICAgICAgaWYgKF9sYXN0UG9pbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIGlmIChfbGFzdFBvaW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICBfbGFzdFBvaW50cy51bnNoaWZ0KF9sYXN0UG9pbnRzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHdpZHRocyA9IHRoaXMuX2NhbGN1bGF0ZUN1cnZlV2lkdGhzKF9sYXN0UG9pbnRzWzFdLCBfbGFzdFBvaW50c1syXSk7XG4gICAgICAgICAgICBjb25zdCBjdXJ2ZSA9IEJlemllci5mcm9tUG9pbnRzKF9sYXN0UG9pbnRzLCB3aWR0aHMpO1xuICAgICAgICAgICAgX2xhc3RQb2ludHMuc2hpZnQoKTtcbiAgICAgICAgICAgIHJldHVybiBjdXJ2ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgX2NhbGN1bGF0ZUN1cnZlV2lkdGhzKHN0YXJ0UG9pbnQsIGVuZFBvaW50KSB7XG4gICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gdGhpcy52ZWxvY2l0eUZpbHRlcldlaWdodCAqIGVuZFBvaW50LnZlbG9jaXR5RnJvbShzdGFydFBvaW50KSArXG4gICAgICAgICAgICAoMSAtIHRoaXMudmVsb2NpdHlGaWx0ZXJXZWlnaHQpICogdGhpcy5fbGFzdFZlbG9jaXR5O1xuICAgICAgICBjb25zdCBuZXdXaWR0aCA9IHRoaXMuX3N0cm9rZVdpZHRoKHZlbG9jaXR5KTtcbiAgICAgICAgY29uc3Qgd2lkdGhzID0ge1xuICAgICAgICAgICAgZW5kOiBuZXdXaWR0aCxcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl9sYXN0V2lkdGgsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2xhc3RWZWxvY2l0eSA9IHZlbG9jaXR5O1xuICAgICAgICB0aGlzLl9sYXN0V2lkdGggPSBuZXdXaWR0aDtcbiAgICAgICAgcmV0dXJuIHdpZHRocztcbiAgICB9XG4gICAgX3N0cm9rZVdpZHRoKHZlbG9jaXR5KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCh0aGlzLm1heFdpZHRoIC8gKHZlbG9jaXR5ICsgMSksIHRoaXMubWluV2lkdGgpO1xuICAgIH1cbiAgICBfZHJhd0N1cnZlU2VnbWVudCh4LCB5LCB3aWR0aCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9jdHg7XG4gICAgICAgIGN0eC5tb3ZlVG8oeCwgeSk7XG4gICAgICAgIGN0eC5hcmMoeCwgeSwgd2lkdGgsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX2lzRW1wdHkgPSBmYWxzZTtcbiAgICB9XG4gICAgX2RyYXdDdXJ2ZShjdXJ2ZSwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9jdHg7XG4gICAgICAgIGNvbnN0IHdpZHRoRGVsdGEgPSBjdXJ2ZS5lbmRXaWR0aCAtIGN1cnZlLnN0YXJ0V2lkdGg7XG4gICAgICAgIGNvbnN0IGRyYXdTdGVwcyA9IE1hdGguY2VpbChjdXJ2ZS5sZW5ndGgoKSkgKiAyO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRpb25zLnBlbkNvbG9yO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRyYXdTdGVwczsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gaSAvIGRyYXdTdGVwcztcbiAgICAgICAgICAgIGNvbnN0IHR0ID0gdCAqIHQ7XG4gICAgICAgICAgICBjb25zdCB0dHQgPSB0dCAqIHQ7XG4gICAgICAgICAgICBjb25zdCB1ID0gMSAtIHQ7XG4gICAgICAgICAgICBjb25zdCB1dSA9IHUgKiB1O1xuICAgICAgICAgICAgY29uc3QgdXV1ID0gdXUgKiB1O1xuICAgICAgICAgICAgbGV0IHggPSB1dXUgKiBjdXJ2ZS5zdGFydFBvaW50Lng7XG4gICAgICAgICAgICB4ICs9IDMgKiB1dSAqIHQgKiBjdXJ2ZS5jb250cm9sMS54O1xuICAgICAgICAgICAgeCArPSAzICogdSAqIHR0ICogY3VydmUuY29udHJvbDIueDtcbiAgICAgICAgICAgIHggKz0gdHR0ICogY3VydmUuZW5kUG9pbnQueDtcbiAgICAgICAgICAgIGxldCB5ID0gdXV1ICogY3VydmUuc3RhcnRQb2ludC55O1xuICAgICAgICAgICAgeSArPSAzICogdXUgKiB0ICogY3VydmUuY29udHJvbDEueTtcbiAgICAgICAgICAgIHkgKz0gMyAqIHUgKiB0dCAqIGN1cnZlLmNvbnRyb2wyLnk7XG4gICAgICAgICAgICB5ICs9IHR0dCAqIGN1cnZlLmVuZFBvaW50Lnk7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKGN1cnZlLnN0YXJ0V2lkdGggKyB0dHQgKiB3aWR0aERlbHRhLCBvcHRpb25zLm1heFdpZHRoKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYXdDdXJ2ZVNlZ21lbnQoeCwgeSwgd2lkdGgpO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICB9XG4gICAgX2RyYXdEb3QocG9pbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fY3R4O1xuICAgICAgICBjb25zdCB3aWR0aCA9IG9wdGlvbnMuZG90U2l6ZSA+IDBcbiAgICAgICAgICAgID8gb3B0aW9ucy5kb3RTaXplXG4gICAgICAgICAgICA6IChvcHRpb25zLm1pbldpZHRoICsgb3B0aW9ucy5tYXhXaWR0aCkgLyAyO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuX2RyYXdDdXJ2ZVNlZ21lbnQocG9pbnQueCwgcG9pbnQueSwgd2lkdGgpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRpb25zLnBlbkNvbG9yO1xuICAgICAgICBjdHguZmlsbCgpO1xuICAgIH1cbiAgICBfZnJvbURhdGEocG9pbnRHcm91cHMsIGRyYXdDdXJ2ZSwgZHJhd0RvdCkge1xuICAgICAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIHBvaW50R3JvdXBzKSB7XG4gICAgICAgICAgICBjb25zdCB7IHBlbkNvbG9yLCBkb3RTaXplLCBtaW5XaWR0aCwgbWF4V2lkdGgsIHBvaW50cyB9ID0gZ3JvdXA7XG4gICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvaW50cy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXNpY1BvaW50ID0gcG9pbnRzW2pdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChiYXNpY1BvaW50LngsIGJhc2ljUG9pbnQueSwgYmFzaWNQb2ludC5wcmVzc3VyZSwgYmFzaWNQb2ludC50aW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZW5Db2xvciA9IHBlbkNvbG9yO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJ2ZSA9IHRoaXMuX2FkZFBvaW50KHBvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3Q3VydmUoY3VydmUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5Db2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgICAgICAgICAgIGRyYXdEb3QocG9pbnRzWzBdLCB7XG4gICAgICAgICAgICAgICAgICAgIHBlbkNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX3RvU1ZHKCkge1xuICAgICAgICBjb25zdCBwb2ludEdyb3VwcyA9IHRoaXMuX2RhdGE7XG4gICAgICAgIGNvbnN0IHJhdGlvID0gTWF0aC5tYXgod2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSwgMSk7XG4gICAgICAgIGNvbnN0IG1pblggPSAwO1xuICAgICAgICBjb25zdCBtaW5ZID0gMDtcbiAgICAgICAgY29uc3QgbWF4WCA9IHRoaXMuY2FudmFzLndpZHRoIC8gcmF0aW87XG4gICAgICAgIGNvbnN0IG1heFkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyByYXRpbztcbiAgICAgICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnKTtcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLmNhbnZhcy53aWR0aC50b1N0cmluZygpKTtcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5jYW52YXMuaGVpZ2h0LnRvU3RyaW5nKCkpO1xuICAgICAgICB0aGlzLl9mcm9tRGF0YShwb2ludEdyb3VwcywgKGN1cnZlLCB7IHBlbkNvbG9yIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwYXRoJyk7XG4gICAgICAgICAgICBpZiAoIWlzTmFOKGN1cnZlLmNvbnRyb2wxLngpICYmXG4gICAgICAgICAgICAgICAgIWlzTmFOKGN1cnZlLmNvbnRyb2wxLnkpICYmXG4gICAgICAgICAgICAgICAgIWlzTmFOKGN1cnZlLmNvbnRyb2wyLngpICYmXG4gICAgICAgICAgICAgICAgIWlzTmFOKGN1cnZlLmNvbnRyb2wyLnkpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0ciA9IGBNICR7Y3VydmUuc3RhcnRQb2ludC54LnRvRml4ZWQoMyl9LCR7Y3VydmUuc3RhcnRQb2ludC55LnRvRml4ZWQoMyl9IGAgK1xuICAgICAgICAgICAgICAgICAgICBgQyAke2N1cnZlLmNvbnRyb2wxLngudG9GaXhlZCgzKX0sJHtjdXJ2ZS5jb250cm9sMS55LnRvRml4ZWQoMyl9IGAgK1xuICAgICAgICAgICAgICAgICAgICBgJHtjdXJ2ZS5jb250cm9sMi54LnRvRml4ZWQoMyl9LCR7Y3VydmUuY29udHJvbDIueS50b0ZpeGVkKDMpfSBgICtcbiAgICAgICAgICAgICAgICAgICAgYCR7Y3VydmUuZW5kUG9pbnQueC50b0ZpeGVkKDMpfSwke2N1cnZlLmVuZFBvaW50LnkudG9GaXhlZCgzKX1gO1xuICAgICAgICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKCdkJywgYXR0cik7XG4gICAgICAgICAgICAgICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsIChjdXJ2ZS5lbmRXaWR0aCAqIDIuMjUpLnRvRml4ZWQoMykpO1xuICAgICAgICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKCdzdHJva2UnLCBwZW5Db2xvcik7XG4gICAgICAgICAgICAgICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCAnbm9uZScpO1xuICAgICAgICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKCdzdHJva2UtbGluZWNhcCcsICdyb3VuZCcpO1xuICAgICAgICAgICAgICAgIHN2Zy5hcHBlbmRDaGlsZChwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKHBvaW50LCB7IHBlbkNvbG9yLCBkb3RTaXplLCBtaW5XaWR0aCwgbWF4V2lkdGggfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2lyY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2lyY2xlJyk7XG4gICAgICAgICAgICBjb25zdCBzaXplID0gZG90U2l6ZSA+IDAgPyBkb3RTaXplIDogKG1pbldpZHRoICsgbWF4V2lkdGgpIC8gMjtcbiAgICAgICAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ3InLCBzaXplLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSgnY3gnLCBwb2ludC54LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSgnY3knLCBwb2ludC55LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSgnZmlsbCcsIHBlbkNvbG9yKTtcbiAgICAgICAgICAgIHN2Zy5hcHBlbmRDaGlsZChjaXJjbGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJztcbiAgICAgICAgY29uc3QgaGVhZGVyID0gJzxzdmcnICtcbiAgICAgICAgICAgICcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiJyArXG4gICAgICAgICAgICAnIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiJyArXG4gICAgICAgICAgICBgIHZpZXdCb3g9XCIke21pblh9ICR7bWluWX0gJHt0aGlzLmNhbnZhcy53aWR0aH0gJHt0aGlzLmNhbnZhcy5oZWlnaHR9XCJgICtcbiAgICAgICAgICAgIGAgd2lkdGg9XCIke21heFh9XCJgICtcbiAgICAgICAgICAgIGAgaGVpZ2h0PVwiJHttYXhZfVwiYCArXG4gICAgICAgICAgICAnPic7XG4gICAgICAgIGxldCBib2R5ID0gc3ZnLmlubmVySFRNTDtcbiAgICAgICAgaWYgKGJvZHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkdW1teScpO1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBzdmcuY2hpbGROb2RlcztcbiAgICAgICAgICAgIGR1bW15LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGR1bW15LmFwcGVuZENoaWxkKG5vZGVzW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib2R5ID0gZHVtbXkuaW5uZXJIVE1MO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvb3RlciA9ICc8L3N2Zz4nO1xuICAgICAgICBjb25zdCBkYXRhID0gaGVhZGVyICsgYm9keSArIGZvb3RlcjtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArIGJ0b2EoZGF0YSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBTaWduYXR1cmVQYWQgYXMgZGVmYXVsdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2lnbmF0dXJlX3BhZC5qcy5tYXBcbiIsIi8qIVxuXHRDb3B5cmlnaHQgKGMpIDIwMTggSmVkIFdhdHNvbi5cblx0TGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCBzZWVcblx0aHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuKi9cbi8qIGdsb2JhbCBkZWZpbmUgKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBoYXNPd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuXHRmdW5jdGlvbiBjbGFzc05hbWVzICgpIHtcblx0XHR2YXIgY2xhc3NlcyA9ICcnO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cdFx0XHRpZiAoYXJnKSB7XG5cdFx0XHRcdGNsYXNzZXMgPSBhcHBlbmRDbGFzcyhjbGFzc2VzLCBwYXJzZVZhbHVlKGFyZykpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjbGFzc2VzO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGFyc2VWYWx1ZSAoYXJnKSB7XG5cdFx0aWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG5cdFx0XHRyZXR1cm4gYXJnO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgYXJnICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdHJldHVybiBjbGFzc05hbWVzLmFwcGx5KG51bGwsIGFyZyk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZy50b1N0cmluZyAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyAmJiAhYXJnLnRvU3RyaW5nLnRvU3RyaW5nKCkuaW5jbHVkZXMoJ1tuYXRpdmUgY29kZV0nKSkge1xuXHRcdFx0cmV0dXJuIGFyZy50b1N0cmluZygpO1xuXHRcdH1cblxuXHRcdHZhciBjbGFzc2VzID0gJyc7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gYXJnKSB7XG5cdFx0XHRpZiAoaGFzT3duLmNhbGwoYXJnLCBrZXkpICYmIGFyZ1trZXldKSB7XG5cdFx0XHRcdGNsYXNzZXMgPSBhcHBlbmRDbGFzcyhjbGFzc2VzLCBrZXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjbGFzc2VzO1xuXHR9XG5cblx0ZnVuY3Rpb24gYXBwZW5kQ2xhc3MgKHZhbHVlLCBuZXdDbGFzcykge1xuXHRcdGlmICghbmV3Q2xhc3MpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdFxuXHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlICsgJyAnICsgbmV3Q2xhc3M7XG5cdFx0fVxuXHRcblx0XHRyZXR1cm4gdmFsdWUgKyBuZXdDbGFzcztcblx0fVxuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdGNsYXNzTmFtZXMuZGVmYXVsdCA9IGNsYXNzTmFtZXM7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzc05hbWVzO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyByZWdpc3RlciBhcyAnY2xhc3NuYW1lcycsIGNvbnNpc3RlbnQgd2l0aCBucG0gcGFja2FnZSBuYW1lXG5cdFx0ZGVmaW5lKCdjbGFzc25hbWVzJywgW10sIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBjbGFzc05hbWVzO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5jbGFzc05hbWVzID0gY2xhc3NOYW1lcztcblx0fVxufSgpKTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbm93O1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggYSBzaW5nbGUgd2hpdGVzcGFjZSBjaGFyYWN0ZXIuICovXG52YXIgcmVXaGl0ZXNwYWNlID0gL1xccy87XG5cbi8qKlxuICogVXNlZCBieSBgXy50cmltYCBhbmQgYF8udHJpbUVuZGAgdG8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgbGFzdCBub24td2hpdGVzcGFjZVxuICogY2hhcmFjdGVyIG9mIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IG5vbi13aGl0ZXNwYWNlIGNoYXJhY3Rlci5cbiAqL1xuZnVuY3Rpb24gdHJpbW1lZEVuZEluZGV4KHN0cmluZykge1xuICB2YXIgaW5kZXggPSBzdHJpbmcubGVuZ3RoO1xuXG4gIHdoaWxlIChpbmRleC0tICYmIHJlV2hpdGVzcGFjZS50ZXN0KHN0cmluZy5jaGFyQXQoaW5kZXgpKSkge31cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRyaW1tZWRFbmRJbmRleDtcbiIsInZhciB0cmltbWVkRW5kSW5kZXggPSByZXF1aXJlKCcuL190cmltbWVkRW5kSW5kZXgnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbVN0YXJ0ID0gL15cXHMrLztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50cmltYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIHRyaW0uXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSB0cmltbWVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRyaW0oc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmdcbiAgICA/IHN0cmluZy5zbGljZSgwLCB0cmltbWVkRW5kSW5kZXgoc3RyaW5nKSArIDEpLnJlcGxhY2UocmVUcmltU3RhcnQsICcnKVxuICAgIDogc3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUcmltO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1N5bWJvbDtcbiIsInZhciBiYXNlVHJpbSA9IHJlcXVpcmUoJy4vX2Jhc2VUcmltJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNTeW1ib2wgPSByZXF1aXJlKCcuL2lzU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSBiYXNlVHJpbSh2YWx1ZSk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvTnVtYmVyO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIG5vdyA9IHJlcXVpcmUoJy4vbm93JyksXG4gICAgdG9OdW1iZXIgPSByZXF1aXJlKCcuL3RvTnVtYmVyJyk7XG5cbi8qKiBFcnJvciBtZXNzYWdlIGNvbnN0YW50cy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICB0aW1lV2FpdGluZyA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmdcbiAgICAgID8gbmF0aXZlTWluKHRpbWVXYWl0aW5nLCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSlcbiAgICAgIDogdGltZVdhaXRpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYm91bmNlO1xuIiwidmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9kZWJvdW5jZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogRXJyb3IgbWVzc2FnZSBjb25zdGFudHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXJcbiAqIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgXG4gKiBtZXRob2QgdG8gY2FuY2VsIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvXG4gKiBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2BcbiAqIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGBcbiAqIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGVcbiAqIHRocm90dGxlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHJldHVybiB0aGVcbiAqIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy50aHJvdHRsZWAgYW5kIGBfLmRlYm91bmNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGludm9jYXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZy5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlcy5cbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwgeyAndHJhaWxpbmcnOiBmYWxzZSB9KTtcbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgdGhyb3R0bGVkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCB0aHJvdHRsZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIHtcbiAgICAnbGVhZGluZyc6IGxlYWRpbmcsXG4gICAgJ21heFdhaXQnOiB3YWl0LFxuICAgICd0cmFpbGluZyc6IHRyYWlsaW5nXG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwiaW1wb3J0IFJlYWN0LHtpc1ZhbGlkRWxlbWVudCxjcmVhdGVSZWYsY2xvbmVFbGVtZW50LFB1cmVDb21wb25lbnQsQ29tcG9uZW50LGZvcndhcmRSZWYsdXNlUmVmLHVzZVN0YXRlLHVzZUNhbGxiYWNrLHVzZUVmZmVjdH1mcm9tJ3JlYWN0JztpbXBvcnQge2ZpbmRET01Ob2RlfWZyb20ncmVhY3QtZG9tJztpbXBvcnQgZGVib3VuY2UgZnJvbSdsb2Rhc2gvZGVib3VuY2UnO2ltcG9ydCB0aHJvdHRsZSBmcm9tJ2xvZGFzaC90aHJvdHRsZSc7LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxudmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxudHlwZW9mIFN1cHByZXNzZWRFcnJvciA9PT0gXCJmdW5jdGlvblwiID8gU3VwcHJlc3NlZEVycm9yIDogZnVuY3Rpb24gKGVycm9yLCBzdXBwcmVzc2VkLCBtZXNzYWdlKSB7XHJcbiAgICB2YXIgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgIHJldHVybiBlLm5hbWUgPSBcIlN1cHByZXNzZWRFcnJvclwiLCBlLmVycm9yID0gZXJyb3IsIGUuc3VwcHJlc3NlZCA9IHN1cHByZXNzZWQsIGU7XHJcbn07dmFyIHBhdGNoUmVzaXplQ2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzaXplQ2FsbGJhY2ssIHJlZnJlc2hNb2RlLCByZWZyZXNoUmF0ZSwgcmVmcmVzaE9wdGlvbnMpIHtcbiAgICBzd2l0Y2ggKHJlZnJlc2hNb2RlKSB7XG4gICAgICAgIGNhc2UgJ2RlYm91bmNlJzpcbiAgICAgICAgICAgIHJldHVybiBkZWJvdW5jZShyZXNpemVDYWxsYmFjaywgcmVmcmVzaFJhdGUsIHJlZnJlc2hPcHRpb25zKTtcbiAgICAgICAgY2FzZSAndGhyb3R0bGUnOlxuICAgICAgICAgICAgcmV0dXJuIHRocm90dGxlKHJlc2l6ZUNhbGxiYWNrLCByZWZyZXNoUmF0ZSwgcmVmcmVzaE9wdGlvbnMpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHJlc2l6ZUNhbGxiYWNrO1xuICAgIH1cbn07XG52YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChmbikgeyByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nOyB9O1xudmFyIGlzU1NSID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCc7IH07XG52YXIgaXNET01FbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudCBpbnN0YW5jZW9mIEVsZW1lbnQgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxEb2N1bWVudDtcbn07dmFyIFJlc2l6ZURldGVjdG9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhSZXNpemVEZXRlY3RvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBSZXNpemVEZXRlY3Rvcihwcm9wcykge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBwcm9wcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuY2FuY2VsSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5yZXNpemVIYW5kbGVyICYmIF90aGlzLnJlc2l6ZUhhbmRsZXIuY2FuY2VsKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FuY2VsIGRlYm91bmNlZCBoYW5kbGVyXG4gICAgICAgICAgICAgICAgX3RoaXMucmVzaXplSGFuZGxlci5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5yZXNpemVIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuYXR0YWNoT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSBfdGhpcy5wcm9wcywgdGFyZ2V0UmVmID0gX2EudGFyZ2V0UmVmLCBvYnNlcnZlck9wdGlvbnMgPSBfYS5vYnNlcnZlck9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoaXNTU1IoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXJnZXRSZWYgJiYgdGFyZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50YXJnZXRSZWYuY3VycmVudCA9IHRhcmdldFJlZi5jdXJyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBfdGhpcy5nZXRFbGVtZW50KCk7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBjYW4ndCBmaW5kIGVsZW1lbnQgdG8gb2JzZXJ2ZVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfdGhpcy5vYnNlcnZhYmxlRWxlbWVudCAmJiBfdGhpcy5vYnNlcnZhYmxlRWxlbWVudCA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIC8vIGVsZW1lbnQgaXMgYWxyZWFkeSBvYnNlcnZlZFxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLm9ic2VydmFibGVFbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgICAgIF90aGlzLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZWxlbWVudCwgb2JzZXJ2ZXJPcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IF90aGlzLnByb3BzLCBxdWVyeVNlbGVjdG9yID0gX2EucXVlcnlTZWxlY3RvciwgdGFyZ2V0RG9tRWwgPSBfYS50YXJnZXREb21FbDtcbiAgICAgICAgICAgIGlmIChpc1NTUigpKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgLy8gaW4gY2FzZSB3ZSBwYXNzIGEgcXVlcnlTZWxlY3RvclxuICAgICAgICAgICAgaWYgKHF1ZXJ5U2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnlTZWxlY3Rvcik7XG4gICAgICAgICAgICAvLyBpbiBjYXNlIHdlIHBhc3MgYSBET00gZWxlbWVudFxuICAgICAgICAgICAgaWYgKHRhcmdldERvbUVsICYmIGlzRE9NRWxlbWVudCh0YXJnZXREb21FbCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldERvbUVsO1xuICAgICAgICAgICAgLy8gaW4gY2FzZSB3ZSBwYXNzIGEgUmVhY3QgcmVmIHVzaW5nIFJlYWN0LmNyZWF0ZVJlZigpXG4gICAgICAgICAgICBpZiAoX3RoaXMudGFyZ2V0UmVmICYmIGlzRE9NRWxlbWVudChfdGhpcy50YXJnZXRSZWYuY3VycmVudCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnRhcmdldFJlZi5jdXJyZW50O1xuICAgICAgICAgICAgLy8gdGhlIHdvcnNlIGNhc2Ugd2hlbiB3ZSBkb24ndCByZWNlaXZlIGFueSBpbmZvcm1hdGlvbiBmcm9tIHRoZSBwYXJlbnQgYW5kIHRoZSBsaWJyYXJ5IGRvZXNuJ3QgYWRkIGFueSB3cmFwcGVyc1xuICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byB1c2UgYSBkZXByZWNhdGVkIGBmaW5kRE9NTm9kZWAgbWV0aG9kIGluIG9yZGVyIHRvIGZpbmQgYSBET00gZWxlbWVudCB0byBhdHRhY2ggdG9cbiAgICAgICAgICAgIHZhciBjdXJyZW50RWxlbWVudCA9IGZpbmRET01Ob2RlKF90aGlzKTtcbiAgICAgICAgICAgIGlmICghY3VycmVudEVsZW1lbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB2YXIgcmVuZGVyVHlwZSA9IF90aGlzLmdldFJlbmRlclR5cGUoKTtcbiAgICAgICAgICAgIHN3aXRjaCAocmVuZGVyVHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlbmRlclByb3AnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2hpbGRGdW5jdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICBjYXNlICdjaGlsZCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICBjYXNlICdjaGlsZEFycmF5JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5jcmVhdGVSZXNpemVIYW5kbGVyID0gZnVuY3Rpb24gKGVudHJpZXMpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IF90aGlzLnByb3BzLCBfYiA9IF9hLmhhbmRsZVdpZHRoLCBoYW5kbGVXaWR0aCA9IF9iID09PSB2b2lkIDAgPyB0cnVlIDogX2IsIF9jID0gX2EuaGFuZGxlSGVpZ2h0LCBoYW5kbGVIZWlnaHQgPSBfYyA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9jLCBvblJlc2l6ZSA9IF9hLm9uUmVzaXplO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVXaWR0aCAmJiAhaGFuZGxlSGVpZ2h0KVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZhciBub3RpZnlSZXNpemUgPSBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSBfYS53aWR0aCwgaGVpZ2h0ID0gX2EuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5zdGF0ZS53aWR0aCA9PT0gd2lkdGggJiYgX3RoaXMuc3RhdGUuaGVpZ2h0ID09PSBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2tpcCBpZiBkaW1lbnNpb25zIGhhdmVuJ3QgY2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgoX3RoaXMuc3RhdGUud2lkdGggPT09IHdpZHRoICYmICFoYW5kbGVIZWlnaHQpIHx8IChfdGhpcy5zdGF0ZS5oZWlnaHQgPT09IGhlaWdodCAmJiAhaGFuZGxlV2lkdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHByb2Nlc3MgYGhhbmRsZUhlaWdodC9oYW5kbGVXaWR0aGAgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvblJlc2l6ZSA9PT0gbnVsbCB8fCBvblJlc2l6ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25SZXNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2EgPSAoZW50cnkgJiYgZW50cnkuY29udGVudFJlY3QpIHx8IHt9LCB3aWR0aCA9IF9hLndpZHRoLCBoZWlnaHQgPSBfYS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIHNob3VsZFNldFNpemUgPSAhX3RoaXMuc2tpcE9uTW91bnQgJiYgIWlzU1NSKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZFNldFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZ5UmVzaXplKHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3RoaXMuc2tpcE9uTW91bnQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5nZXRSZW5kZXJUeXBlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hID0gX3RoaXMucHJvcHMsIHJlbmRlciA9IF9hLnJlbmRlciwgY2hpbGRyZW4gPSBfYS5jaGlsZHJlbjtcbiAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHJlbmRlcikpIHtcbiAgICAgICAgICAgICAgICAvLyBERVBSRUNBVEVELiBVc2UgYENoaWxkIEZ1bmN0aW9uIFBhdHRlcm5gIGluc3RlYWRcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3JlbmRlclByb3AnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdjaGlsZEZ1bmN0aW9uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1ZhbGlkRWxlbWVudChjaGlsZHJlbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2NoaWxkJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIC8vIERFUFJFQ0FURUQuIFdyYXAgY2hpbGRyZW4gd2l0aCBhIHNpbmdsZSBwYXJlbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2NoaWxkQXJyYXknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gREVQUkVDQVRFRC4gVXNlIGBDaGlsZCBGdW5jdGlvbiBQYXR0ZXJuYCBpbnN0ZWFkXG4gICAgICAgICAgICByZXR1cm4gJ3BhcmVudCc7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBza2lwT25Nb3VudCA9IHByb3BzLnNraXBPbk1vdW50LCByZWZyZXNoTW9kZSA9IHByb3BzLnJlZnJlc2hNb2RlLCBfYSA9IHByb3BzLnJlZnJlc2hSYXRlLCByZWZyZXNoUmF0ZSA9IF9hID09PSB2b2lkIDAgPyAxMDAwIDogX2EsIHJlZnJlc2hPcHRpb25zID0gcHJvcHMucmVmcmVzaE9wdGlvbnM7XG4gICAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgd2lkdGg6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGhlaWdodDogdW5kZWZpbmVkXG4gICAgICAgIH07XG4gICAgICAgIF90aGlzLnNpemVSZWYgPSB7XG4gICAgICAgICAgICBjdXJyZW50OiBfdGhpcy5zdGF0ZVxuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5za2lwT25Nb3VudCA9IHNraXBPbk1vdW50O1xuICAgICAgICBfdGhpcy50YXJnZXRSZWYgPSBjcmVhdGVSZWYoKTtcbiAgICAgICAgX3RoaXMub2JzZXJ2YWJsZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAoaXNTU1IoKSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLnJlc2l6ZUhhbmRsZXIgPSBwYXRjaFJlc2l6ZUNhbGxiYWNrKF90aGlzLmNyZWF0ZVJlc2l6ZUhhbmRsZXIsIHJlZnJlc2hNb2RlLCByZWZyZXNoUmF0ZSwgcmVmcmVzaE9wdGlvbnMpO1xuICAgICAgICBfdGhpcy5yZXNpemVPYnNlcnZlciA9IG5ldyB3aW5kb3cuUmVzaXplT2JzZXJ2ZXIoX3RoaXMucmVzaXplSGFuZGxlcik7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgUmVzaXplRGV0ZWN0b3IucHJvdG90eXBlLmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmF0dGFjaE9ic2VydmVyKCk7XG4gICAgfTtcbiAgICBSZXNpemVEZXRlY3Rvci5wcm90b3R5cGUuY29tcG9uZW50RGlkVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmF0dGFjaE9ic2VydmVyKCk7XG4gICAgICAgIHRoaXMuc2l6ZVJlZi5jdXJyZW50ID0gdGhpcy5zdGF0ZTtcbiAgICB9O1xuICAgIFJlc2l6ZURldGVjdG9yLnByb3RvdHlwZS5jb21wb25lbnRXaWxsVW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGlzU1NSKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9ic2VydmFibGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMuY2FuY2VsSGFuZGxlcigpO1xuICAgIH07XG4gICAgUmVzaXplRGV0ZWN0b3IucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hID0gdGhpcy5wcm9wcywgcmVuZGVyID0gX2EucmVuZGVyLCBjaGlsZHJlbiA9IF9hLmNoaWxkcmVuLCBfYiA9IF9hLm5vZGVUeXBlLCBXcmFwcGVyVGFnID0gX2IgPT09IHZvaWQgMCA/ICdkaXYnIDogX2I7XG4gICAgICAgIHZhciBfYyA9IHRoaXMuc3RhdGUsIHdpZHRoID0gX2Mud2lkdGgsIGhlaWdodCA9IF9jLmhlaWdodDtcbiAgICAgICAgdmFyIGNoaWxkUHJvcHMgPSB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQsIHRhcmdldFJlZjogdGhpcy50YXJnZXRSZWYgfTtcbiAgICAgICAgdmFyIHJlbmRlclR5cGUgPSB0aGlzLmdldFJlbmRlclR5cGUoKTtcbiAgICAgICAgc3dpdGNoIChyZW5kZXJUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdyZW5kZXJQcm9wJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVuZGVyID09PSBudWxsIHx8IHJlbmRlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmVuZGVyKGNoaWxkUHJvcHMpO1xuICAgICAgICAgICAgY2FzZSAnY2hpbGRGdW5jdGlvbic6IHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRGdW5jdGlvbiA9IGNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZEZ1bmN0aW9uID09PSBudWxsIHx8IGNoaWxkRnVuY3Rpb24gPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNoaWxkRnVuY3Rpb24oY2hpbGRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdjaGlsZCc6IHtcbiAgICAgICAgICAgICAgICAvLyBAVE9ETyBidWcgcHJvbmUgbG9naWNcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbjtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSAmJiB0eXBlb2YgY2hpbGQudHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hpbGQgaXMgYSBuYXRpdmUgRE9NIGVsZW1lbnRzIHN1Y2ggYXMgZGl2LCBzcGFuIGV0Y1xuICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvcHMudGFyZ2V0UmVmOyB2YXIgbmF0aXZlUHJvcHMgPSBfX3Jlc3QoY2hpbGRQcm9wcywgW1widGFyZ2V0UmVmXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lRWxlbWVudChjaGlsZCwgbmF0aXZlUHJvcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjbGFzcyBvciBmdW5jdGlvbmFsIGNvbXBvbmVudCBvdGhlcndpc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xvbmVFbGVtZW50KGNoaWxkLCBjaGlsZFByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2NoaWxkQXJyYXknOiB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkQXJyYXkgPSBjaGlsZHJlbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRBcnJheS5tYXAoZnVuY3Rpb24gKGVsKSB7IHJldHVybiAhIWVsICYmIGNsb25lRWxlbWVudChlbCwgY2hpbGRQcm9wcyk7IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChXcmFwcGVyVGFnLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIFJlc2l6ZURldGVjdG9yO1xufShQdXJlQ29tcG9uZW50KSk7ZnVuY3Rpb24gd2l0aFJlc2l6ZURldGVjdG9yKENvbXBvbmVudElubmVyLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICB2YXIgUmVzaXplRGV0ZWN0b3JIT0MgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhSZXNpemVEZXRlY3RvckhPQywgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gUmVzaXplRGV0ZWN0b3JIT0MoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLnJlZiA9IGNyZWF0ZVJlZigpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIFJlc2l6ZURldGVjdG9ySE9DLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSB0aGlzLnByb3BzLCBmb3J3YXJkZWRSZWYgPSBfYS5mb3J3YXJkZWRSZWYsIHJlc3QgPSBfX3Jlc3QoX2EsIFtcImZvcndhcmRlZFJlZlwiXSk7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0UmVmID0gZm9yd2FyZGVkUmVmICE9PSBudWxsICYmIGZvcndhcmRlZFJlZiAhPT0gdm9pZCAwID8gZm9yd2FyZGVkUmVmIDogdGhpcy5yZWY7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVzaXplRGV0ZWN0b3IsIF9fYXNzaWduKHt9LCBvcHRpb25zLCB7IHRhcmdldFJlZjogdGFyZ2V0UmVmIH0pLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50SW5uZXIsIF9fYXNzaWduKHsgdGFyZ2V0UmVmOiB0YXJnZXRSZWYgfSwgcmVzdCkpKSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBSZXNpemVEZXRlY3RvckhPQztcbiAgICB9KENvbXBvbmVudCkpO1xuICAgIGZ1bmN0aW9uIGZvcndhcmRSZWZXcmFwcGVyKHByb3BzLCByZWYpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVzaXplRGV0ZWN0b3JIT0MsIF9fYXNzaWduKHt9LCBwcm9wcywgeyBmb3J3YXJkZWRSZWY6IHJlZiB9KSk7XG4gICAgfVxuICAgIHZhciBuYW1lID0gQ29tcG9uZW50SW5uZXIuZGlzcGxheU5hbWUgfHwgQ29tcG9uZW50SW5uZXIubmFtZTtcbiAgICBmb3J3YXJkUmVmV3JhcHBlci5kaXNwbGF5TmFtZSA9IFwid2l0aFJlc2l6ZURldGVjdG9yKFwiLmNvbmNhdChuYW1lLCBcIilcIik7XG4gICAgcmV0dXJuIGZvcndhcmRSZWYoZm9yd2FyZFJlZldyYXBwZXIpO1xufWZ1bmN0aW9uIHVzZVJlc2l6ZURldGVjdG9yKF9hKSB7XG4gICAgdmFyIF9iID0gX2EgPT09IHZvaWQgMCA/IHt9IDogX2EsIF9jID0gX2Iuc2tpcE9uTW91bnQsIHNraXBPbk1vdW50ID0gX2MgPT09IHZvaWQgMCA/IGZhbHNlIDogX2MsIHJlZnJlc2hNb2RlID0gX2IucmVmcmVzaE1vZGUsIF9kID0gX2IucmVmcmVzaFJhdGUsIHJlZnJlc2hSYXRlID0gX2QgPT09IHZvaWQgMCA/IDEwMDAgOiBfZCwgcmVmcmVzaE9wdGlvbnMgPSBfYi5yZWZyZXNoT3B0aW9ucywgX2UgPSBfYi5oYW5kbGVXaWR0aCwgaGFuZGxlV2lkdGggPSBfZSA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9lLCBfZiA9IF9iLmhhbmRsZUhlaWdodCwgaGFuZGxlSGVpZ2h0ID0gX2YgPT09IHZvaWQgMCA/IHRydWUgOiBfZiwgdGFyZ2V0UmVmID0gX2IudGFyZ2V0UmVmLCBvYnNlcnZlck9wdGlvbnMgPSBfYi5vYnNlcnZlck9wdGlvbnMsIG9uUmVzaXplID0gX2Iub25SZXNpemU7XG4gICAgdmFyIHNraXBSZXNpemUgPSB1c2VSZWYoc2tpcE9uTW91bnQpO1xuICAgIHZhciBfZyA9IHVzZVN0YXRlKHtcbiAgICAgICAgd2lkdGg6IHVuZGVmaW5lZCxcbiAgICAgICAgaGVpZ2h0OiB1bmRlZmluZWRcbiAgICB9KSwgc2l6ZSA9IF9nWzBdLCBzZXRTaXplID0gX2dbMV07XG4gICAgLy8gd2UgYXJlIGdvaW5nIHRvIHVzZSB0aGlzIHJlZiB0byBzdG9yZSB0aGUgbGFzdCBlbGVtZW50IHRoYXQgd2FzIHBhc3NlZCB0byB0aGUgaG9va1xuICAgIHZhciBfaCA9IHVzZVN0YXRlKCh0YXJnZXRSZWYgPT09IG51bGwgfHwgdGFyZ2V0UmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiB0YXJnZXRSZWYuY3VycmVudCkgfHwgbnVsbCksIHJlZkVsZW1lbnQgPSBfaFswXSwgc2V0UmVmRWxlbWVudCA9IF9oWzFdO1xuICAgIC8vIGlmIHRhcmdldFJlZiBpcyBwYXNzZWQsIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSByZWZFbGVtZW50XG4gICAgLy8gd2UgaGF2ZSB0byB1c2Ugc2V0VGltZW91dCBiZWNhdXNlIHJlZiBnZXQgYXNzaWduZWQgYWZ0ZXIgdGhlIGhvb2sgaXMgY2FsbGVkXG4gICAgLy8gaW4gdGhlIGZ1dHVyZSByZWxlYXNlcyB3ZSBhcmUgZ29pbmcgdG8gcmVtb3ZlIHRhcmdldFJlZiBhbmQgZm9yY2UgdXNlcnMgdG8gdXNlIHJlZiByZXR1cm5lZCBieSB0aGUgaG9va1xuICAgIGlmICh0YXJnZXRSZWYpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0UmVmLmN1cnJlbnQgIT09IHJlZkVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRSZWZFbGVtZW50KHRhcmdldFJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMCk7XG4gICAgfVxuICAgIC8vIHRoaXMgaXMgYSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIGV2ZXJ5IHRpbWUgdGhlIHJlZiBpcyBjaGFuZ2VkXG4gICAgLy8gd2UgY2FsbCBzZXRTdGF0ZSBpbnNpZGUgdG8gdHJpZ2dlciByZXJlbmRlclxuICAgIHZhciBvblJlZkNoYW5nZSA9IHVzZUNhbGxiYWNrKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlICE9PSByZWZFbGVtZW50KSB7XG4gICAgICAgICAgICBzZXRSZWZFbGVtZW50KG5vZGUpO1xuICAgICAgICB9XG4gICAgfSwgW3JlZkVsZW1lbnRdKTtcbiAgICAvLyBhZGRpbmcgYGN1cnJlbnRgIHRvIG1ha2UgaXQgY29tcGF0aWJsZSB3aXRoIHVzZVJlZiBzaGFwZVxuICAgIG9uUmVmQ2hhbmdlLmN1cnJlbnQgPSByZWZFbGVtZW50O1xuICAgIHZhciBzaG91bGRTZXRTaXplID0gdXNlQ2FsbGJhY2soZnVuY3Rpb24gKHByZXZTaXplLCBuZXh0U2l6ZSkge1xuICAgICAgICBpZiAocHJldlNpemUud2lkdGggPT09IG5leHRTaXplLndpZHRoICYmIHByZXZTaXplLmhlaWdodCA9PT0gbmV4dFNpemUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAvLyBza2lwIGlmIGRpbWVuc2lvbnMgaGF2ZW4ndCBjaGFuZ2VkXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChwcmV2U2l6ZS53aWR0aCA9PT0gbmV4dFNpemUud2lkdGggJiYgIWhhbmRsZUhlaWdodCkgfHxcbiAgICAgICAgICAgIChwcmV2U2l6ZS5oZWlnaHQgPT09IG5leHRTaXplLmhlaWdodCAmJiAhaGFuZGxlV2lkdGgpKSB7XG4gICAgICAgICAgICAvLyBwcm9jZXNzIGBoYW5kbGVIZWlnaHQvaGFuZGxlV2lkdGhgIHByb3BzXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgW2hhbmRsZVdpZHRoLCBoYW5kbGVIZWlnaHRdKTtcbiAgICB2YXIgcmVzaXplQ2FsbGJhY2sgPSB1c2VDYWxsYmFjayhmdW5jdGlvbiAoZW50cmllcykge1xuICAgICAgICBpZiAoIWhhbmRsZVdpZHRoICYmICFoYW5kbGVIZWlnaHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChza2lwUmVzaXplLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHNraXBSZXNpemUuY3VycmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVudHJpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IChlbnRyeSA9PT0gbnVsbCB8fCBlbnRyeSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZW50cnkuY29udGVudFJlY3QpIHx8IHt9LCB3aWR0aCA9IF9hLndpZHRoLCBoZWlnaHQgPSBfYS5oZWlnaHQ7XG4gICAgICAgICAgICBzZXRTaXplKGZ1bmN0aW9uIChwcmV2U2l6ZSkge1xuICAgICAgICAgICAgICAgIGlmICghc2hvdWxkU2V0U2l6ZShwcmV2U2l6ZSwgeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH0pKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldlNpemU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sIFtoYW5kbGVXaWR0aCwgaGFuZGxlSGVpZ2h0LCBza2lwUmVzaXplLCBzaG91bGRTZXRTaXplXSk7XG4gICAgdmFyIHJlc2l6ZUhhbmRsZXIgPSB1c2VDYWxsYmFjayhwYXRjaFJlc2l6ZUNhbGxiYWNrKHJlc2l6ZUNhbGxiYWNrLCByZWZyZXNoTW9kZSwgcmVmcmVzaFJhdGUsIHJlZnJlc2hPcHRpb25zKSwgW1xuICAgICAgICByZXNpemVDYWxsYmFjayxcbiAgICAgICAgcmVmcmVzaE1vZGUsXG4gICAgICAgIHJlZnJlc2hSYXRlLFxuICAgICAgICByZWZyZXNoT3B0aW9uc1xuICAgIF0pO1xuICAgIC8vIG9uIHJlZkVsZW1lbnQgY2hhbmdlXG4gICAgdXNlRWZmZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlc2l6ZU9ic2VydmVyO1xuICAgICAgICBpZiAocmVmRWxlbWVudCkge1xuICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgd2luZG93LlJlc2l6ZU9ic2VydmVyKHJlc2l6ZUhhbmRsZXIpO1xuICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShyZWZFbGVtZW50LCBvYnNlcnZlck9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNpemUud2lkdGggfHwgc2l6ZS5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZXRTaXplKHsgd2lkdGg6IHVuZGVmaW5lZCwgaGVpZ2h0OiB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfYSwgX2IsIF9jO1xuICAgICAgICAgICAgKF9hID0gcmVzaXplT2JzZXJ2ZXIgPT09IG51bGwgfHwgcmVzaXplT2JzZXJ2ZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5jYWxsKHJlc2l6ZU9ic2VydmVyKTtcbiAgICAgICAgICAgIChfYyA9IChfYiA9IHJlc2l6ZUhhbmRsZXIpLmNhbmNlbCkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmNhbGwoX2IpO1xuICAgICAgICB9O1xuICAgIH0sIFtyZXNpemVIYW5kbGVyLCByZWZFbGVtZW50XSk7XG4gICAgdXNlRWZmZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb25SZXNpemUgPT09IG51bGwgfHwgb25SZXNpemUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9uUmVzaXplKHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICB9LCBbc2l6ZV0pO1xuICAgIHJldHVybiBfX2Fzc2lnbih7IHJlZjogb25SZWZDaGFuZ2UgfSwgc2l6ZSk7XG59ZXhwb3J0e1Jlc2l6ZURldGVjdG9yIGFzIGRlZmF1bHQsdXNlUmVzaXplRGV0ZWN0b3Isd2l0aFJlc2l6ZURldGVjdG9yfTsvLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5lc20uanMubWFwXG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBGQywgUHJvcHNXaXRoQ2hpbGRyZW4gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxlcnRQcm9wcyBleHRlbmRzIFByb3BzV2l0aENoaWxkcmVuIHtcbiAgICBib290c3RyYXBTdHlsZT86IFwiZGVmYXVsdFwiIHwgXCJwcmltYXJ5XCIgfCBcInN1Y2Nlc3NcIiB8IFwiaW5mb1wiIHwgXCJ3YXJuaW5nXCIgfCBcImRhbmdlclwiO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IEFsZXJ0OiBGQzxBbGVydFByb3BzPiA9ICh7IGJvb3RzdHJhcFN0eWxlID0gXCJkYW5nZXJcIiwgY2xhc3NOYW1lLCBjaGlsZHJlbiB9KSA9PlxuICAgIGNoaWxkcmVuID8gPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoYGFsZXJ0IGFsZXJ0LSR7Ym9vdHN0cmFwU3R5bGV9YCwgY2xhc3NOYW1lKX0+e2NoaWxkcmVufTwvZGl2PiA6IG51bGw7XG5cbkFsZXJ0LmRpc3BsYXlOYW1lID0gXCJBbGVydFwiO1xuIiwiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCwgRkMgfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGludGVyZmFjZSBHcmlkQmFja2dyb3VuZFByb3BzIHtcbiAgICBncmlkQ2VsbFdpZHRoOiBudW1iZXI7XG4gICAgZ3JpZENlbGxIZWlnaHQ6IG51bWJlcjtcbiAgICBncmlkQm9yZGVyQ29sb3I6IHN0cmluZztcbiAgICBncmlkQm9yZGVyV2lkdGg6IG51bWJlcjtcbiAgICBzaG93R3JpZD86IGJvb2xlYW47XG59XG5leHBvcnQgY29uc3QgR3JpZDogRkM8R3JpZEJhY2tncm91bmRQcm9wcz4gPSAoe1xuICAgIGdyaWRDZWxsV2lkdGgsXG4gICAgZ3JpZENlbGxIZWlnaHQsXG4gICAgZ3JpZEJvcmRlckNvbG9yLFxuICAgIGdyaWRCb3JkZXJXaWR0aCxcbiAgICBzaG93R3JpZCA9IHRydWVcbn0pID0+IHtcbiAgICBjb25zdCBpZCA9IGBncmlkJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKX1gO1xuICAgIHJldHVybiBzaG93R3JpZCA/IChcbiAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLWdyaWRcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICAgICAgICAgICAgPGRlZnM+XG4gICAgICAgICAgICAgICAgPHBhdHRlcm4gaWQ9e2lkfSB3aWR0aD17Z3JpZENlbGxXaWR0aH0gaGVpZ2h0PXtncmlkQ2VsbEhlaWdodH0gcGF0dGVyblVuaXRzPVwidXNlclNwYWNlT25Vc2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHgxPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB5MT17Z3JpZENlbGxIZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgICAgICB4Mj17Z3JpZENlbGxXaWR0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHkyPXtncmlkQ2VsbEhlaWdodH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZT17Z3JpZEJvcmRlckNvbG9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9e2dyaWRCb3JkZXJXaWR0aH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHgxPXtncmlkQ2VsbFdpZHRofVxuICAgICAgICAgICAgICAgICAgICAgICAgeTE9XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHgyPXtncmlkQ2VsbFdpZHRofVxuICAgICAgICAgICAgICAgICAgICAgICAgeTI9e2dyaWRDZWxsSGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPXtncmlkQm9yZGVyQ29sb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17Z3JpZEJvcmRlcldpZHRofVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvcGF0dGVybj5cbiAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiBmaWxsPXtgdXJsKCMke2lkfSlgfSAvPlxuICAgICAgICA8L3N2Zz5cbiAgICApIDogbnVsbDtcbn07XG5cbkdyaWQuZGlzcGxheU5hbWUgPSBcIkdyaWRcIjtcbiIsImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIENTU1Byb3BlcnRpZXMsIEZDLCBQcm9wc1dpdGhDaGlsZHJlbiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcblxuZXhwb3J0IHR5cGUgSGVpZ2h0VW5pdFR5cGUgPSBcInBlcmNlbnRhZ2VPZldpZHRoXCIgfCBcInBlcmNlbnRhZ2VPZlBhcmVudFwiIHwgXCJwaXhlbHNcIjtcblxuZXhwb3J0IHR5cGUgV2lkdGhVbml0VHlwZSA9IFwicGVyY2VudGFnZVwiIHwgXCJwaXhlbHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEaW1lbnNpb25zIHtcbiAgICB3aWR0aFVuaXQ6IFdpZHRoVW5pdFR5cGU7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHRVbml0OiBIZWlnaHRVbml0VHlwZTtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaXplUHJvcHMgZXh0ZW5kcyBEaW1lbnNpb25zLCBQcm9wc1dpdGhDaGlsZHJlbiB7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgY2xhc3NOYW1lSW5uZXI/OiBzdHJpbmc7XG4gICAgcmVhZE9ubHk/OiBib29sZWFuO1xuICAgIHN0eWxlPzogQ1NTUHJvcGVydGllcztcbn1cblxuZXhwb3J0IGNvbnN0IFNpemVDb250YWluZXI6IEZDPFNpemVQcm9wcz4gPSAoe1xuICAgIGNsYXNzTmFtZSxcbiAgICBjbGFzc05hbWVJbm5lcixcbiAgICB3aWR0aFVuaXQsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0VW5pdCxcbiAgICBoZWlnaHQsXG4gICAgY2hpbGRyZW4sXG4gICAgc3R5bGUsXG4gICAgcmVhZE9ubHkgPSBmYWxzZVxufSkgPT4ge1xuICAgIGNvbnN0IHN0eWxlV2lkdGggPSB3aWR0aFVuaXQgPT09IFwicGVyY2VudGFnZVwiID8gYCR7d2lkdGh9JWAgOiBgJHt3aWR0aH1weGA7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lcyhjbGFzc05hbWUsIFwic2l6ZS1ib3hcIiksXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHN0eWxlV2lkdGgsXG4gICAgICAgICAgICAgICAgLi4uZ2V0SGVpZ2h0KGhlaWdodFVuaXQsIGhlaWdodCwgd2lkdGhVbml0LCB3aWR0aCksXG4gICAgICAgICAgICAgICAgLi4uc3R5bGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWVzKFwic2l6ZS1ib3gtaW5uZXJcIiwgY2xhc3NOYW1lSW5uZXIpLFxuICAgICAgICAgICAgICAgIHJlYWRPbmx5LFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiByZWFkT25seSxcbiAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogXCIwXCIsXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbTogXCIwXCIsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IFwiMFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgIClcbiAgICApO1xufTtcblxuU2l6ZUNvbnRhaW5lci5kaXNwbGF5TmFtZSA9IFwiU2l6ZUNvbnRhaW5lclwiO1xuXG5jb25zdCBnZXRIZWlnaHQgPSAoXG4gICAgaGVpZ2h0VW5pdDogSGVpZ2h0VW5pdFR5cGUsXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgd2lkdGhVbml0OiBXaWR0aFVuaXRUeXBlLFxuICAgIHdpZHRoOiBudW1iZXJcbik6IENTU1Byb3BlcnRpZXMgPT4ge1xuICAgIGNvbnN0IHN0eWxlOiBDU1NQcm9wZXJ0aWVzID0ge307XG4gICAgaWYgKGhlaWdodFVuaXQgPT09IFwicGVyY2VudGFnZU9mV2lkdGhcIikge1xuICAgICAgICBjb25zdCByYXRpbyA9IChoZWlnaHQgLyAxMDApICogd2lkdGg7XG4gICAgICAgIGlmICh3aWR0aFVuaXQgPT09IFwicGVyY2VudGFnZVwiKSB7XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBcImF1dG9cIjtcbiAgICAgICAgICAgIHN0eWxlLnBhZGRpbmdCb3R0b20gPSBgJHtyYXRpb30lYDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IGAke3JhdGlvfXB4YDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGVpZ2h0VW5pdCA9PT0gXCJwaXhlbHNcIikge1xuICAgICAgICBzdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICAgIH0gZWxzZSBpZiAoaGVpZ2h0VW5pdCA9PT0gXCJwZXJjZW50YWdlT2ZQYXJlbnRcIikge1xuICAgICAgICBzdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9JWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlO1xufTtcbiIsImltcG9ydCB7IENoYW5nZUV2ZW50LCBjcmVhdGVFbGVtZW50LCBQdXJlQ29tcG9uZW50LCBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcblxuLy8gQHRzLWV4cGVjdC1lcnJvciBzaWduYXR1cmVfcGFkIGhhcyBubyB0eXBlc1xuaW1wb3J0IFNpZ25hdHVyZVBhZCwgeyBJT3B0aW9ucyB9IGZyb20gXCJzaWduYXR1cmVfcGFkXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IFJlYWN0UmVzaXplRGV0ZWN0b3IgZnJvbSBcInJlYWN0LXJlc2l6ZS1kZXRlY3RvclwiO1xuXG5pbXBvcnQgeyBBbGVydCB9IGZyb20gXCIuL0FsZXJ0XCI7XG5pbXBvcnQgeyBHcmlkIH0gZnJvbSBcIi4vR3JpZFwiO1xuaW1wb3J0IHsgRGltZW5zaW9ucywgU2l6ZUNvbnRhaW5lciB9IGZyb20gXCIuL1NpemVDb250YWluZXJcIjtcblxuaW1wb3J0IFwiLi4vdWkvU2lnbmF0dXJlLnNjc3NcIjtcblxuZXhwb3J0IGludGVyZmFjZSBTaWduYXR1cmVQcm9wcyBleHRlbmRzIERpbWVuc2lvbnMge1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIGFsZXJ0TWVzc2FnZT86IHN0cmluZztcbiAgICBjbGVhclNpZ25hdHVyZTogYm9vbGVhbjtcbiAgICBzaG93R3JpZDogYm9vbGVhbjtcbiAgICBncmlkQ2VsbFdpZHRoOiBudW1iZXI7XG4gICAgZ3JpZENlbGxIZWlnaHQ6IG51bWJlcjtcbiAgICBncmlkQm9yZGVyQ29sb3I6IHN0cmluZztcbiAgICBncmlkQm9yZGVyV2lkdGg6IG51bWJlcjtcbiAgICBwZW5UeXBlOiBwZW5PcHRpb25zO1xuICAgIHBlbkNvbG9yOiBzdHJpbmc7XG4gICAgb25TaWduRW5kQWN0aW9uPzogKGltYWdlVXJsPzogc3RyaW5nKSA9PiB2b2lkO1xuICAgIHdyYXBwZXJTdHlsZT86IG9iamVjdDtcbiAgICByZWFkT25seTogYm9vbGVhbjtcbiAgICBzaWduYXR1cmVNb2RlOiBcImRyYXdcIiB8IFwidHlwZVwiO1xuICAgIHNob3dNb2RlVG9nZ2xlOiBib29sZWFuO1xuICAgIHNob3dDbGVhckJ1dHRvbjogYm9vbGVhbjtcbiAgICBzaG93U2F2ZUJ1dHRvbjogYm9vbGVhbjtcbiAgICBzYXZlQnV0dG9uQ2FwdGlvbj86IHN0cmluZztcbiAgICBzYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHQ/OiBzdHJpbmc7XG4gICAgb25TYXZlPzogKGltYWdlVXJsPzogc3RyaW5nKSA9PiB2b2lkO1xuICAgIGlzU2F2ZUVuYWJsZWQ/OiBib29sZWFuO1xuICAgIHNob3dIZWFkZXI6IGJvb2xlYW47XG4gICAgaGVhZGVyVGV4dD86IHN0cmluZztcbiAgICBzaG93V2F0ZXJtYXJrOiBib29sZWFuO1xuICAgIHdhdGVybWFya1RleHQ/OiBzdHJpbmc7XG4gICAgb25XYXRlcm1hcmtDaGFuZ2U/OiAodmFsdWU6IHN0cmluZykgPT4gdm9pZDtcbiAgICBpc1dhdGVybWFya1JlYWRPbmx5PzogYm9vbGVhbjtcbiAgICB0eXBlRm9udEZhbWlseTogc3RyaW5nO1xuICAgIHR5cGVGb250U2l6ZTogbnVtYmVyO1xuICAgIHR5cGVQbGFjZWhvbGRlcjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBwZW5PcHRpb25zID0gXCJmb3VudGFpblwiIHwgXCJiYWxscG9pbnRcIiB8IFwibWFya2VyXCI7XG5cbmludGVyZmFjZSBTaWduYXR1cmVTdGF0ZSB7XG4gICAgbW9kZTogXCJkcmF3XCIgfCBcInR5cGVcIjtcbiAgICB0eXBlZFRleHQ6IHN0cmluZztcbiAgICBoYXNTaWduYXR1cmU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTaWduYXR1cmUgZXh0ZW5kcyBQdXJlQ29tcG9uZW50PFNpZ25hdHVyZVByb3BzLCBTaWduYXR1cmVTdGF0ZT4ge1xuICAgIHByaXZhdGUgY2FudmFzTm9kZTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHNpZ25hdHVyZV9wYWQgaGFzIG5vIHR5cGVzXG4gICAgcHJpdmF0ZSBzaWduYXR1cmVQYWQ6IFNpZ25hdHVyZVBhZDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBTaWduYXR1cmVQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBtb2RlOiBwcm9wcy5zaWduYXR1cmVNb2RlLFxuICAgICAgICAgICAgdHlwZWRUZXh0OiBcIlwiLFxuICAgICAgICAgICAgaGFzU2lnbmF0dXJlOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpOiBSZWFjdE5vZGUge1xuICAgICAgICBjb25zdCB7IGNsYXNzTmFtZSwgYWxlcnRNZXNzYWdlLCB3cmFwcGVyU3R5bGUgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxTaXplQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgey4uLnRoaXMucHJvcHN9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwid2lkZ2V0LXNpZ25hdHVyZVwiLCBjbGFzc05hbWUpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZUlubmVyPVwid2lkZ2V0LXNpZ25hdHVyZS13cmFwcGVyIGZvcm0tY29udHJvbCBteC10ZXh0YXJlYS1pbnB1dCBteC10ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3dyYXBwZXJTdHlsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8QWxlcnQgYm9vdHN0cmFwU3R5bGU9XCJkYW5nZXJcIj57YWxlcnRNZXNzYWdlfTwvQWxlcnQ+XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVySGVhZGVyKCl9XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVyQ29udHJvbHMoKX1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtY2FudmFzLWFyZWFcIj5cbiAgICAgICAgICAgICAgICAgICAgPEdyaWQgey4uLnRoaXMucHJvcHN9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxjYW52YXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtY2FudmFzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17KG5vZGU6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTm9kZSA9IG5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJXYXRlcm1hcmsoKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8UmVhY3RSZXNpemVEZXRlY3RvciBoYW5kbGVXaWR0aCBoYW5kbGVIZWlnaHQgb25SZXNpemU9e3RoaXMub25SZXNpemV9IC8+XG4gICAgICAgICAgICA8L1NpemVDb250YWluZXI+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJIZWFkZXIoKTogUmVhY3ROb2RlIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnNob3dIZWFkZXIgfHwgIXRoaXMucHJvcHMuaGVhZGVyVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS1oZWFkZXJcIj57dGhpcy5wcm9wcy5oZWFkZXJUZXh0fTwvZGl2PjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckNvbnRyb2xzKCk6IFJlYWN0Tm9kZSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNob3dUb2dnbGUgPSB0aGlzLnByb3BzLnNob3dNb2RlVG9nZ2xlO1xuICAgICAgICBjb25zdCBzaG93SW5wdXQgPSB0aGlzLnN0YXRlLm1vZGUgPT09IFwidHlwZVwiO1xuICAgICAgICBjb25zdCBzaG93Q2xlYXIgPSB0aGlzLnByb3BzLnNob3dDbGVhckJ1dHRvbjtcbiAgICAgICAgY29uc3Qgc2hvd1NhdmUgPSB0aGlzLnByb3BzLnNob3dTYXZlQnV0dG9uO1xuXG4gICAgICAgIGlmICghc2hvd1RvZ2dsZSAmJiAhc2hvd0lucHV0ICYmICFzaG93Q2xlYXIgJiYgIXNob3dTYXZlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtY29udHJvbHNcIj5cbiAgICAgICAgICAgICAgICB7c2hvd1RvZ2dsZSA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLXRvZ2dsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5zdGF0ZS5tb2RlID09PSBcImRyYXdcIiA/IFwiYWN0aXZlXCIgOiBcIlwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0TW9kZShcImRyYXdcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRHJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnN0YXRlLm1vZGUgPT09IFwidHlwZVwiID8gXCJhY3RpdmVcIiA6IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5zZXRNb2RlKFwidHlwZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAge3Nob3dJbnB1dCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLXR5cGVkLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnR5cGVQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnR5cGVkVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uVHlwZWRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAge3Nob3dDbGVhciA/IChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS1jbGVhclwiIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xlYXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICBDbGVhclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICB7c2hvd1NhdmUgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS1zYXZlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2F2ZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnByb3BzLmlzU2F2ZUVuYWJsZWR9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLnNhdmVCdXR0b25DYXB0aW9uIHx8IHRoaXMucHJvcHMuc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0IHx8IFwiU2F2ZVwifVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jYW52YXNOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZCA9IG5ldyBTaWduYXR1cmVQYWQodGhpcy5jYW52YXNOb2RlLCB7XG4gICAgICAgICAgICAgICAgcGVuQ29sb3I6IHRoaXMucHJvcHMucGVuQ29sb3IsXG4gICAgICAgICAgICAgICAgb25FbmQ6IHRoaXMuaGFuZGxlU2lnbkVuZCxcbiAgICAgICAgICAgICAgICAuLi50aGlzLnNpZ25hdHVyZVBhZE9wdGlvbnMoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmFwcGx5TW9kZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogU2lnbmF0dXJlUHJvcHMpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2lnbmF0dXJlUGFkKSB7XG4gICAgICAgICAgICBpZiAocHJldlByb3BzLmNsZWFyU2lnbmF0dXJlICE9PSB0aGlzLnByb3BzLmNsZWFyU2lnbmF0dXJlICYmIHRoaXMucHJvcHMuY2xlYXJTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHR5cGVkVGV4dDogXCJcIiwgaGFzU2lnbmF0dXJlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmV2UHJvcHMucmVhZE9ubHkgIT09IHRoaXMucHJvcHMucmVhZE9ubHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5TW9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZQcm9wcy5wZW5Db2xvciAhPT0gdGhpcy5wcm9wcy5wZW5Db2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkLnBlbkNvbG9yID0gdGhpcy5wcm9wcy5wZW5Db2xvcjtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5tb2RlID09PSBcInR5cGVcIiAmJiB0aGlzLnN0YXRlLnR5cGVkVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclR5cGVkU2lnbmF0dXJlKHRoaXMuc3RhdGUudHlwZWRUZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldlByb3BzLnNpZ25hdHVyZU1vZGUgIT09IHRoaXMucHJvcHMuc2lnbmF0dXJlTW9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0TW9kZSh0aGlzLnByb3BzLnNpZ25hdHVyZU1vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHByZXZQcm9wcy50eXBlRm9udEZhbWlseSAhPT0gdGhpcy5wcm9wcy50eXBlRm9udEZhbWlseSB8fFxuICAgICAgICAgICAgICAgIHByZXZQcm9wcy50eXBlRm9udFNpemUgIT09IHRoaXMucHJvcHMudHlwZUZvbnRTaXplXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5tb2RlID09PSBcInR5cGVcIiAmJiB0aGlzLnN0YXRlLnR5cGVkVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclR5cGVkU2lnbmF0dXJlKHRoaXMuc3RhdGUudHlwZWRUZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVzaXplID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy5jYW52YXNOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc05vZGUud2lkdGggPVxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTm9kZSAmJiB0aGlzLmNhbnZhc05vZGUucGFyZW50RWxlbWVudCA/IHRoaXMuY2FudmFzTm9kZS5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIDogMDtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzTm9kZS5oZWlnaHQgPVxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTm9kZSAmJiB0aGlzLmNhbnZhc05vZGUucGFyZW50RWxlbWVudCA/IHRoaXMuY2FudmFzTm9kZS5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCA6IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5tb2RlID09PSBcInR5cGVcIikge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVHlwZWRTaWduYXR1cmUodGhpcy5zdGF0ZS50eXBlZFRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5zaWduYXR1cmVQYWQudG9EYXRhKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZC5mcm9tRGF0YShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHNpZ25hdHVyZVBhZE9wdGlvbnMoKTogSU9wdGlvbnMge1xuICAgICAgICBsZXQgb3B0aW9uczogSU9wdGlvbnMgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGVuVHlwZSA9PT0gXCJmb3VudGFpblwiKSB7XG4gICAgICAgICAgICBvcHRpb25zID0geyBtaW5XaWR0aDogMC42LCBtYXhXaWR0aDogMi42LCB2ZWxvY2l0eUZpbHRlcldlaWdodDogMC42IH07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5wZW5UeXBlID09PSBcImJhbGxwb2ludFwiKSB7XG4gICAgICAgICAgICBvcHRpb25zID0geyBtaW5XaWR0aDogMS40LCBtYXhXaWR0aDogMS41LCB2ZWxvY2l0eUZpbHRlcldlaWdodDogMS41IH07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5wZW5UeXBlID09PSBcIm1hcmtlclwiKSB7XG4gICAgICAgICAgICBvcHRpb25zID0geyBtaW5XaWR0aDogMiwgbWF4V2lkdGg6IDQsIHZlbG9jaXR5RmlsdGVyV2VpZ2h0OiAwLjkgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZVNpZ25FbmQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uU2lnbkVuZEFjdGlvbiAmJiB0aGlzLnN0YXRlLm1vZGUgPT09IFwiZHJhd1wiKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uU2lnbkVuZEFjdGlvbih0aGlzLnNpZ25hdHVyZVBhZC50b0RhdGFVUkwoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2lnbmF0dXJlUGFkICYmICF0aGlzLnNpZ25hdHVyZVBhZC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBoYXNTaWduYXR1cmU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZXRNb2RlKG1vZGU6IFwiZHJhd1wiIHwgXCJ0eXBlXCIpOiB2b2lkIHtcbiAgICAgICAgaWYgKG1vZGUgPT09IHRoaXMuc3RhdGUubW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb2RlIH0sICgpID0+IHRoaXMuYXBwbHlNb2RlKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlNb2RlKCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuc2lnbmF0dXJlUGFkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVhZE9ubHkpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkLm9mZigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm1vZGUgPT09IFwidHlwZVwiKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZC5vZmYoKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyVHlwZWRTaWduYXR1cmUodGhpcy5zdGF0ZS50eXBlZFRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQub24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25UeXBlZENoYW5nZSA9IChldmVudDogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHR5cGVkVGV4dDogdGV4dCwgaGFzU2lnbmF0dXJlOiB0ZXh0LnRyaW0oKS5sZW5ndGggPiAwIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyVHlwZWRTaWduYXR1cmUodGV4dCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vblNpZ25FbmRBY3Rpb24gJiYgdGV4dC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uU2lnbkVuZEFjdGlvbih0aGlzLnNpZ25hdHVyZVBhZC50b0RhdGFVUkwoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclR5cGVkU2lnbmF0dXJlKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuY2FudmFzTm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY2FudmFzTm9kZS5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGlmICghY3R4KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG5cbiAgICAgICAgaWYgKCF0ZXh0LnRyaW0oKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWF4V2lkdGggPSB0aGlzLmNhbnZhc05vZGUud2lkdGggKiAwLjk7XG4gICAgICAgIGxldCBmb250U2l6ZSA9IE1hdGgubWF4KHRoaXMucHJvcHMudHlwZUZvbnRTaXplLCA4KTtcbiAgICAgICAgY3R4LmZvbnQgPSBgJHtmb250U2l6ZX1weCAke3RoaXMucHJvcHMudHlwZUZvbnRGYW1pbHl9YDtcblxuICAgICAgICB3aGlsZSAoY3R4Lm1lYXN1cmVUZXh0KHRleHQpLndpZHRoID4gbWF4V2lkdGggJiYgZm9udFNpemUgPiA4KSB7XG4gICAgICAgICAgICBmb250U2l6ZSAtPSAyO1xuICAgICAgICAgICAgY3R4LmZvbnQgPSBgJHtmb250U2l6ZX1weCAke3RoaXMucHJvcHMudHlwZUZvbnRGYW1pbHl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnByb3BzLnBlbkNvbG9yO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgIGN0eC5maWxsVGV4dCh0ZXh0LCB0aGlzLmNhbnZhc05vZGUud2lkdGggLyAyLCB0aGlzLmNhbnZhc05vZGUuaGVpZ2h0IC8gMik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGVhckNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnR5cGVkVGV4dCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHR5cGVkVGV4dDogXCJcIiwgaGFzU2lnbmF0dXJlOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmhhc1NpZ25hdHVyZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhhc1NpZ25hdHVyZTogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBoYW5kbGVTYXZlQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5vblNhdmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkYXRhVXJsID0gdGhpcy5jYW52YXNOb2RlID8gdGhpcy5jYW52YXNOb2RlLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5wcm9wcy5vblNhdmUoZGF0YVVybCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyV2F0ZXJtYXJrKCk6IFJlYWN0Tm9kZSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5zaG93V2F0ZXJtYXJrIHx8ICF0aGlzLnN0YXRlLmhhc1NpZ25hdHVyZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25XYXRlcm1hcmtDaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtd2F0ZXJtYXJrLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy53YXRlcm1hcmtUZXh0ID8/IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uV2F0ZXJtYXJrQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5pc1dhdGVybWFya1JlYWRPbmx5fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtd2F0ZXJtYXJrLXRleHRcIj57dGhpcy5wcm9wcy53YXRlcm1hcmtUZXh0fTwvZGl2PjtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV2F0ZXJtYXJrQ2hhbmdlID0gKGV2ZW50OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbldhdGVybWFya0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbldhdGVybWFya0NoYW5nZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2xlYXJDYW52YXMoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5jYW52YXNOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jYW52YXNOb2RlLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhc05vZGUud2lkdGgsIHRoaXMuY2FudmFzTm9kZS5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNpZ25hdHVyZVBhZCkge1xuICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIFJlYWN0RWxlbWVudCB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBTaWduYXR1cmVQcmV2aWV3UHJvcHMgfSBmcm9tIFwiLi4vdHlwaW5ncy9TaWduYXR1cmVQcm9wc1wiO1xuaW1wb3J0IHsgU2lnbmF0dXJlIGFzIFNpZ25hdHVyZUNhbnZhcyB9IGZyb20gXCIuL2NvbXBvbmVudHMvU2lnbmF0dXJlXCI7XG5cbmRlY2xhcmUgZnVuY3Rpb24gcmVxdWlyZShuYW1lOiBzdHJpbmcpOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2aWV3KHByb3BzOiBTaWduYXR1cmVQcmV2aWV3UHJvcHMpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxTaWduYXR1cmVDYW52YXNcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cHJvcHMuY2xhc3N9XG4gICAgICAgICAgICB3cmFwcGVyU3R5bGU9e3Byb3BzLnN0eWxlT2JqZWN0fVxuICAgICAgICAgICAgd2lkdGg9e3Byb3BzLndpZHRoID8/IDEwMH1cbiAgICAgICAgICAgIHdpZHRoVW5pdD17cHJvcHMud2lkdGhVbml0fVxuICAgICAgICAgICAgaGVpZ2h0PXtwcm9wcy5oZWlnaHQgPz8gNTB9XG4gICAgICAgICAgICBoZWlnaHRVbml0PXtwcm9wcy5oZWlnaHRVbml0fVxuICAgICAgICAgICAgc2hvd0dyaWQ9e3Byb3BzLnNob3dHcmlkfVxuICAgICAgICAgICAgZ3JpZEJvcmRlckNvbG9yPXtwcm9wcy5ncmlkQm9yZGVyQ29sb3J9XG4gICAgICAgICAgICBncmlkQm9yZGVyV2lkdGg9e3Byb3BzLmdyaWRCb3JkZXJXaWR0aCA/PyAxfVxuICAgICAgICAgICAgZ3JpZENlbGxIZWlnaHQ9e3Byb3BzLmdyaWRDZWxsSGVpZ2h0ID8/IDUwfVxuICAgICAgICAgICAgZ3JpZENlbGxXaWR0aD17cHJvcHMuZ3JpZENlbGxXaWR0aCA/PyA1MH1cbiAgICAgICAgICAgIHBlbkNvbG9yPXtwcm9wcy5wZW5Db2xvcn1cbiAgICAgICAgICAgIHBlblR5cGU9e3Byb3BzLnBlblR5cGV9XG4gICAgICAgICAgICBzaWduYXR1cmVNb2RlPXtwcm9wcy5zaWduYXR1cmVNb2RlfVxuICAgICAgICAgICAgc2hvd01vZGVUb2dnbGU9e2ZhbHNlfVxuICAgICAgICAgICAgc2hvd0NsZWFyQnV0dG9uPXtwcm9wcy5zaG93Q2xlYXJCdXR0b259XG4gICAgICAgICAgICBzaG93U2F2ZUJ1dHRvbj17cHJvcHMuc2hvd1NhdmVCdXR0b259XG4gICAgICAgICAgICBzYXZlQnV0dG9uQ2FwdGlvbj17cHJvcHMuc2F2ZUJ1dHRvbkNhcHRpb24gfHwgcHJvcHMuc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0fVxuICAgICAgICAgICAgc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0PXtwcm9wcy5zYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHR9XG4gICAgICAgICAgICBpc1NhdmVFbmFibGVkPXt0cnVlfVxuICAgICAgICAgICAgc2hvd0hlYWRlcj17cHJvcHMuc2hvd0hlYWRlcn1cbiAgICAgICAgICAgIGhlYWRlclRleHQ9e3Byb3BzLmhlYWRlclRleHQgfHwgcHJvcHMuaGVhZGVyVGV4dERlZmF1bHR9XG4gICAgICAgICAgICBzaG93V2F0ZXJtYXJrPXtwcm9wcy5zaG93V2F0ZXJtYXJrfVxuICAgICAgICAgICAgd2F0ZXJtYXJrVGV4dD17cHJvcHMud2F0ZXJtYXJrQXR0cmlidXRlIHx8IFwiV2F0ZXJtYXJrXCJ9XG4gICAgICAgICAgICBpc1dhdGVybWFya1JlYWRPbmx5PXt0cnVlfVxuICAgICAgICAgICAgdHlwZUZvbnRGYW1pbHk9e3Byb3BzLnR5cGVGb250RmFtaWx5fVxuICAgICAgICAgICAgdHlwZUZvbnRTaXplPXtwcm9wcy50eXBlRm9udFNpemUgPz8gMzJ9XG4gICAgICAgICAgICB0eXBlUGxhY2Vob2xkZXI9e3Byb3BzLnR5cGVQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIGNsZWFyU2lnbmF0dXJlPXtmYWxzZX1cbiAgICAgICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICAvPlxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmV2aWV3Q3NzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuL3VpL1NpZ25hdHVyZS5zY3NzXCIpO1xufVxuIl0sIm5hbWVzIjpbInN0eWxlSW5qZWN0IiwiY3NzIiwicmVmIiwiaW5zZXJ0QXQiLCJkb2N1bWVudCIsImhlYWQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInN0eWxlIiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJmaXJzdENoaWxkIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kQ2hpbGQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsImNyZWF0ZVRleHROb2RlIiwiUG9pbnQiLCJjb25zdHJ1Y3RvciIsIngiLCJ5IiwicHJlc3N1cmUiLCJ0aW1lIiwiaXNOYU4iLCJFcnJvciIsIkRhdGUiLCJub3ciLCJkaXN0YW5jZVRvIiwic3RhcnQiLCJNYXRoIiwic3FydCIsInBvdyIsImVxdWFscyIsIm90aGVyIiwidmVsb2NpdHlGcm9tIiwiaGFzT3duIiwiaGFzT3duUHJvcGVydHkiLCJjbGFzc05hbWVzIiwiY2xhc3NlcyIsImkiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJhcmciLCJhcHBlbmRDbGFzcyIsInBhcnNlVmFsdWUiLCJBcnJheSIsImlzQXJyYXkiLCJhcHBseSIsInRvU3RyaW5nIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaW5jbHVkZXMiLCJrZXkiLCJjYWxsIiwidmFsdWUiLCJuZXdDbGFzcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJkZWZhdWx0Iiwid2luZG93IiwiaXNPYmplY3QiLCJmcmVlR2xvYmFsIiwiZ2xvYmFsIiwicmVxdWlyZSIsImZyZWVTZWxmIiwic2VsZiIsInJvb3QiLCJGdW5jdGlvbiIsInJlV2hpdGVzcGFjZSIsInRyaW1tZWRFbmRJbmRleCIsInN0cmluZyIsImluZGV4IiwidGVzdCIsImNoYXJBdCIsInJlVHJpbVN0YXJ0IiwiYmFzZVRyaW0iLCJzbGljZSIsInJlcGxhY2UiLCJTeW1ib2wiLCJvYmplY3RQcm90byIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwic3ltVG9TdHJpbmdUYWciLCJ0b1N0cmluZ1RhZyIsInVuZGVmaW5lZCIsImdldFJhd1RhZyIsImlzT3duIiwidGFnIiwidW5tYXNrZWQiLCJlIiwicmVzdWx0Iiwib2JqZWN0VG9TdHJpbmciLCJudWxsVGFnIiwidW5kZWZpbmVkVGFnIiwiYmFzZUdldFRhZyIsImlzT2JqZWN0TGlrZSIsInN5bWJvbFRhZyIsImlzU3ltYm9sIiwiTkFOIiwicmVJc0JhZEhleCIsInJlSXNCaW5hcnkiLCJyZUlzT2N0YWwiLCJmcmVlUGFyc2VJbnQiLCJwYXJzZUludCIsInRvTnVtYmVyIiwidmFsdWVPZiIsImlzQmluYXJ5IiwiRlVOQ19FUlJPUl9URVhUIiwibmF0aXZlTWF4IiwibWF4IiwibmF0aXZlTWluIiwibWluIiwiZGVib3VuY2UiLCJmdW5jIiwid2FpdCIsIm9wdGlvbnMiLCJsYXN0QXJncyIsImxhc3RUaGlzIiwibWF4V2FpdCIsInRpbWVySWQiLCJsYXN0Q2FsbFRpbWUiLCJsYXN0SW52b2tlVGltZSIsImxlYWRpbmciLCJtYXhpbmciLCJ0cmFpbGluZyIsIlR5cGVFcnJvciIsImludm9rZUZ1bmMiLCJhcmdzIiwidGhpc0FyZyIsImxlYWRpbmdFZGdlIiwic2V0VGltZW91dCIsInRpbWVyRXhwaXJlZCIsInJlbWFpbmluZ1dhaXQiLCJ0aW1lU2luY2VMYXN0Q2FsbCIsInRpbWVTaW5jZUxhc3RJbnZva2UiLCJ0aW1lV2FpdGluZyIsInNob3VsZEludm9rZSIsInRyYWlsaW5nRWRnZSIsImNhbmNlbCIsImNsZWFyVGltZW91dCIsImZsdXNoIiwiZGVib3VuY2VkIiwiaXNJbnZva2luZyIsInRocm90dGxlIiwiZXh0ZW5kU3RhdGljcyIsImQiLCJiIiwic2V0UHJvdG90eXBlT2YiLCJfX3Byb3RvX18iLCJwIiwiX19leHRlbmRzIiwiU3RyaW5nIiwiX18iLCJjcmVhdGUiLCJfX3Jlc3QiLCJzIiwidCIsImluZGV4T2YiLCJnZXRPd25Qcm9wZXJ0eVN5bWJvbHMiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsIlN1cHByZXNzZWRFcnJvciIsImVycm9yIiwic3VwcHJlc3NlZCIsIm1lc3NhZ2UiLCJuYW1lIiwiUHVyZUNvbXBvbmVudCIsIlJlYWN0UmVzaXplRGV0ZWN0b3IiLCJTaWduYXR1cmVDYW52YXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLFdBQVdBLENBQUNDLEdBQUcsRUFBRUMsR0FBRyxFQUFFO0VBQzdCLElBQUtBLEdBQUcsS0FBSyxLQUFLLENBQUMsRUFBR0EsR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUM5QixFQUFBLElBQUlDLFFBQVEsR0FBR0QsR0FBRyxDQUFDQyxRQUFRLENBQUE7QUFFM0IsRUFBQSxJQUFJLENB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RUFBRSxLQUFLLENBQUMsUUFBUSxFQUN4QixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFDdEIsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQ2xDLGNBQWMsRUFBRSxLQUFLLEVBQ3JCLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZSxFQUN0QyxjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFDcEMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyx3QkFBd0IsRUFDNUUsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLHdCQUF3QixFQUN4RCxhQUFhLEVBQUUsSUFBSSxFQUNuQixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFDNUIsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUN2RCxhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFDbEMsYUFBYSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxXQUFXLEVBQ3RELG1CQUFtQixFQUFFLElBQUksRUFDekIsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQ3BDLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxJQUFJLEVBQUUsRUFDdEMsZUFBZSxFQUFFLEtBQUssQ0FBQyxlQUFlLEVBQ3RDLGNBQWMsRUFBRSxLQUFLLEVBQ3JCLFFBQVEsRUFBRSxJQUFJLEVBQ2hCLENBQUEsRUFBQTtBQUVWLENBQUE7U0FFZ0IsYUFBYSxHQUFBO0FBQ3pCLElBQUEsT0FBTyxVQUE4QixDQUFBO0FBQ3pDOzs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOF19
