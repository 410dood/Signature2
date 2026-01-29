import React, { cloneElement, isValidElement, createRef, PureComponent, createElement, useMemo, useCallback, useRef } from 'react';
import { findDOMNode } from 'react-dom';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class Utils {
    static convertUrlToBlob(base64Uri) {
        const contentType = "image/png";
        const sliceSize = 512;
        const byteCharacters = atob(base64Uri.split(";base64,")[1]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    }
}

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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
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
      var currentElement = findDOMNode(_this);
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
      if (isValidElement(children)) {
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
    _this.targetRef = createRef();
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
            return cloneElement(child, nativeProps);
          }
          // class or functional component otherwise
          return cloneElement(child, childProps);
        }
      case 'childArray':
        {
          var childArray = children;
          return childArray.map(function (el) {
            return !!el && cloneElement(el, childProps);
          });
        }
      default:
        return React.createElement(WrapperTag, null);
    }
  };
  return ResizeDetector;
}(PureComponent);

const Alert = ({ bootstrapStyle = "danger", className, children }) => children ? createElement("div", { className: classNames(`alert alert-${bootstrapStyle}`, className) }, children) : null;
Alert.displayName = "Alert";

const Grid = ({ gridCellWidth, gridCellHeight, gridBorderColor, gridBorderWidth, showGrid = true }) => {
    const id = `grid${Math.floor(Math.random() * 1000000)}`;
    return showGrid ? (createElement("svg", { className: "widget-signature-grid", width: "100%", height: "100%", xmlns: "http://www.w3.org/2000/svg" },
        createElement("defs", null,
            createElement("pattern", { id: id, width: gridCellWidth, height: gridCellHeight, patternUnits: "userSpaceOnUse" },
                createElement("line", { x1: "0", y1: gridCellHeight, x2: gridCellWidth, y2: gridCellHeight, stroke: gridBorderColor, strokeWidth: gridBorderWidth }),
                createElement("line", { x1: gridCellWidth, y1: "0", x2: gridCellWidth, y2: gridCellHeight, stroke: gridBorderColor, strokeWidth: gridBorderWidth }))),
        createElement("rect", { width: "100%", height: "100%", fill: `url(#${id})` }))) : null;
};
Grid.displayName = "Grid";

const SizeContainer = ({ className, classNameInner, widthUnit, width, heightUnit, height, children, style, readOnly = false }) => {
    const styleWidth = widthUnit === "percentage" ? `${width}%` : `${width}px`;
    return createElement("div", {
        className: classNames(className, "size-box"),
        style: {
            position: "relative",
            width: styleWidth,
            ...getHeight(heightUnit, height, widthUnit, width),
            ...style
        }
    }, createElement("div", {
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

class Signature extends PureComponent {
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
        return (createElement(SizeContainer, { ...this.props, className: classNames("widget-signature", className), classNameInner: "widget-signature-wrapper form-control mx-textarea-input mx-textarea", style: wrapperStyle },
            createElement(Alert, { bootstrapStyle: "danger" }, alertMessage),
            this.renderHeader(),
            this.renderControls(),
            createElement("div", { className: "widget-signature-canvas-area" },
                createElement(Grid, { ...this.props }),
                createElement("canvas", { className: "widget-signature-canvas", ref: (node) => {
                        this.canvasNode = node;
                    } }),
                this.renderWatermark()),
            createElement(ResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize })));
    }
    renderHeader() {
        if (!this.props.showHeader || !this.props.headerText) {
            return null;
        }
        return createElement("div", { className: "widget-signature-header" }, this.props.headerText);
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
        return (createElement("div", { className: "widget-signature-controls" },
            showToggle ? (createElement("div", { className: "widget-signature-toggle" },
                createElement("button", { type: "button", className: this.state.mode === "draw" ? "active" : "", onClick: () => this.setMode("draw") }, "Draw"),
                createElement("button", { type: "button", className: this.state.mode === "type" ? "active" : "", onClick: () => this.setMode("type") }, "Type"))) : null,
            showInput ? (createElement("input", { className: "widget-signature-typed-input", type: "text", placeholder: this.props.typePlaceholder, value: this.state.typedText, onChange: this.onTypedChange })) : null,
            showClear ? (createElement("button", { type: "button", className: "widget-signature-clear", onClick: this.handleClearClick }, "Clear")) : null,
            showSave ? (createElement("button", { type: "button", className: "widget-signature-save", onClick: this.handleSaveClick, disabled: !this.props.isSaveEnabled }, this.props.saveButtonCaption || this.props.saveButtonCaptionDefault || "Save")) : null));
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
            return (createElement("input", { className: "widget-signature-watermark-input", type: "text", value: this.props.watermarkText ?? "", onChange: this.onWatermarkChange, disabled: this.props.isWatermarkReadOnly }));
        }
        return createElement("div", { className: "widget-signature-watermark-text" }, this.props.watermarkText);
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

function resolveObjectItem(dataSource) {
    if (!dataSource) {
        return undefined;
    }
    return dataSource.status === "available" /* ValueStatus.Available */ ? dataSource.items?.[0] : undefined;
}
function SignatureContainer(props) {
    const { dataSource, hasSignatureAttribute, wrapperStyle, className, readOnly, friendlyId, signatureMode, showModeToggle, showClearButton, showSaveButton, saveButtonCaption, saveButtonCaptionDefault, onSaveAction, showHeader, headerText, headerTextDefault, base64Attribute, showWatermark, watermarkAttribute, typeFontFamily, typeFontSize, typePlaceholder, penColor, penType, showGrid, gridBorderColor, gridBorderWidth, gridCellHeight, gridCellWidth, width, widthUnit, height, heightUnit } = props;
    const mxObject = useMemo(() => resolveObjectItem(dataSource), [dataSource]);
    const signatureAttribute = useMemo(() => {
        if (!mxObject || !hasSignatureAttribute) {
            return undefined;
        }
        return hasSignatureAttribute.get(mxObject);
    }, [hasSignatureAttribute, mxObject]);
    const alertMessage = useMemo(() => {
        if (!mxObject) {
            return `${friendlyId}: Data source is empty.`;
        }
        return "";
    }, [friendlyId, mxObject]);
    const isReadOnly = useMemo(() => {
        return readOnly || !mxObject;
    }, [mxObject, readOnly]);
    const watermarkValue = useMemo(() => {
        if (!mxObject || !watermarkAttribute) {
            return undefined;
        }
        return watermarkAttribute.get(mxObject);
    }, [mxObject, watermarkAttribute]);
    const watermarkText = useMemo(() => {
        if (!watermarkValue || watermarkValue.status !== "available" /* ValueStatus.Available */) {
            return "";
        }
        return watermarkValue.value ?? "";
    }, [watermarkValue]);
    const handleWatermarkChange = useCallback((value) => {
        if (!watermarkValue || watermarkValue.status !== "available" /* ValueStatus.Available */ || watermarkValue.readOnly) {
            return;
        }
        watermarkValue.setValue(value);
    }, [watermarkValue]);
    const saveButtonCaptionText = useMemo(() => {
        if (!mxObject || !saveButtonCaption) {
            return saveButtonCaptionDefault;
        }
        const captionValue = saveButtonCaption.get(mxObject);
        if (captionValue.status !== "available" /* ValueStatus.Available */) {
            return saveButtonCaptionDefault;
        }
        return captionValue.value !== "" ? captionValue.value : saveButtonCaptionDefault;
    }, [mxObject, saveButtonCaption, saveButtonCaptionDefault]);
    const headerTextValue = useMemo(() => {
        if (!mxObject || !headerText) {
            return headerTextDefault;
        }
        const headerValue = headerText.get(mxObject);
        if (headerValue.status !== "available" /* ValueStatus.Available */) {
            return headerTextDefault;
        }
        return headerValue.value !== "" ? headerValue.value : headerTextDefault;
    }, [mxObject, headerText, headerTextDefault]);
    const saveAction = useMemo(() => {
        if (!mxObject || !onSaveAction) {
            return undefined;
        }
        return onSaveAction.get(mxObject);
    }, [mxObject, onSaveAction]);
    const base64Value = useMemo(() => {
        if (!mxObject || !base64Attribute) {
            return undefined;
        }
        return base64Attribute.get(mxObject);
    }, [mxObject, base64Attribute]);
    const setBase64Value = useCallback((value) => {
        if (!base64Value || base64Value.status !== "available" /* ValueStatus.Available */ || base64Value.readOnly) {
            return;
        }
        base64Value.setValue(value);
    }, [base64Value]);
    const generateFileName = useCallback((guid) => {
        return `signature-${guid}.png`;
    }, []);
    const saveDocument = useCallback((base64Uri, onSuccess) => {
        if (!base64Uri || !mxObject) {
            return;
        }
        mx.data.saveDocument(mxObject.id, generateFileName(mxObject.id), {}, Utils.convertUrlToBlob(base64Uri), () => {
            if (onSuccess) {
                onSuccess();
            }
        }, (err) => mx.ui.error(`Error saving signature: ${err.message}`));
    }, [generateFileName, mxObject]);
    const lastSignatureDataUrlRef = useRef();
    const handleSignEnd = useCallback((base64Uri) => {
        if (!base64Uri || !mxObject || isReadOnly) {
            return;
        }
        lastSignatureDataUrlRef.current = base64Uri;
        setBase64Value(base64Uri);
        saveDocument(base64Uri);
    }, [isReadOnly, mxObject, saveDocument, setBase64Value]);
    const handleSave = useCallback((base64Uri) => {
        const dataUrl = base64Uri || lastSignatureDataUrlRef.current;
        const executeAction = () => {
            if (!isReadOnly && saveAction?.canExecute) {
                saveAction.execute();
            }
        };
        if (dataUrl) {
            setBase64Value(dataUrl);
            saveDocument(dataUrl, executeAction);
            return;
        }
        executeAction();
    }, [isReadOnly, saveAction, saveDocument, setBase64Value]);
    const clearSignature = signatureAttribute?.status === "available" /* ValueStatus.Available */ ? signatureAttribute.value === false : false;
    const shouldShowWatermark = showWatermark && !!watermarkValue;
    const shouldShowControls = !isReadOnly;
    return createElement(Signature, {
        width,
        widthUnit,
        height,
        heightUnit,
        className,
        wrapperStyle,
        alertMessage,
        clearSignature,
        readOnly: isReadOnly,
        onSignEndAction: handleSignEnd,
        signatureMode,
        showModeToggle: shouldShowControls && showModeToggle,
        showClearButton: shouldShowControls && showClearButton,
        showSaveButton: shouldShowControls && showSaveButton,
        saveButtonCaption: saveButtonCaptionText,
        saveButtonCaptionDefault,
        onSave: handleSave,
        isSaveEnabled: !!saveAction?.canExecute && !isReadOnly,
        showHeader,
        headerText: headerTextValue,
        showWatermark: shouldShowWatermark,
        watermarkText,
        onWatermarkChange: handleWatermarkChange,
        isWatermarkReadOnly: isReadOnly || !!watermarkValue?.readOnly,
        typeFontFamily,
        typeFontSize,
        typePlaceholder,
        penColor,
        penType,
        showGrid,
        gridBorderColor,
        gridBorderWidth,
        gridCellHeight,
        gridCellWidth
    });
}

function SignatureWeb(props) {
    const propsAny = props;
    const editability = typeof propsAny.editability === "string" ? propsAny.editability.toLowerCase() : undefined;
    const readOnly = propsAny.readOnly ??
        (propsAny.editable === false ? true : undefined) ??
        (propsAny.editable === true ? false : undefined) ??
        (editability === "never" || editability === "read-only" || editability === "readonly" ? true : undefined) ??
        (editability === "always" ? false : undefined) ??
        false;
    return (createElement(SignatureContainer, { className: props.class, wrapperStyle: props.style, readOnly: readOnly, dataSource: props.dataSource, hasSignatureAttribute: props.hasSignatureAttribute, friendlyId: props.name, signatureMode: props.signatureMode, showModeToggle: props.showModeToggle, showClearButton: props.showClearButton, showSaveButton: props.showSaveButton, saveButtonCaption: props.saveButtonCaption, saveButtonCaptionDefault: props.saveButtonCaptionDefault, onSaveAction: props.onSaveAction, showHeader: props.showHeader, headerText: props.headerText, headerTextDefault: props.headerTextDefault, base64Attribute: props.base64Attribute, showWatermark: props.showWatermark, watermarkAttribute: props.watermarkAttribute, typeFontFamily: props.typeFontFamily, typeFontSize: props.typeFontSize, typePlaceholder: props.typePlaceholder, width: props.width, widthUnit: props.widthUnit, height: props.height, heightUnit: props.heightUnit, showGrid: props.showGrid, gridBorderColor: props.gridBorderColor, gridBorderWidth: props.gridBorderWidth, gridCellHeight: props.gridCellHeight, gridCellWidth: props.gridCellWidth, penColor: props.penColor, penType: props.penType }));
}

export { SignatureWeb };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmF0dXJlV2ViLm1qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3V0aWxzL1V0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3NpZ25hdHVyZV9wYWQvZGlzdC9zaWduYXR1cmVfcGFkLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3Jvb3QuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL25vdy5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3RyaW1tZWRFbmRJbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VUcmltLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fU3ltYm9sLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0UmF3VGFnLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fb2JqZWN0VG9TdHJpbmcuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0VGFnLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzU3ltYm9sLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC90b051bWJlci5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvZGVib3VuY2UuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL3Rocm90dGxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0LXJlc2l6ZS1kZXRlY3Rvci9idWlsZC9pbmRleC5lc20uanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9BbGVydC50c3giLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9HcmlkLnRzeCIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1NpemVDb250YWluZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9TaWduYXR1cmUudHN4IiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvU2lnbmF0dXJlQ29udGFpbmVyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL1NpZ25hdHVyZVdlYi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHRyYW5lb3VzLWNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVdGlscyB7XG4gICAgc3RhdGljIGNvbnZlcnRVcmxUb0Jsb2IoYmFzZTY0VXJpOiBzdHJpbmcpOiBCbG9iIHtcbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSBcImltYWdlL3BuZ1wiO1xuICAgICAgICBjb25zdCBzbGljZVNpemUgPSA1MTI7XG4gICAgICAgIGNvbnN0IGJ5dGVDaGFyYWN0ZXJzID0gYXRvYihiYXNlNjRVcmkuc3BsaXQoXCI7YmFzZTY0LFwiKVsxXSk7XG4gICAgICAgIGNvbnN0IGJ5dGVBcnJheXMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgPSAwOyBvZmZzZXQgPCBieXRlQ2hhcmFjdGVycy5sZW5ndGg7IG9mZnNldCArPSBzbGljZVNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IHNsaWNlID0gYnl0ZUNoYXJhY3RlcnMuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBzbGljZVNpemUpO1xuICAgICAgICAgICAgY29uc3QgYnl0ZU51bWJlcnMgPSBuZXcgQXJyYXkoc2xpY2UubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xpY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBieXRlTnVtYmVyc1tpXSA9IHNsaWNlLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBieXRlQXJyYXkgPSBuZXcgVWludDhBcnJheShieXRlTnVtYmVycyk7XG4gICAgICAgICAgICBieXRlQXJyYXlzLnB1c2goYnl0ZUFycmF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgQmxvYihieXRlQXJyYXlzLCB7IHR5cGU6IGNvbnRlbnRUeXBlIH0pO1xuICAgIH1cbn1cbiIsIi8qIVxuICogU2lnbmF0dXJlIFBhZCB2NC4wLjAgfCBodHRwczovL2dpdGh1Yi5jb20vc3ppbWVrL3NpZ25hdHVyZV9wYWRcbiAqIChjKSAyMDIxIFN6eW1vbiBOb3dhayB8IFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG5cbmNsYXNzIFBvaW50IHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBwcmVzc3VyZSwgdGltZSkge1xuICAgICAgICBpZiAoaXNOYU4oeCkgfHwgaXNOYU4oeSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUG9pbnQgaXMgaW52YWxpZDogKCR7eH0sICR7eX0pYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54ID0gK3g7XG4gICAgICAgIHRoaXMueSA9ICt5O1xuICAgICAgICB0aGlzLnByZXNzdXJlID0gcHJlc3N1cmUgfHwgMDtcbiAgICAgICAgdGhpcy50aW1lID0gdGltZSB8fCBEYXRlLm5vdygpO1xuICAgIH1cbiAgICBkaXN0YW5jZVRvKHN0YXJ0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy54IC0gc3RhcnQueCwgMikgKyBNYXRoLnBvdyh0aGlzLnkgLSBzdGFydC55LCAyKSk7XG4gICAgfVxuICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICByZXR1cm4gKHRoaXMueCA9PT0gb3RoZXIueCAmJlxuICAgICAgICAgICAgdGhpcy55ID09PSBvdGhlci55ICYmXG4gICAgICAgICAgICB0aGlzLnByZXNzdXJlID09PSBvdGhlci5wcmVzc3VyZSAmJlxuICAgICAgICAgICAgdGhpcy50aW1lID09PSBvdGhlci50aW1lKTtcbiAgICB9XG4gICAgdmVsb2NpdHlGcm9tKHN0YXJ0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWUgIT09IHN0YXJ0LnRpbWVcbiAgICAgICAgICAgID8gdGhpcy5kaXN0YW5jZVRvKHN0YXJ0KSAvICh0aGlzLnRpbWUgLSBzdGFydC50aW1lKVxuICAgICAgICAgICAgOiAwO1xuICAgIH1cbn1cblxuY2xhc3MgQmV6aWVyIHtcbiAgICBjb25zdHJ1Y3RvcihzdGFydFBvaW50LCBjb250cm9sMiwgY29udHJvbDEsIGVuZFBvaW50LCBzdGFydFdpZHRoLCBlbmRXaWR0aCkge1xuICAgICAgICB0aGlzLnN0YXJ0UG9pbnQgPSBzdGFydFBvaW50O1xuICAgICAgICB0aGlzLmNvbnRyb2wyID0gY29udHJvbDI7XG4gICAgICAgIHRoaXMuY29udHJvbDEgPSBjb250cm9sMTtcbiAgICAgICAgdGhpcy5lbmRQb2ludCA9IGVuZFBvaW50O1xuICAgICAgICB0aGlzLnN0YXJ0V2lkdGggPSBzdGFydFdpZHRoO1xuICAgICAgICB0aGlzLmVuZFdpZHRoID0gZW5kV2lkdGg7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tUG9pbnRzKHBvaW50cywgd2lkdGhzKSB7XG4gICAgICAgIGNvbnN0IGMyID0gdGhpcy5jYWxjdWxhdGVDb250cm9sUG9pbnRzKHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl0pLmMyO1xuICAgICAgICBjb25zdCBjMyA9IHRoaXMuY2FsY3VsYXRlQ29udHJvbFBvaW50cyhwb2ludHNbMV0sIHBvaW50c1syXSwgcG9pbnRzWzNdKS5jMTtcbiAgICAgICAgcmV0dXJuIG5ldyBCZXppZXIocG9pbnRzWzFdLCBjMiwgYzMsIHBvaW50c1syXSwgd2lkdGhzLnN0YXJ0LCB3aWR0aHMuZW5kKTtcbiAgICB9XG4gICAgc3RhdGljIGNhbGN1bGF0ZUNvbnRyb2xQb2ludHMoczEsIHMyLCBzMykge1xuICAgICAgICBjb25zdCBkeDEgPSBzMS54IC0gczIueDtcbiAgICAgICAgY29uc3QgZHkxID0gczEueSAtIHMyLnk7XG4gICAgICAgIGNvbnN0IGR4MiA9IHMyLnggLSBzMy54O1xuICAgICAgICBjb25zdCBkeTIgPSBzMi55IC0gczMueTtcbiAgICAgICAgY29uc3QgbTEgPSB7IHg6IChzMS54ICsgczIueCkgLyAyLjAsIHk6IChzMS55ICsgczIueSkgLyAyLjAgfTtcbiAgICAgICAgY29uc3QgbTIgPSB7IHg6IChzMi54ICsgczMueCkgLyAyLjAsIHk6IChzMi55ICsgczMueSkgLyAyLjAgfTtcbiAgICAgICAgY29uc3QgbDEgPSBNYXRoLnNxcnQoZHgxICogZHgxICsgZHkxICogZHkxKTtcbiAgICAgICAgY29uc3QgbDIgPSBNYXRoLnNxcnQoZHgyICogZHgyICsgZHkyICogZHkyKTtcbiAgICAgICAgY29uc3QgZHhtID0gbTEueCAtIG0yLng7XG4gICAgICAgIGNvbnN0IGR5bSA9IG0xLnkgLSBtMi55O1xuICAgICAgICBjb25zdCBrID0gbDIgLyAobDEgKyBsMik7XG4gICAgICAgIGNvbnN0IGNtID0geyB4OiBtMi54ICsgZHhtICogaywgeTogbTIueSArIGR5bSAqIGsgfTtcbiAgICAgICAgY29uc3QgdHggPSBzMi54IC0gY20ueDtcbiAgICAgICAgY29uc3QgdHkgPSBzMi55IC0gY20ueTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGMxOiBuZXcgUG9pbnQobTEueCArIHR4LCBtMS55ICsgdHkpLFxuICAgICAgICAgICAgYzI6IG5ldyBQb2ludChtMi54ICsgdHgsIG0yLnkgKyB0eSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxlbmd0aCgpIHtcbiAgICAgICAgY29uc3Qgc3RlcHMgPSAxMDtcbiAgICAgICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgICAgIGxldCBweDtcbiAgICAgICAgbGV0IHB5O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzdGVwczsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gaSAvIHN0ZXBzO1xuICAgICAgICAgICAgY29uc3QgY3ggPSB0aGlzLnBvaW50KHQsIHRoaXMuc3RhcnRQb2ludC54LCB0aGlzLmNvbnRyb2wxLngsIHRoaXMuY29udHJvbDIueCwgdGhpcy5lbmRQb2ludC54KTtcbiAgICAgICAgICAgIGNvbnN0IGN5ID0gdGhpcy5wb2ludCh0LCB0aGlzLnN0YXJ0UG9pbnQueSwgdGhpcy5jb250cm9sMS55LCB0aGlzLmNvbnRyb2wyLnksIHRoaXMuZW5kUG9pbnQueSk7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB4ZGlmZiA9IGN4IC0gcHg7XG4gICAgICAgICAgICAgICAgY29uc3QgeWRpZmYgPSBjeSAtIHB5O1xuICAgICAgICAgICAgICAgIGxlbmd0aCArPSBNYXRoLnNxcnQoeGRpZmYgKiB4ZGlmZiArIHlkaWZmICogeWRpZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHggPSBjeDtcbiAgICAgICAgICAgIHB5ID0gY3k7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG4gICAgcG9pbnQodCwgc3RhcnQsIGMxLCBjMiwgZW5kKSB7XG4gICAgICAgIHJldHVybiAoc3RhcnQgKiAoMS4wIC0gdCkgKiAoMS4wIC0gdCkgKiAoMS4wIC0gdCkpXG4gICAgICAgICAgICArICgzLjAgKiBjMSAqICgxLjAgLSB0KSAqICgxLjAgLSB0KSAqIHQpXG4gICAgICAgICAgICArICgzLjAgKiBjMiAqICgxLjAgLSB0KSAqIHQgKiB0KVxuICAgICAgICAgICAgKyAoZW5kICogdCAqIHQgKiB0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRocm90dGxlKGZuLCB3YWl0ID0gMjUwKSB7XG4gICAgbGV0IHByZXZpb3VzID0gMDtcbiAgICBsZXQgdGltZW91dCA9IG51bGw7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBsZXQgc3RvcmVkQ29udGV4dDtcbiAgICBsZXQgc3RvcmVkQXJncztcbiAgICBjb25zdCBsYXRlciA9ICgpID0+IHtcbiAgICAgICAgcHJldmlvdXMgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgcmVzdWx0ID0gZm4uYXBwbHkoc3RvcmVkQ29udGV4dCwgc3RvcmVkQXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgc3RvcmVkQ29udGV4dCA9IG51bGw7XG4gICAgICAgICAgICBzdG9yZWRBcmdzID0gW107XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiB3cmFwcGVyKC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgICAgIHN0b3JlZENvbnRleHQgPSB0aGlzO1xuICAgICAgICBzdG9yZWRBcmdzID0gYXJncztcbiAgICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgICAgICByZXN1bHQgPSBmbi5hcHBseShzdG9yZWRDb250ZXh0LCBzdG9yZWRBcmdzKTtcbiAgICAgICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHN0b3JlZENvbnRleHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHN0b3JlZEFyZ3MgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgdGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn1cblxuY2xhc3MgU2lnbmF0dXJlUGFkIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuICAgIGNvbnN0cnVjdG9yKGNhbnZhcywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9oYW5kbGVNb3VzZURvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5idXR0b25zID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhd25pbmdTdHJva2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0cm9rZUJlZ2luKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlTW91c2VNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZHJhd25pbmdTdHJva2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VNb3ZlVXBkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlTW91c2VVcCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbnMgPT09IDEgJiYgdGhpcy5fZHJhd25pbmdTdHJva2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3bmluZ1N0cm9rZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0cm9rZUVuZChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZVRvdWNoU3RhcnQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0cm9rZUJlZ2luKHRvdWNoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlVG91Y2hNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgdG91Y2ggPSBldmVudC50YXJnZXRUb3VjaGVzWzBdO1xuICAgICAgICAgICAgdGhpcy5fc3Ryb2tlTW92ZVVwZGF0ZSh0b3VjaCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZVRvdWNoRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3YXNDYW52YXNUb3VjaGVkID0gZXZlbnQudGFyZ2V0ID09PSB0aGlzLmNhbnZhcztcbiAgICAgICAgICAgIGlmICh3YXNDYW52YXNUb3VjaGVkKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0cm9rZUVuZCh0b3VjaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZVBvaW50ZXJTdGFydCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZHJhd25pbmdTdHJva2UgPSB0cnVlO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuX3N0cm9rZUJlZ2luKGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlUG9pbnRlck1vdmUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kcmF3bmluZ1N0cm9rZSkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Ryb2tlTW92ZVVwZGF0ZShldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2hhbmRsZVBvaW50ZXJFbmQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2RyYXduaW5nU3Ryb2tlID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCB3YXNDYW52YXNUb3VjaGVkID0gZXZlbnQudGFyZ2V0ID09PSB0aGlzLmNhbnZhcztcbiAgICAgICAgICAgIGlmICh3YXNDYW52YXNUb3VjaGVkKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VFbmQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnZlbG9jaXR5RmlsdGVyV2VpZ2h0ID0gb3B0aW9ucy52ZWxvY2l0eUZpbHRlcldlaWdodCB8fCAwLjc7XG4gICAgICAgIHRoaXMubWluV2lkdGggPSBvcHRpb25zLm1pbldpZHRoIHx8IDAuNTtcbiAgICAgICAgdGhpcy5tYXhXaWR0aCA9IG9wdGlvbnMubWF4V2lkdGggfHwgMi41O1xuICAgICAgICB0aGlzLnRocm90dGxlID0gKCd0aHJvdHRsZScgaW4gb3B0aW9ucyA/IG9wdGlvbnMudGhyb3R0bGUgOiAxNik7XG4gICAgICAgIHRoaXMubWluRGlzdGFuY2UgPSAoJ21pbkRpc3RhbmNlJyBpbiBvcHRpb25zID8gb3B0aW9ucy5taW5EaXN0YW5jZSA6IDUpO1xuICAgICAgICB0aGlzLmRvdFNpemUgPSBvcHRpb25zLmRvdFNpemUgfHwgMDtcbiAgICAgICAgdGhpcy5wZW5Db2xvciA9IG9wdGlvbnMucGVuQ29sb3IgfHwgJ2JsYWNrJztcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLmJhY2tncm91bmRDb2xvciB8fCAncmdiYSgwLDAsMCwwKSc7XG4gICAgICAgIHRoaXMuX3N0cm9rZU1vdmVVcGRhdGUgPSB0aGlzLnRocm90dGxlXG4gICAgICAgICAgICA/IHRocm90dGxlKFNpZ25hdHVyZVBhZC5wcm90b3R5cGUuX3N0cm9rZVVwZGF0ZSwgdGhpcy50aHJvdHRsZSlcbiAgICAgICAgICAgIDogU2lnbmF0dXJlUGFkLnByb3RvdHlwZS5fc3Ryb2tlVXBkYXRlO1xuICAgICAgICB0aGlzLl9jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLm9uKCk7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICBjb25zdCB7IF9jdHg6IGN0eCwgY2FudmFzIH0gPSB0aGlzO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuX2RhdGEgPSBbXTtcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgICAgdGhpcy5faXNFbXB0eSA9IHRydWU7XG4gICAgfVxuICAgIGZyb21EYXRhVVJMKGRhdGFVcmwsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGNvbnN0IHJhdGlvID0gb3B0aW9ucy5yYXRpbyB8fCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBvcHRpb25zLndpZHRoIHx8IHRoaXMuY2FudmFzLndpZHRoIC8gcmF0aW87XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCB0aGlzLmNhbnZhcy5oZWlnaHQgLyByYXRpbztcbiAgICAgICAgICAgIGNvbnN0IHhPZmZzZXQgPSBvcHRpb25zLnhPZmZzZXQgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IHlPZmZzZXQgPSBvcHRpb25zLnlPZmZzZXQgfHwgMDtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3R4LmRyYXdJbWFnZShpbWFnZSwgeE9mZnNldCwgeU9mZnNldCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltYWdlLmNyb3NzT3JpZ2luID0gJ2Fub255bW91cyc7XG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBkYXRhVXJsO1xuICAgICAgICAgICAgdGhpcy5faXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdG9EYXRhVVJMKHR5cGUgPSAnaW1hZ2UvcG5nJywgZW5jb2Rlck9wdGlvbnMpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdpbWFnZS9zdmcreG1sJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdG9TVkcoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLnRvRGF0YVVSTCh0eXBlLCBlbmNvZGVyT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb24oKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnRvdWNoQWN0aW9uID0gJ25vbmUnO1xuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5tc1RvdWNoQWN0aW9uID0gJ25vbmUnO1xuICAgICAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlUG9pbnRlckV2ZW50cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlTW91c2VFdmVudHMoKTtcbiAgICAgICAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVUb3VjaEV2ZW50cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9mZigpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUudG91Y2hBY3Rpb24gPSAnYXV0byc7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm1zVG91Y2hBY3Rpb24gPSAnYXV0byc7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdGhpcy5faGFuZGxlUG9pbnRlclN0YXJ0KTtcbiAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCB0aGlzLl9oYW5kbGVQb2ludGVyTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuX2hhbmRsZVBvaW50ZXJFbmQpO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9oYW5kbGVNb3VzZURvd24pO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlTW91c2VVcCk7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9oYW5kbGVUb3VjaFN0YXJ0KTtcbiAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlVG91Y2hNb3ZlKTtcbiAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVUb3VjaEVuZCk7XG4gICAgfVxuICAgIGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0VtcHR5O1xuICAgIH1cbiAgICBmcm9tRGF0YShwb2ludEdyb3VwcywgeyBjbGVhciA9IHRydWUgfSA9IHt9KSB7XG4gICAgICAgIGlmIChjbGVhcikge1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Zyb21EYXRhKHBvaW50R3JvdXBzLCB0aGlzLl9kcmF3Q3VydmUuYmluZCh0aGlzKSwgdGhpcy5fZHJhd0RvdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fZGF0YSA9IGNsZWFyID8gcG9pbnRHcm91cHMgOiB0aGlzLl9kYXRhLmNvbmNhdChwb2ludEdyb3Vwcyk7XG4gICAgfVxuICAgIHRvRGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gICAgfVxuICAgIF9zdHJva2VCZWdpbihldmVudCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdiZWdpblN0cm9rZScsIHsgZGV0YWlsOiBldmVudCB9KSk7XG4gICAgICAgIGNvbnN0IG5ld1BvaW50R3JvdXAgPSB7XG4gICAgICAgICAgICBkb3RTaXplOiB0aGlzLmRvdFNpemUsXG4gICAgICAgICAgICBtaW5XaWR0aDogdGhpcy5taW5XaWR0aCxcbiAgICAgICAgICAgIG1heFdpZHRoOiB0aGlzLm1heFdpZHRoLFxuICAgICAgICAgICAgcGVuQ29sb3I6IHRoaXMucGVuQ29sb3IsXG4gICAgICAgICAgICBwb2ludHM6IFtdLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9kYXRhLnB1c2gobmV3UG9pbnRHcm91cCk7XG4gICAgICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgICAgIHRoaXMuX3N0cm9rZVVwZGF0ZShldmVudCk7XG4gICAgfVxuICAgIF9zdHJva2VVcGRhdGUoZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9zdHJva2VCZWdpbihldmVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnYmVmb3JlVXBkYXRlU3Ryb2tlJywgeyBkZXRhaWw6IGV2ZW50IH0pKTtcbiAgICAgICAgY29uc3QgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBjb25zdCBwcmVzc3VyZSA9IGV2ZW50LnByZXNzdXJlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gZXZlbnQucHJlc3N1cmVcbiAgICAgICAgICAgIDogZXZlbnQuZm9yY2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgID8gZXZlbnQuZm9yY2VcbiAgICAgICAgICAgICAgICA6IDA7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5fY3JlYXRlUG9pbnQoeCwgeSwgcHJlc3N1cmUpO1xuICAgICAgICBjb25zdCBsYXN0UG9pbnRHcm91cCA9IHRoaXMuX2RhdGFbdGhpcy5fZGF0YS5sZW5ndGggLSAxXTtcbiAgICAgICAgY29uc3QgbGFzdFBvaW50cyA9IGxhc3RQb2ludEdyb3VwLnBvaW50cztcbiAgICAgICAgY29uc3QgbGFzdFBvaW50ID0gbGFzdFBvaW50cy5sZW5ndGggPiAwICYmIGxhc3RQb2ludHNbbGFzdFBvaW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgY29uc3QgaXNMYXN0UG9pbnRUb29DbG9zZSA9IGxhc3RQb2ludFxuICAgICAgICAgICAgPyBwb2ludC5kaXN0YW5jZVRvKGxhc3RQb2ludCkgPD0gdGhpcy5taW5EaXN0YW5jZVxuICAgICAgICAgICAgOiBmYWxzZTtcbiAgICAgICAgY29uc3QgeyBwZW5Db2xvciwgZG90U2l6ZSwgbWluV2lkdGgsIG1heFdpZHRoIH0gPSBsYXN0UG9pbnRHcm91cDtcbiAgICAgICAgaWYgKCFsYXN0UG9pbnQgfHwgIShsYXN0UG9pbnQgJiYgaXNMYXN0UG9pbnRUb29DbG9zZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnZlID0gdGhpcy5fYWRkUG9pbnQocG9pbnQpO1xuICAgICAgICAgICAgaWYgKCFsYXN0UG9pbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3RG90KHBvaW50LCB7XG4gICAgICAgICAgICAgICAgICAgIHBlbkNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXJ2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdDdXJ2ZShjdXJ2ZSwge1xuICAgICAgICAgICAgICAgICAgICBwZW5Db2xvcixcbiAgICAgICAgICAgICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIG1heFdpZHRoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFBvaW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0aW1lOiBwb2ludC50aW1lLFxuICAgICAgICAgICAgICAgIHg6IHBvaW50LngsXG4gICAgICAgICAgICAgICAgeTogcG9pbnQueSxcbiAgICAgICAgICAgICAgICBwcmVzc3VyZTogcG9pbnQucHJlc3N1cmUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdhZnRlclVwZGF0ZVN0cm9rZScsIHsgZGV0YWlsOiBldmVudCB9KSk7XG4gICAgfVxuICAgIF9zdHJva2VFbmQoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fc3Ryb2tlVXBkYXRlKGV2ZW50KTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZW5kU3Ryb2tlJywgeyBkZXRhaWw6IGV2ZW50IH0pKTtcbiAgICB9XG4gICAgX2hhbmRsZVBvaW50ZXJFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuX2RyYXduaW5nU3Ryb2tlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdGhpcy5faGFuZGxlUG9pbnRlclN0YXJ0KTtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCB0aGlzLl9oYW5kbGVQb2ludGVyTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuX2hhbmRsZVBvaW50ZXJFbmQpO1xuICAgIH1cbiAgICBfaGFuZGxlTW91c2VFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuX2RyYXduaW5nU3Ryb2tlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZU1vdXNlRG93bik7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZU1vdXNlTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKTtcbiAgICB9XG4gICAgX2hhbmRsZVRvdWNoRXZlbnRzKCkge1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlVG91Y2hTdGFydCk7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZVRvdWNoTW92ZSk7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlVG91Y2hFbmQpO1xuICAgIH1cbiAgICBfcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuX2xhc3RQb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5fbGFzdFZlbG9jaXR5ID0gMDtcbiAgICAgICAgdGhpcy5fbGFzdFdpZHRoID0gKHRoaXMubWluV2lkdGggKyB0aGlzLm1heFdpZHRoKSAvIDI7XG4gICAgICAgIHRoaXMuX2N0eC5maWxsU3R5bGUgPSB0aGlzLnBlbkNvbG9yO1xuICAgIH1cbiAgICBfY3JlYXRlUG9pbnQoeCwgeSwgcHJlc3N1cmUpIHtcbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KHggLSByZWN0LmxlZnQsIHkgLSByZWN0LnRvcCwgcHJlc3N1cmUsIG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICB9XG4gICAgX2FkZFBvaW50KHBvaW50KSB7XG4gICAgICAgIGNvbnN0IHsgX2xhc3RQb2ludHMgfSA9IHRoaXM7XG4gICAgICAgIF9sYXN0UG9pbnRzLnB1c2gocG9pbnQpO1xuICAgICAgICBpZiAoX2xhc3RQb2ludHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgaWYgKF9sYXN0UG9pbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgIF9sYXN0UG9pbnRzLnVuc2hpZnQoX2xhc3RQb2ludHNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgd2lkdGhzID0gdGhpcy5fY2FsY3VsYXRlQ3VydmVXaWR0aHMoX2xhc3RQb2ludHNbMV0sIF9sYXN0UG9pbnRzWzJdKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnZlID0gQmV6aWVyLmZyb21Qb2ludHMoX2xhc3RQb2ludHMsIHdpZHRocyk7XG4gICAgICAgICAgICBfbGFzdFBvaW50cy5zaGlmdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGN1cnZlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBfY2FsY3VsYXRlQ3VydmVXaWR0aHMoc3RhcnRQb2ludCwgZW5kUG9pbnQpIHtcbiAgICAgICAgY29uc3QgdmVsb2NpdHkgPSB0aGlzLnZlbG9jaXR5RmlsdGVyV2VpZ2h0ICogZW5kUG9pbnQudmVsb2NpdHlGcm9tKHN0YXJ0UG9pbnQpICtcbiAgICAgICAgICAgICgxIC0gdGhpcy52ZWxvY2l0eUZpbHRlcldlaWdodCkgKiB0aGlzLl9sYXN0VmVsb2NpdHk7XG4gICAgICAgIGNvbnN0IG5ld1dpZHRoID0gdGhpcy5fc3Ryb2tlV2lkdGgodmVsb2NpdHkpO1xuICAgICAgICBjb25zdCB3aWR0aHMgPSB7XG4gICAgICAgICAgICBlbmQ6IG5ld1dpZHRoLFxuICAgICAgICAgICAgc3RhcnQ6IHRoaXMuX2xhc3RXaWR0aCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fbGFzdFZlbG9jaXR5ID0gdmVsb2NpdHk7XG4gICAgICAgIHRoaXMuX2xhc3RXaWR0aCA9IG5ld1dpZHRoO1xuICAgICAgICByZXR1cm4gd2lkdGhzO1xuICAgIH1cbiAgICBfc3Ryb2tlV2lkdGgodmVsb2NpdHkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHRoaXMubWF4V2lkdGggLyAodmVsb2NpdHkgKyAxKSwgdGhpcy5taW5XaWR0aCk7XG4gICAgfVxuICAgIF9kcmF3Q3VydmVTZWdtZW50KHgsIHksIHdpZHRoKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5KTtcbiAgICAgICAgY3R4LmFyYyh4LCB5LCB3aWR0aCwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgdGhpcy5faXNFbXB0eSA9IGZhbHNlO1xuICAgIH1cbiAgICBfZHJhd0N1cnZlKGN1cnZlLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgY29uc3Qgd2lkdGhEZWx0YSA9IGN1cnZlLmVuZFdpZHRoIC0gY3VydmUuc3RhcnRXaWR0aDtcbiAgICAgICAgY29uc3QgZHJhd1N0ZXBzID0gTWF0aC5jZWlsKGN1cnZlLmxlbmd0aCgpKSAqIDI7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdGlvbnMucGVuQ29sb3I7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZHJhd1N0ZXBzOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSBpIC8gZHJhd1N0ZXBzO1xuICAgICAgICAgICAgY29uc3QgdHQgPSB0ICogdDtcbiAgICAgICAgICAgIGNvbnN0IHR0dCA9IHR0ICogdDtcbiAgICAgICAgICAgIGNvbnN0IHUgPSAxIC0gdDtcbiAgICAgICAgICAgIGNvbnN0IHV1ID0gdSAqIHU7XG4gICAgICAgICAgICBjb25zdCB1dXUgPSB1dSAqIHU7XG4gICAgICAgICAgICBsZXQgeCA9IHV1dSAqIGN1cnZlLnN0YXJ0UG9pbnQueDtcbiAgICAgICAgICAgIHggKz0gMyAqIHV1ICogdCAqIGN1cnZlLmNvbnRyb2wxLng7XG4gICAgICAgICAgICB4ICs9IDMgKiB1ICogdHQgKiBjdXJ2ZS5jb250cm9sMi54O1xuICAgICAgICAgICAgeCArPSB0dHQgKiBjdXJ2ZS5lbmRQb2ludC54O1xuICAgICAgICAgICAgbGV0IHkgPSB1dXUgKiBjdXJ2ZS5zdGFydFBvaW50Lnk7XG4gICAgICAgICAgICB5ICs9IDMgKiB1dSAqIHQgKiBjdXJ2ZS5jb250cm9sMS55O1xuICAgICAgICAgICAgeSArPSAzICogdSAqIHR0ICogY3VydmUuY29udHJvbDIueTtcbiAgICAgICAgICAgIHkgKz0gdHR0ICogY3VydmUuZW5kUG9pbnQueTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oY3VydmUuc3RhcnRXaWR0aCArIHR0dCAqIHdpZHRoRGVsdGEsIG9wdGlvbnMubWF4V2lkdGgpO1xuICAgICAgICAgICAgdGhpcy5fZHJhd0N1cnZlU2VnbWVudCh4LCB5LCB3aWR0aCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICBjdHguZmlsbCgpO1xuICAgIH1cbiAgICBfZHJhd0RvdChwb2ludCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9jdHg7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gb3B0aW9ucy5kb3RTaXplID4gMFxuICAgICAgICAgICAgPyBvcHRpb25zLmRvdFNpemVcbiAgICAgICAgICAgIDogKG9wdGlvbnMubWluV2lkdGggKyBvcHRpb25zLm1heFdpZHRoKSAvIDI7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5fZHJhd0N1cnZlU2VnbWVudChwb2ludC54LCBwb2ludC55LCB3aWR0aCk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdGlvbnMucGVuQ29sb3I7XG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgfVxuICAgIF9mcm9tRGF0YShwb2ludEdyb3VwcywgZHJhd0N1cnZlLCBkcmF3RG90KSB7XG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgcG9pbnRHcm91cHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgcGVuQ29sb3IsIGRvdFNpemUsIG1pbldpZHRoLCBtYXhXaWR0aCwgcG9pbnRzIH0gPSBncm91cDtcbiAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9pbnRzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2ljUG9pbnQgPSBwb2ludHNbal07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KGJhc2ljUG9pbnQueCwgYmFzaWNQb2ludC55LCBiYXNpY1BvaW50LnByZXNzdXJlLCBiYXNpY1BvaW50LnRpbWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlbkNvbG9yID0gcGVuQ29sb3I7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnZlID0gdGhpcy5fYWRkUG9pbnQocG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VydmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdDdXJ2ZShjdXJ2ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbkNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgICAgICAgICAgICAgZHJhd0RvdChwb2ludHNbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgcGVuQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICAgICAgIG1pbldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfdG9TVkcoKSB7XG4gICAgICAgIGNvbnN0IHBvaW50R3JvdXBzID0gdGhpcy5fZGF0YTtcbiAgICAgICAgY29uc3QgcmF0aW8gPSBNYXRoLm1heCh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxLCAxKTtcbiAgICAgICAgY29uc3QgbWluWCA9IDA7XG4gICAgICAgIGNvbnN0IG1pblkgPSAwO1xuICAgICAgICBjb25zdCBtYXhYID0gdGhpcy5jYW52YXMud2lkdGggLyByYXRpbztcbiAgICAgICAgY29uc3QgbWF4WSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHJhdGlvO1xuICAgICAgICBjb25zdCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3N2ZycpO1xuICAgICAgICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMuY2FudmFzLndpZHRoLnRvU3RyaW5nKCkpO1xuICAgICAgICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmNhbnZhcy5oZWlnaHQudG9TdHJpbmcoKSk7XG4gICAgICAgIHRoaXMuX2Zyb21EYXRhKHBvaW50R3JvdXBzLCAoY3VydmUsIHsgcGVuQ29sb3IgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BhdGgnKTtcbiAgICAgICAgICAgIGlmICghaXNOYU4oY3VydmUuY29udHJvbDEueCkgJiZcbiAgICAgICAgICAgICAgICAhaXNOYU4oY3VydmUuY29udHJvbDEueSkgJiZcbiAgICAgICAgICAgICAgICAhaXNOYU4oY3VydmUuY29udHJvbDIueCkgJiZcbiAgICAgICAgICAgICAgICAhaXNOYU4oY3VydmUuY29udHJvbDIueSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyID0gYE0gJHtjdXJ2ZS5zdGFydFBvaW50LngudG9GaXhlZCgzKX0sJHtjdXJ2ZS5zdGFydFBvaW50LnkudG9GaXhlZCgzKX0gYCArXG4gICAgICAgICAgICAgICAgICAgIGBDICR7Y3VydmUuY29udHJvbDEueC50b0ZpeGVkKDMpfSwke2N1cnZlLmNvbnRyb2wxLnkudG9GaXhlZCgzKX0gYCArXG4gICAgICAgICAgICAgICAgICAgIGAke2N1cnZlLmNvbnRyb2wyLngudG9GaXhlZCgzKX0sJHtjdXJ2ZS5jb250cm9sMi55LnRvRml4ZWQoMyl9IGAgK1xuICAgICAgICAgICAgICAgICAgICBgJHtjdXJ2ZS5lbmRQb2ludC54LnRvRml4ZWQoMyl9LCR7Y3VydmUuZW5kUG9pbnQueS50b0ZpeGVkKDMpfWA7XG4gICAgICAgICAgICAgICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ2QnLCBhdHRyKTtcbiAgICAgICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywgKGN1cnZlLmVuZFdpZHRoICogMi4yNSkudG9GaXhlZCgzKSk7XG4gICAgICAgICAgICAgICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsIHBlbkNvbG9yKTtcbiAgICAgICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnZmlsbCcsICdub25lJyk7XG4gICAgICAgICAgICAgICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS1saW5lY2FwJywgJ3JvdW5kJyk7XG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZENoaWxkKHBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAocG9pbnQsIHsgcGVuQ29sb3IsIGRvdFNpemUsIG1pbldpZHRoLCBtYXhXaWR0aCB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaXJjbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjaXJjbGUnKTtcbiAgICAgICAgICAgIGNvbnN0IHNpemUgPSBkb3RTaXplID4gMCA/IGRvdFNpemUgOiAobWluV2lkdGggKyBtYXhXaWR0aCkgLyAyO1xuICAgICAgICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSgncicsIHNpemUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdjeCcsIHBvaW50LngudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdjeScsIHBvaW50LnkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdmaWxsJywgcGVuQ29sb3IpO1xuICAgICAgICAgICAgc3ZnLmFwcGVuZENoaWxkKGNpcmNsZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwcmVmaXggPSAnZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwnO1xuICAgICAgICBjb25zdCBoZWFkZXIgPSAnPHN2ZycgK1xuICAgICAgICAgICAgJyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCInICtcbiAgICAgICAgICAgICcgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCInICtcbiAgICAgICAgICAgIGAgdmlld0JveD1cIiR7bWluWH0gJHttaW5ZfSAke3RoaXMuY2FudmFzLndpZHRofSAke3RoaXMuY2FudmFzLmhlaWdodH1cImAgK1xuICAgICAgICAgICAgYCB3aWR0aD1cIiR7bWF4WH1cImAgK1xuICAgICAgICAgICAgYCBoZWlnaHQ9XCIke21heFl9XCJgICtcbiAgICAgICAgICAgICc+JztcbiAgICAgICAgbGV0IGJvZHkgPSBzdmcuaW5uZXJIVE1MO1xuICAgICAgICBpZiAoYm9keSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBkdW1teSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2R1bW15Jyk7XG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IHN2Zy5jaGlsZE5vZGVzO1xuICAgICAgICAgICAgZHVtbXkuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZHVtbXkuYXBwZW5kQ2hpbGQobm9kZXNbaV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvZHkgPSBkdW1teS5pbm5lckhUTUw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZm9vdGVyID0gJzwvc3ZnPic7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBoZWFkZXIgKyBib2R5ICsgZm9vdGVyO1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgYnRvYShkYXRhKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFNpZ25hdHVyZVBhZCBhcyBkZWZhdWx0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaWduYXR1cmVfcGFkLmpzLm1hcFxuIiwiLyohXG5cdENvcHlyaWdodCAoYykgMjAxOCBKZWQgV2F0c29uLlxuXHRMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHNlZVxuXHRodHRwOi8vamVkd2F0c29uLmdpdGh1Yi5pby9jbGFzc25hbWVzXG4qL1xuLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4oZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGhhc093biA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5cdGZ1bmN0aW9uIGNsYXNzTmFtZXMgKCkge1xuXHRcdHZhciBjbGFzc2VzID0gJyc7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdGlmIChhcmcpIHtcblx0XHRcdFx0Y2xhc3NlcyA9IGFwcGVuZENsYXNzKGNsYXNzZXMsIHBhcnNlVmFsdWUoYXJnKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXM7XG5cdH1cblxuXHRmdW5jdGlvbiBwYXJzZVZhbHVlIChhcmcpIHtcblx0XHRpZiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcblx0XHRcdHJldHVybiBhcmc7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBhcmcgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKTtcblx0XHR9XG5cblx0XHRpZiAoYXJnLnRvU3RyaW5nICE9PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nICYmICFhcmcudG9TdHJpbmcudG9TdHJpbmcoKS5pbmNsdWRlcygnW25hdGl2ZSBjb2RlXScpKSB7XG5cdFx0XHRyZXR1cm4gYXJnLnRvU3RyaW5nKCk7XG5cdFx0fVxuXG5cdFx0dmFyIGNsYXNzZXMgPSAnJztcblxuXHRcdGZvciAodmFyIGtleSBpbiBhcmcpIHtcblx0XHRcdGlmIChoYXNPd24uY2FsbChhcmcsIGtleSkgJiYgYXJnW2tleV0pIHtcblx0XHRcdFx0Y2xhc3NlcyA9IGFwcGVuZENsYXNzKGNsYXNzZXMsIGtleSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXM7XG5cdH1cblxuXHRmdW5jdGlvbiBhcHBlbmRDbGFzcyAodmFsdWUsIG5ld0NsYXNzKSB7XG5cdFx0aWYgKCFuZXdDbGFzcykge1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblx0XG5cdFx0aWYgKHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWUgKyAnICcgKyBuZXdDbGFzcztcblx0XHR9XG5cdFxuXHRcdHJldHVybiB2YWx1ZSArIG5ld0NsYXNzO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0Y2xhc3NOYW1lcy5kZWZhdWx0ID0gY2xhc3NOYW1lcztcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzTmFtZXM7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIHJlZ2lzdGVyIGFzICdjbGFzc25hbWVzJywgY29uc2lzdGVudCB3aXRoIG5wbSBwYWNrYWdlIG5hbWVcblx0XHRkZWZpbmUoJ2NsYXNzbmFtZXMnLCBbXSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZXM7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmNsYXNzTmFtZXMgPSBjbGFzc05hbWVzO1xuXHR9XG59KCkpO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVHbG9iYWw7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3Q7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBub3c7XG4iLCIvKiogVXNlZCB0byBtYXRjaCBhIHNpbmdsZSB3aGl0ZXNwYWNlIGNoYXJhY3Rlci4gKi9cbnZhciByZVdoaXRlc3BhY2UgPSAvXFxzLztcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLnRyaW1gIGFuZCBgXy50cmltRW5kYCB0byBnZXQgdGhlIGluZGV4IG9mIHRoZSBsYXN0IG5vbi13aGl0ZXNwYWNlXG4gKiBjaGFyYWN0ZXIgb2YgYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBpbnNwZWN0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGxhc3Qgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiB0cmltbWVkRW5kSW5kZXgoc3RyaW5nKSB7XG4gIHZhciBpbmRleCA9IHN0cmluZy5sZW5ndGg7XG5cbiAgd2hpbGUgKGluZGV4LS0gJiYgcmVXaGl0ZXNwYWNlLnRlc3Qoc3RyaW5nLmNoYXJBdChpbmRleCkpKSB7fVxuICByZXR1cm4gaW5kZXg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdHJpbW1lZEVuZEluZGV4O1xuIiwidmFyIHRyaW1tZWRFbmRJbmRleCA9IHJlcXVpcmUoJy4vX3RyaW1tZWRFbmRJbmRleCcpO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltU3RhcnQgPSAvXlxccysvO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRyaW1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gdHJpbS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHRyaW1tZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVHJpbShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZ1xuICAgID8gc3RyaW5nLnNsaWNlKDAsIHRyaW1tZWRFbmRJbmRleChzdHJpbmcpICsgMSkucmVwbGFjZShyZVRyaW1TdGFydCwgJycpXG4gICAgOiBzdHJpbmc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRyaW07XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ltYm9sO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3ltYm9sO1xuIiwidmFyIGJhc2VUcmltID0gcmVxdWlyZSgnLi9fYmFzZVRyaW0nKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IGJhc2VUcmltKHZhbHVlKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9OdW1iZXI7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgbm93ID0gcmVxdWlyZSgnLi9ub3cnKSxcbiAgICB0b051bWJlciA9IHJlcXVpcmUoJy4vdG9OdW1iZXInKTtcblxuLyoqIEVycm9yIG1lc3NhZ2UgY29uc3RhbnRzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHRpbWVXYWl0aW5nID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgcmV0dXJuIG1heGluZ1xuICAgICAgPyBuYXRpdmVNaW4odGltZVdhaXRpbmcsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKVxuICAgICAgOiB0aW1lV2FpdGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZEludm9rZSh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZTtcblxuICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgLy8gdHJhaWxpbmcgZWRnZSwgdGhlIHN5c3RlbSB0aW1lIGhhcyBnb25lIGJhY2t3YXJkcyBhbmQgd2UncmUgdHJlYXRpbmdcbiAgICAvLyBpdCBhcyB0aGUgdHJhaWxpbmcgZWRnZSwgb3Igd2UndmUgaGl0IHRoZSBgbWF4V2FpdGAgbGltaXQuXG4gICAgcmV0dXJuIChsYXN0Q2FsbFRpbWUgPT09IHVuZGVmaW5lZCB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICB0aW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBpbnZva2UgaWYgd2UgaGF2ZSBgbGFzdEFyZ3NgIHdoaWNoIG1lYW5zIGBmdW5jYCBoYXMgYmVlblxuICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGlmICh0cmFpbGluZyAmJiBsYXN0QXJncykge1xuICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgfVxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBpZiAodGltZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgfVxuICAgIGxhc3RJbnZva2VUaW1lID0gMDtcbiAgICBsYXN0QXJncyA9IGxhc3RDYWxsVGltZSA9IGxhc3RUaGlzID0gdGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHJldHVybiB0aW1lcklkID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiB0cmFpbGluZ0VkZ2Uobm93KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2VkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCksXG4gICAgICAgIGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICBsYXN0VGhpcyA9IHRoaXM7XG4gICAgbGFzdENhbGxUaW1lID0gdGltZTtcblxuICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nRWRnZShsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heGluZykge1xuICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVib3VuY2U7XG4iLCJ2YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBFcnJvciBtZXNzYWdlIGNvbnN0YW50cy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRocm90dGxlZCBmdW5jdGlvbiB0aGF0IG9ubHkgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmNlIHBlclxuICogZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGBcbiAqIG1ldGhvZCB0byBjYW5jZWwgZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG9cbiAqIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYFxuICogc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YFxuICogdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZVxuICogdGhyb3R0bGVkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gcmV0dXJuIHRoZVxuICogcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLnRocm90dGxlYCBhbmQgYF8uZGVib3VuY2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCkpO1xuICpcbiAqIC8vIEludm9rZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzLlxuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7ICd0cmFpbGluZyc6IGZhbHNlIH0pO1xuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIHRocm90dGxlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyB0aHJvdHRsZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRocm90dGxlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwge1xuICAgICdsZWFkaW5nJzogbGVhZGluZyxcbiAgICAnbWF4V2FpdCc6IHdhaXQsXG4gICAgJ3RyYWlsaW5nJzogdHJhaWxpbmdcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCJpbXBvcnQgUmVhY3Qse2lzVmFsaWRFbGVtZW50LGNyZWF0ZVJlZixjbG9uZUVsZW1lbnQsUHVyZUNvbXBvbmVudCxDb21wb25lbnQsZm9yd2FyZFJlZix1c2VSZWYsdXNlU3RhdGUsdXNlQ2FsbGJhY2ssdXNlRWZmZWN0fWZyb20ncmVhY3QnO2ltcG9ydCB7ZmluZERPTU5vZGV9ZnJvbSdyZWFjdC1kb20nO2ltcG9ydCBkZWJvdW5jZSBmcm9tJ2xvZGFzaC9kZWJvdW5jZSc7aW1wb3J0IHRocm90dGxlIGZyb20nbG9kYXNoL3Rocm90dGxlJzsvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UsIFN1cHByZXNzZWRFcnJvciwgU3ltYm9sICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG52YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG50eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcclxuICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcclxufTt2YXIgcGF0Y2hSZXNpemVDYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNpemVDYWxsYmFjaywgcmVmcmVzaE1vZGUsIHJlZnJlc2hSYXRlLCByZWZyZXNoT3B0aW9ucykge1xuICAgIHN3aXRjaCAocmVmcmVzaE1vZGUpIHtcbiAgICAgICAgY2FzZSAnZGVib3VuY2UnOlxuICAgICAgICAgICAgcmV0dXJuIGRlYm91bmNlKHJlc2l6ZUNhbGxiYWNrLCByZWZyZXNoUmF0ZSwgcmVmcmVzaE9wdGlvbnMpO1xuICAgICAgICBjYXNlICd0aHJvdHRsZSc6XG4gICAgICAgICAgICByZXR1cm4gdGhyb3R0bGUocmVzaXplQ2FsbGJhY2ssIHJlZnJlc2hSYXRlLCByZWZyZXNoT3B0aW9ucyk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gcmVzaXplQ2FsbGJhY2s7XG4gICAgfVxufTtcbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZuKSB7IHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbic7IH07XG52YXIgaXNTU1IgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJzsgfTtcbnZhciBpc0RPTUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50IGluc3RhbmNlb2YgRWxlbWVudCB8fCBlbGVtZW50IGluc3RhbmNlb2YgSFRNTERvY3VtZW50O1xufTt2YXIgUmVzaXplRGV0ZWN0b3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFJlc2l6ZURldGVjdG9yLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFJlc2l6ZURldGVjdG9yKHByb3BzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIHByb3BzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5jYW5jZWxIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzLnJlc2l6ZUhhbmRsZXIgJiYgX3RoaXMucmVzaXplSGFuZGxlci5jYW5jZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBjYW5jZWwgZGVib3VuY2VkIGhhbmRsZXJcbiAgICAgICAgICAgICAgICBfdGhpcy5yZXNpemVIYW5kbGVyLmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgIF90aGlzLnJlc2l6ZUhhbmRsZXIgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5hdHRhY2hPYnNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IF90aGlzLnByb3BzLCB0YXJnZXRSZWYgPSBfYS50YXJnZXRSZWYsIG9ic2VydmVyT3B0aW9ucyA9IF9hLm9ic2VydmVyT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChpc1NTUigpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhcmdldFJlZiAmJiB0YXJnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRhcmdldFJlZi5jdXJyZW50ID0gdGFyZ2V0UmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IF90aGlzLmdldEVsZW1lbnQoKTtcbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbid0IGZpbmQgZWxlbWVudCB0byBvYnNlcnZlXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF90aGlzLm9ic2VydmFibGVFbGVtZW50ICYmIF90aGlzLm9ic2VydmFibGVFbGVtZW50ID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gZWxlbWVudCBpcyBhbHJlYWR5IG9ic2VydmVkXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMub2JzZXJ2YWJsZUVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICAgICAgX3RoaXMucmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShlbGVtZW50LCBvYnNlcnZlck9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5nZXRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hID0gX3RoaXMucHJvcHMsIHF1ZXJ5U2VsZWN0b3IgPSBfYS5xdWVyeVNlbGVjdG9yLCB0YXJnZXREb21FbCA9IF9hLnRhcmdldERvbUVsO1xuICAgICAgICAgICAgaWYgKGlzU1NSKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAvLyBpbiBjYXNlIHdlIHBhc3MgYSBxdWVyeVNlbGVjdG9yXG4gICAgICAgICAgICBpZiAocXVlcnlTZWxlY3RvcilcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeVNlbGVjdG9yKTtcbiAgICAgICAgICAgIC8vIGluIGNhc2Ugd2UgcGFzcyBhIERPTSBlbGVtZW50XG4gICAgICAgICAgICBpZiAodGFyZ2V0RG9tRWwgJiYgaXNET01FbGVtZW50KHRhcmdldERvbUVsKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0RG9tRWw7XG4gICAgICAgICAgICAvLyBpbiBjYXNlIHdlIHBhc3MgYSBSZWFjdCByZWYgdXNpbmcgUmVhY3QuY3JlYXRlUmVmKClcbiAgICAgICAgICAgIGlmIChfdGhpcy50YXJnZXRSZWYgJiYgaXNET01FbGVtZW50KF90aGlzLnRhcmdldFJlZi5jdXJyZW50KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudGFyZ2V0UmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICAvLyB0aGUgd29yc2UgY2FzZSB3aGVuIHdlIGRvbid0IHJlY2VpdmUgYW55IGluZm9ybWF0aW9uIGZyb20gdGhlIHBhcmVudCBhbmQgdGhlIGxpYnJhcnkgZG9lc24ndCBhZGQgYW55IHdyYXBwZXJzXG4gICAgICAgICAgICAvLyB3ZSBoYXZlIHRvIHVzZSBhIGRlcHJlY2F0ZWQgYGZpbmRET01Ob2RlYCBtZXRob2QgaW4gb3JkZXIgdG8gZmluZCBhIERPTSBlbGVtZW50IHRvIGF0dGFjaCB0b1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gZmluZERPTU5vZGUoX3RoaXMpO1xuICAgICAgICAgICAgaWYgKCFjdXJyZW50RWxlbWVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHZhciByZW5kZXJUeXBlID0gX3RoaXMuZ2V0UmVuZGVyVHlwZSgpO1xuICAgICAgICAgICAgc3dpdGNoIChyZW5kZXJUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAncmVuZGVyUHJvcCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICBjYXNlICdjaGlsZEZ1bmN0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NoaWxkJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NoaWxkQXJyYXknOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIF90aGlzLmNyZWF0ZVJlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbiAoZW50cmllcykge1xuICAgICAgICAgICAgdmFyIF9hID0gX3RoaXMucHJvcHMsIF9iID0gX2EuaGFuZGxlV2lkdGgsIGhhbmRsZVdpZHRoID0gX2IgPT09IHZvaWQgMCA/IHRydWUgOiBfYiwgX2MgPSBfYS5oYW5kbGVIZWlnaHQsIGhhbmRsZUhlaWdodCA9IF9jID09PSB2b2lkIDAgPyB0cnVlIDogX2MsIG9uUmVzaXplID0gX2Eub25SZXNpemU7XG4gICAgICAgICAgICBpZiAoIWhhbmRsZVdpZHRoICYmICFoYW5kbGVIZWlnaHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIG5vdGlmeVJlc2l6ZSA9IGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IF9hLndpZHRoLCBoZWlnaHQgPSBfYS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLnN0YXRlLndpZHRoID09PSB3aWR0aCAmJiBfdGhpcy5zdGF0ZS5oZWlnaHQgPT09IGhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBza2lwIGlmIGRpbWVuc2lvbnMgaGF2ZW4ndCBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKChfdGhpcy5zdGF0ZS53aWR0aCA9PT0gd2lkdGggJiYgIWhhbmRsZUhlaWdodCkgfHwgKF90aGlzLnN0YXRlLmhlaWdodCA9PT0gaGVpZ2h0ICYmICFoYW5kbGVXaWR0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJvY2VzcyBgaGFuZGxlSGVpZ2h0L2hhbmRsZVdpZHRoYCBwcm9wc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9uUmVzaXplID09PSBudWxsIHx8IG9uUmVzaXplID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvblJlc2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgIHZhciBfYSA9IChlbnRyeSAmJiBlbnRyeS5jb250ZW50UmVjdCkgfHwge30sIHdpZHRoID0gX2Eud2lkdGgsIGhlaWdodCA9IF9hLmhlaWdodDtcbiAgICAgICAgICAgICAgICB2YXIgc2hvdWxkU2V0U2l6ZSA9ICFfdGhpcy5za2lwT25Nb3VudCAmJiAhaXNTU1IoKTtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU2V0U2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBub3RpZnlSZXNpemUoeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy5za2lwT25Nb3VudCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIF90aGlzLmdldFJlbmRlclR5cGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSBfdGhpcy5wcm9wcywgcmVuZGVyID0gX2EucmVuZGVyLCBjaGlsZHJlbiA9IF9hLmNoaWxkcmVuO1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24ocmVuZGVyKSkge1xuICAgICAgICAgICAgICAgIC8vIERFUFJFQ0FURUQuIFVzZSBgQ2hpbGQgRnVuY3Rpb24gUGF0dGVybmAgaW5zdGVhZFxuICAgICAgICAgICAgICAgIHJldHVybiAncmVuZGVyUHJvcCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihjaGlsZHJlbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2NoaWxkRnVuY3Rpb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzVmFsaWRFbGVtZW50KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnY2hpbGQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgLy8gREVQUkVDQVRFRC4gV3JhcCBjaGlsZHJlbiB3aXRoIGEgc2luZ2xlIHBhcmVudFxuICAgICAgICAgICAgICAgIHJldHVybiAnY2hpbGRBcnJheSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBERVBSRUNBVEVELiBVc2UgYENoaWxkIEZ1bmN0aW9uIFBhdHRlcm5gIGluc3RlYWRcbiAgICAgICAgICAgIHJldHVybiAncGFyZW50JztcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNraXBPbk1vdW50ID0gcHJvcHMuc2tpcE9uTW91bnQsIHJlZnJlc2hNb2RlID0gcHJvcHMucmVmcmVzaE1vZGUsIF9hID0gcHJvcHMucmVmcmVzaFJhdGUsIHJlZnJlc2hSYXRlID0gX2EgPT09IHZvaWQgMCA/IDEwMDAgOiBfYSwgcmVmcmVzaE9wdGlvbnMgPSBwcm9wcy5yZWZyZXNoT3B0aW9ucztcbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaGVpZ2h0OiB1bmRlZmluZWRcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuc2l6ZVJlZiA9IHtcbiAgICAgICAgICAgIGN1cnJlbnQ6IF90aGlzLnN0YXRlXG4gICAgICAgIH07XG4gICAgICAgIF90aGlzLnNraXBPbk1vdW50ID0gc2tpcE9uTW91bnQ7XG4gICAgICAgIF90aGlzLnRhcmdldFJlZiA9IGNyZWF0ZVJlZigpO1xuICAgICAgICBfdGhpcy5vYnNlcnZhYmxlRWxlbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpc1NTUigpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMucmVzaXplSGFuZGxlciA9IHBhdGNoUmVzaXplQ2FsbGJhY2soX3RoaXMuY3JlYXRlUmVzaXplSGFuZGxlciwgcmVmcmVzaE1vZGUsIHJlZnJlc2hSYXRlLCByZWZyZXNoT3B0aW9ucyk7XG4gICAgICAgIF90aGlzLnJlc2l6ZU9ic2VydmVyID0gbmV3IHdpbmRvdy5SZXNpemVPYnNlcnZlcihfdGhpcy5yZXNpemVIYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBSZXNpemVEZXRlY3Rvci5wcm90b3R5cGUuY29tcG9uZW50RGlkTW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYXR0YWNoT2JzZXJ2ZXIoKTtcbiAgICB9O1xuICAgIFJlc2l6ZURldGVjdG9yLnByb3RvdHlwZS5jb21wb25lbnREaWRVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYXR0YWNoT2JzZXJ2ZXIoKTtcbiAgICAgICAgdGhpcy5zaXplUmVmLmN1cnJlbnQgPSB0aGlzLnN0YXRlO1xuICAgIH07XG4gICAgUmVzaXplRGV0ZWN0b3IucHJvdG90eXBlLmNvbXBvbmVudFdpbGxVbm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoaXNTU1IoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5jYW5jZWxIYW5kbGVyKCk7XG4gICAgfTtcbiAgICBSZXNpemVEZXRlY3Rvci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2EgPSB0aGlzLnByb3BzLCByZW5kZXIgPSBfYS5yZW5kZXIsIGNoaWxkcmVuID0gX2EuY2hpbGRyZW4sIF9iID0gX2Eubm9kZVR5cGUsIFdyYXBwZXJUYWcgPSBfYiA9PT0gdm9pZCAwID8gJ2RpdicgOiBfYjtcbiAgICAgICAgdmFyIF9jID0gdGhpcy5zdGF0ZSwgd2lkdGggPSBfYy53aWR0aCwgaGVpZ2h0ID0gX2MuaGVpZ2h0O1xuICAgICAgICB2YXIgY2hpbGRQcm9wcyA9IHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCwgdGFyZ2V0UmVmOiB0aGlzLnRhcmdldFJlZiB9O1xuICAgICAgICB2YXIgcmVuZGVyVHlwZSA9IHRoaXMuZ2V0UmVuZGVyVHlwZSgpO1xuICAgICAgICBzd2l0Y2ggKHJlbmRlclR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3JlbmRlclByb3AnOlxuICAgICAgICAgICAgICAgIHJldHVybiByZW5kZXIgPT09IG51bGwgfHwgcmVuZGVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZW5kZXIoY2hpbGRQcm9wcyk7XG4gICAgICAgICAgICBjYXNlICdjaGlsZEZ1bmN0aW9uJzoge1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZEZ1bmN0aW9uID0gY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkRnVuY3Rpb24gPT09IG51bGwgfHwgY2hpbGRGdW5jdGlvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2hpbGRGdW5jdGlvbihjaGlsZFByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2NoaWxkJzoge1xuICAgICAgICAgICAgICAgIC8vIEBUT0RPIGJ1ZyBwcm9uZSBsb2dpY1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlICYmIHR5cGVvZiBjaGlsZC50eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGlsZCBpcyBhIG5hdGl2ZSBET00gZWxlbWVudHMgc3VjaCBhcyBkaXYsIHNwYW4gZXRjXG4gICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9wcy50YXJnZXRSZWY7IHZhciBuYXRpdmVQcm9wcyA9IF9fcmVzdChjaGlsZFByb3BzLCBbXCJ0YXJnZXRSZWZcIl0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2xvbmVFbGVtZW50KGNoaWxkLCBuYXRpdmVQcm9wcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGNsYXNzIG9yIGZ1bmN0aW9uYWwgY29tcG9uZW50IG90aGVyd2lzZVxuICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZUVsZW1lbnQoY2hpbGQsIGNoaWxkUHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnY2hpbGRBcnJheSc6IHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRBcnJheSA9IGNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZEFycmF5Lm1hcChmdW5jdGlvbiAoZWwpIHsgcmV0dXJuICEhZWwgJiYgY2xvbmVFbGVtZW50KGVsLCBjaGlsZFByb3BzKTsgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFdyYXBwZXJUYWcsIG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gUmVzaXplRGV0ZWN0b3I7XG59KFB1cmVDb21wb25lbnQpKTtmdW5jdGlvbiB3aXRoUmVzaXplRGV0ZWN0b3IoQ29tcG9uZW50SW5uZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxuICAgIHZhciBSZXNpemVEZXRlY3RvckhPQyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFJlc2l6ZURldGVjdG9ySE9DLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBSZXNpemVEZXRlY3RvckhPQygpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMucmVmID0gY3JlYXRlUmVmKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgUmVzaXplRGV0ZWN0b3JIT0MucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IHRoaXMucHJvcHMsIGZvcndhcmRlZFJlZiA9IF9hLmZvcndhcmRlZFJlZiwgcmVzdCA9IF9fcmVzdChfYSwgW1wiZm9yd2FyZGVkUmVmXCJdKTtcbiAgICAgICAgICAgIHZhciB0YXJnZXRSZWYgPSBmb3J3YXJkZWRSZWYgIT09IG51bGwgJiYgZm9yd2FyZGVkUmVmICE9PSB2b2lkIDAgPyBmb3J3YXJkZWRSZWYgOiB0aGlzLnJlZjtcbiAgICAgICAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChSZXNpemVEZXRlY3RvciwgX19hc3NpZ24oe30sIG9wdGlvbnMsIHsgdGFyZ2V0UmVmOiB0YXJnZXRSZWYgfSksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDb21wb25lbnRJbm5lciwgX19hc3NpZ24oeyB0YXJnZXRSZWY6IHRhcmdldFJlZiB9LCByZXN0KSkpKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFJlc2l6ZURldGVjdG9ySE9DO1xuICAgIH0oQ29tcG9uZW50KSk7XG4gICAgZnVuY3Rpb24gZm9yd2FyZFJlZldyYXBwZXIocHJvcHMsIHJlZikge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSZXNpemVEZXRlY3RvckhPQywgX19hc3NpZ24oe30sIHByb3BzLCB7IGZvcndhcmRlZFJlZjogcmVmIH0pKTtcbiAgICB9XG4gICAgdmFyIG5hbWUgPSBDb21wb25lbnRJbm5lci5kaXNwbGF5TmFtZSB8fCBDb21wb25lbnRJbm5lci5uYW1lO1xuICAgIGZvcndhcmRSZWZXcmFwcGVyLmRpc3BsYXlOYW1lID0gXCJ3aXRoUmVzaXplRGV0ZWN0b3IoXCIuY29uY2F0KG5hbWUsIFwiKVwiKTtcbiAgICByZXR1cm4gZm9yd2FyZFJlZihmb3J3YXJkUmVmV3JhcHBlcik7XG59ZnVuY3Rpb24gdXNlUmVzaXplRGV0ZWN0b3IoX2EpIHtcbiAgICB2YXIgX2IgPSBfYSA9PT0gdm9pZCAwID8ge30gOiBfYSwgX2MgPSBfYi5za2lwT25Nb3VudCwgc2tpcE9uTW91bnQgPSBfYyA9PT0gdm9pZCAwID8gZmFsc2UgOiBfYywgcmVmcmVzaE1vZGUgPSBfYi5yZWZyZXNoTW9kZSwgX2QgPSBfYi5yZWZyZXNoUmF0ZSwgcmVmcmVzaFJhdGUgPSBfZCA9PT0gdm9pZCAwID8gMTAwMCA6IF9kLCByZWZyZXNoT3B0aW9ucyA9IF9iLnJlZnJlc2hPcHRpb25zLCBfZSA9IF9iLmhhbmRsZVdpZHRoLCBoYW5kbGVXaWR0aCA9IF9lID09PSB2b2lkIDAgPyB0cnVlIDogX2UsIF9mID0gX2IuaGFuZGxlSGVpZ2h0LCBoYW5kbGVIZWlnaHQgPSBfZiA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9mLCB0YXJnZXRSZWYgPSBfYi50YXJnZXRSZWYsIG9ic2VydmVyT3B0aW9ucyA9IF9iLm9ic2VydmVyT3B0aW9ucywgb25SZXNpemUgPSBfYi5vblJlc2l6ZTtcbiAgICB2YXIgc2tpcFJlc2l6ZSA9IHVzZVJlZihza2lwT25Nb3VudCk7XG4gICAgdmFyIF9nID0gdXNlU3RhdGUoe1xuICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgICBoZWlnaHQ6IHVuZGVmaW5lZFxuICAgIH0pLCBzaXplID0gX2dbMF0sIHNldFNpemUgPSBfZ1sxXTtcbiAgICAvLyB3ZSBhcmUgZ29pbmcgdG8gdXNlIHRoaXMgcmVmIHRvIHN0b3JlIHRoZSBsYXN0IGVsZW1lbnQgdGhhdCB3YXMgcGFzc2VkIHRvIHRoZSBob29rXG4gICAgdmFyIF9oID0gdXNlU3RhdGUoKHRhcmdldFJlZiA9PT0gbnVsbCB8fCB0YXJnZXRSZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHRhcmdldFJlZi5jdXJyZW50KSB8fCBudWxsKSwgcmVmRWxlbWVudCA9IF9oWzBdLCBzZXRSZWZFbGVtZW50ID0gX2hbMV07XG4gICAgLy8gaWYgdGFyZ2V0UmVmIGlzIHBhc3NlZCwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIHJlZkVsZW1lbnRcbiAgICAvLyB3ZSBoYXZlIHRvIHVzZSBzZXRUaW1lb3V0IGJlY2F1c2UgcmVmIGdldCBhc3NpZ25lZCBhZnRlciB0aGUgaG9vayBpcyBjYWxsZWRcbiAgICAvLyBpbiB0aGUgZnV0dXJlIHJlbGVhc2VzIHdlIGFyZSBnb2luZyB0byByZW1vdmUgdGFyZ2V0UmVmIGFuZCBmb3JjZSB1c2VycyB0byB1c2UgcmVmIHJldHVybmVkIGJ5IHRoZSBob29rXG4gICAgaWYgKHRhcmdldFJlZikge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXRSZWYuY3VycmVudCAhPT0gcmVmRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHNldFJlZkVsZW1lbnQodGFyZ2V0UmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICB9XG4gICAgLy8gdGhpcyBpcyBhIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgZXZlcnkgdGltZSB0aGUgcmVmIGlzIGNoYW5nZWRcbiAgICAvLyB3ZSBjYWxsIHNldFN0YXRlIGluc2lkZSB0byB0cmlnZ2VyIHJlcmVuZGVyXG4gICAgdmFyIG9uUmVmQ2hhbmdlID0gdXNlQ2FsbGJhY2soZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUgIT09IHJlZkVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNldFJlZkVsZW1lbnQobm9kZSk7XG4gICAgICAgIH1cbiAgICB9LCBbcmVmRWxlbWVudF0pO1xuICAgIC8vIGFkZGluZyBgY3VycmVudGAgdG8gbWFrZSBpdCBjb21wYXRpYmxlIHdpdGggdXNlUmVmIHNoYXBlXG4gICAgb25SZWZDaGFuZ2UuY3VycmVudCA9IHJlZkVsZW1lbnQ7XG4gICAgdmFyIHNob3VsZFNldFNpemUgPSB1c2VDYWxsYmFjayhmdW5jdGlvbiAocHJldlNpemUsIG5leHRTaXplKSB7XG4gICAgICAgIGlmIChwcmV2U2l6ZS53aWR0aCA9PT0gbmV4dFNpemUud2lkdGggJiYgcHJldlNpemUuaGVpZ2h0ID09PSBuZXh0U2l6ZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIC8vIHNraXAgaWYgZGltZW5zaW9ucyBoYXZlbid0IGNoYW5nZWRcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHByZXZTaXplLndpZHRoID09PSBuZXh0U2l6ZS53aWR0aCAmJiAhaGFuZGxlSGVpZ2h0KSB8fFxuICAgICAgICAgICAgKHByZXZTaXplLmhlaWdodCA9PT0gbmV4dFNpemUuaGVpZ2h0ICYmICFoYW5kbGVXaWR0aCkpIHtcbiAgICAgICAgICAgIC8vIHByb2Nlc3MgYGhhbmRsZUhlaWdodC9oYW5kbGVXaWR0aGAgcHJvcHNcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCBbaGFuZGxlV2lkdGgsIGhhbmRsZUhlaWdodF0pO1xuICAgIHZhciByZXNpemVDYWxsYmFjayA9IHVzZUNhbGxiYWNrKGZ1bmN0aW9uIChlbnRyaWVzKSB7XG4gICAgICAgIGlmICghaGFuZGxlV2lkdGggJiYgIWhhbmRsZUhlaWdodClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHNraXBSZXNpemUuY3VycmVudCkge1xuICAgICAgICAgICAgc2tpcFJlc2l6ZS5jdXJyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgdmFyIF9hID0gKGVudHJ5ID09PSBudWxsIHx8IGVudHJ5ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBlbnRyeS5jb250ZW50UmVjdCkgfHwge30sIHdpZHRoID0gX2Eud2lkdGgsIGhlaWdodCA9IF9hLmhlaWdodDtcbiAgICAgICAgICAgIHNldFNpemUoZnVuY3Rpb24gKHByZXZTaXplKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaG91bGRTZXRTaXplKHByZXZTaXplLCB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2U2l6ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSwgW2hhbmRsZVdpZHRoLCBoYW5kbGVIZWlnaHQsIHNraXBSZXNpemUsIHNob3VsZFNldFNpemVdKTtcbiAgICB2YXIgcmVzaXplSGFuZGxlciA9IHVzZUNhbGxiYWNrKHBhdGNoUmVzaXplQ2FsbGJhY2socmVzaXplQ2FsbGJhY2ssIHJlZnJlc2hNb2RlLCByZWZyZXNoUmF0ZSwgcmVmcmVzaE9wdGlvbnMpLCBbXG4gICAgICAgIHJlc2l6ZUNhbGxiYWNrLFxuICAgICAgICByZWZyZXNoTW9kZSxcbiAgICAgICAgcmVmcmVzaFJhdGUsXG4gICAgICAgIHJlZnJlc2hPcHRpb25zXG4gICAgXSk7XG4gICAgLy8gb24gcmVmRWxlbWVudCBjaGFuZ2VcbiAgICB1c2VFZmZlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzaXplT2JzZXJ2ZXI7XG4gICAgICAgIGlmIChyZWZFbGVtZW50KSB7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlciA9IG5ldyB3aW5kb3cuUmVzaXplT2JzZXJ2ZXIocmVzaXplSGFuZGxlcik7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHJlZkVsZW1lbnQsIG9ic2VydmVyT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2l6ZS53aWR0aCB8fCBzaXplLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIHNldFNpemUoeyB3aWR0aDogdW5kZWZpbmVkLCBoZWlnaHQ6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hLCBfYiwgX2M7XG4gICAgICAgICAgICAoX2EgPSByZXNpemVPYnNlcnZlciA9PT0gbnVsbCB8fCByZXNpemVPYnNlcnZlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNhbGwocmVzaXplT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgKF9jID0gKF9iID0gcmVzaXplSGFuZGxlcikuY2FuY2VsKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuY2FsbChfYik7XG4gICAgICAgIH07XG4gICAgfSwgW3Jlc2l6ZUhhbmRsZXIsIHJlZkVsZW1lbnRdKTtcbiAgICB1c2VFZmZlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICBvblJlc2l6ZSA9PT0gbnVsbCB8fCBvblJlc2l6ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25SZXNpemUoc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuICAgIH0sIFtzaXplXSk7XG4gICAgcmV0dXJuIF9fYXNzaWduKHsgcmVmOiBvblJlZkNoYW5nZSB9LCBzaXplKTtcbn1leHBvcnR7UmVzaXplRGV0ZWN0b3IgYXMgZGVmYXVsdCx1c2VSZXNpemVEZXRlY3Rvcix3aXRoUmVzaXplRGV0ZWN0b3J9Oy8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmVzbS5qcy5tYXBcbiIsImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIEZDLCBQcm9wc1dpdGhDaGlsZHJlbiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBBbGVydFByb3BzIGV4dGVuZHMgUHJvcHNXaXRoQ2hpbGRyZW4ge1xuICAgIGJvb3RzdHJhcFN0eWxlPzogXCJkZWZhdWx0XCIgfCBcInByaW1hcnlcIiB8IFwic3VjY2Vzc1wiIHwgXCJpbmZvXCIgfCBcIndhcm5pbmdcIiB8IFwiZGFuZ2VyXCI7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgQWxlcnQ6IEZDPEFsZXJ0UHJvcHM+ID0gKHsgYm9vdHN0cmFwU3R5bGUgPSBcImRhbmdlclwiLCBjbGFzc05hbWUsIGNoaWxkcmVuIH0pID0+XG4gICAgY2hpbGRyZW4gPyA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhgYWxlcnQgYWxlcnQtJHtib290c3RyYXBTdHlsZX1gLCBjbGFzc05hbWUpfT57Y2hpbGRyZW59PC9kaXY+IDogbnVsbDtcblxuQWxlcnQuZGlzcGxheU5hbWUgPSBcIkFsZXJ0XCI7XG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBGQyB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdyaWRCYWNrZ3JvdW5kUHJvcHMge1xuICAgIGdyaWRDZWxsV2lkdGg6IG51bWJlcjtcbiAgICBncmlkQ2VsbEhlaWdodDogbnVtYmVyO1xuICAgIGdyaWRCb3JkZXJDb2xvcjogc3RyaW5nO1xuICAgIGdyaWRCb3JkZXJXaWR0aDogbnVtYmVyO1xuICAgIHNob3dHcmlkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBjb25zdCBHcmlkOiBGQzxHcmlkQmFja2dyb3VuZFByb3BzPiA9ICh7XG4gICAgZ3JpZENlbGxXaWR0aCxcbiAgICBncmlkQ2VsbEhlaWdodCxcbiAgICBncmlkQm9yZGVyQ29sb3IsXG4gICAgZ3JpZEJvcmRlcldpZHRoLFxuICAgIHNob3dHcmlkID0gdHJ1ZVxufSkgPT4ge1xuICAgIGNvbnN0IGlkID0gYGdyaWQke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApfWA7XG4gICAgcmV0dXJuIHNob3dHcmlkID8gKFxuICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtZ3JpZFwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICA8cGF0dGVybiBpZD17aWR9IHdpZHRoPXtncmlkQ2VsbFdpZHRofSBoZWlnaHQ9e2dyaWRDZWxsSGVpZ2h0fSBwYXR0ZXJuVW5pdHM9XCJ1c2VyU3BhY2VPblVzZVwiPlxuICAgICAgICAgICAgICAgICAgICA8bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgeDE9XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkxPXtncmlkQ2VsbEhlaWdodH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHgyPXtncmlkQ2VsbFdpZHRofVxuICAgICAgICAgICAgICAgICAgICAgICAgeTI9e2dyaWRDZWxsSGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPXtncmlkQm9yZGVyQ29sb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17Z3JpZEJvcmRlcldpZHRofVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgeDE9e2dyaWRDZWxsV2lkdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICB5MT1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgeDI9e2dyaWRDZWxsV2lkdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICB5Mj17Z3JpZENlbGxIZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U9e2dyaWRCb3JkZXJDb2xvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXtncmlkQm9yZGVyV2lkdGh9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9wYXR0ZXJuPlxuICAgICAgICAgICAgPC9kZWZzPlxuICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIGZpbGw9e2B1cmwoIyR7aWR9KWB9IC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICkgOiBudWxsO1xufTtcblxuR3JpZC5kaXNwbGF5TmFtZSA9IFwiR3JpZFwiO1xuIiwiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCwgQ1NTUHJvcGVydGllcywgRkMsIFByb3BzV2l0aENoaWxkcmVuIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5leHBvcnQgdHlwZSBIZWlnaHRVbml0VHlwZSA9IFwicGVyY2VudGFnZU9mV2lkdGhcIiB8IFwicGVyY2VudGFnZU9mUGFyZW50XCIgfCBcInBpeGVsc1wiO1xuXG5leHBvcnQgdHlwZSBXaWR0aFVuaXRUeXBlID0gXCJwZXJjZW50YWdlXCIgfCBcInBpeGVsc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpbWVuc2lvbnMge1xuICAgIHdpZHRoVW5pdDogV2lkdGhVbml0VHlwZTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodFVuaXQ6IEhlaWdodFVuaXRUeXBlO1xuICAgIGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNpemVQcm9wcyBleHRlbmRzIERpbWVuc2lvbnMsIFByb3BzV2l0aENoaWxkcmVuIHtcbiAgICBjbGFzc05hbWU6IHN0cmluZztcbiAgICBjbGFzc05hbWVJbm5lcj86IHN0cmluZztcbiAgICByZWFkT25seT86IGJvb2xlYW47XG4gICAgc3R5bGU/OiBDU1NQcm9wZXJ0aWVzO1xufVxuXG5leHBvcnQgY29uc3QgU2l6ZUNvbnRhaW5lcjogRkM8U2l6ZVByb3BzPiA9ICh7XG4gICAgY2xhc3NOYW1lLFxuICAgIGNsYXNzTmFtZUlubmVyLFxuICAgIHdpZHRoVW5pdCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRVbml0LFxuICAgIGhlaWdodCxcbiAgICBjaGlsZHJlbixcbiAgICBzdHlsZSxcbiAgICByZWFkT25seSA9IGZhbHNlXG59KSA9PiB7XG4gICAgY29uc3Qgc3R5bGVXaWR0aCA9IHdpZHRoVW5pdCA9PT0gXCJwZXJjZW50YWdlXCIgPyBgJHt3aWR0aH0lYCA6IGAke3dpZHRofXB4YDtcbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWVzKGNsYXNzTmFtZSwgXCJzaXplLWJveFwiKSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwicmVsYXRpdmVcIixcbiAgICAgICAgICAgICAgICB3aWR0aDogc3R5bGVXaWR0aCxcbiAgICAgICAgICAgICAgICAuLi5nZXRIZWlnaHQoaGVpZ2h0VW5pdCwgaGVpZ2h0LCB3aWR0aFVuaXQsIHdpZHRoKSxcbiAgICAgICAgICAgICAgICAuLi5zdHlsZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZXMoXCJzaXplLWJveC1pbm5lclwiLCBjbGFzc05hbWVJbm5lciksXG4gICAgICAgICAgICAgICAgcmVhZE9ubHksXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHJlYWRPbmx5LFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogXCIwXCIsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBcIjBcIixcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tOiBcIjBcIixcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogXCIwXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgKVxuICAgICk7XG59O1xuXG5TaXplQ29udGFpbmVyLmRpc3BsYXlOYW1lID0gXCJTaXplQ29udGFpbmVyXCI7XG5cbmNvbnN0IGdldEhlaWdodCA9IChcbiAgICBoZWlnaHRVbml0OiBIZWlnaHRVbml0VHlwZSxcbiAgICBoZWlnaHQ6IG51bWJlcixcbiAgICB3aWR0aFVuaXQ6IFdpZHRoVW5pdFR5cGUsXG4gICAgd2lkdGg6IG51bWJlclxuKTogQ1NTUHJvcGVydGllcyA9PiB7XG4gICAgY29uc3Qgc3R5bGU6IENTU1Byb3BlcnRpZXMgPSB7fTtcbiAgICBpZiAoaGVpZ2h0VW5pdCA9PT0gXCJwZXJjZW50YWdlT2ZXaWR0aFwiKSB7XG4gICAgICAgIGNvbnN0IHJhdGlvID0gKGhlaWdodCAvIDEwMCkgKiB3aWR0aDtcbiAgICAgICAgaWYgKHdpZHRoVW5pdCA9PT0gXCJwZXJjZW50YWdlXCIpIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IFwiYXV0b1wiO1xuICAgICAgICAgICAgc3R5bGUucGFkZGluZ0JvdHRvbSA9IGAke3JhdGlvfSVgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGUuaGVpZ2h0ID0gYCR7cmF0aW99cHhgO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChoZWlnaHRVbml0ID09PSBcInBpeGVsc1wiKSB7XG4gICAgICAgIHN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgfSBlbHNlIGlmIChoZWlnaHRVbml0ID09PSBcInBlcmNlbnRhZ2VPZlBhcmVudFwiKSB7XG4gICAgICAgIHN0eWxlLmhlaWdodCA9IGAke2hlaWdodH0lYDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGU7XG59O1xuIiwiaW1wb3J0IHsgQ2hhbmdlRXZlbnQsIGNyZWF0ZUVsZW1lbnQsIFB1cmVDb21wb25lbnQsIFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHNpZ25hdHVyZV9wYWQgaGFzIG5vIHR5cGVzXG5pbXBvcnQgU2lnbmF0dXJlUGFkLCB7IElPcHRpb25zIH0gZnJvbSBcInNpZ25hdHVyZV9wYWRcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgUmVhY3RSZXNpemVEZXRlY3RvciBmcm9tIFwicmVhY3QtcmVzaXplLWRldGVjdG9yXCI7XG5cbmltcG9ydCB7IEFsZXJ0IH0gZnJvbSBcIi4vQWxlcnRcIjtcbmltcG9ydCB7IEdyaWQgfSBmcm9tIFwiLi9HcmlkXCI7XG5pbXBvcnQgeyBEaW1lbnNpb25zLCBTaXplQ29udGFpbmVyIH0gZnJvbSBcIi4vU2l6ZUNvbnRhaW5lclwiO1xuXG5pbXBvcnQgXCIuLi91aS9TaWduYXR1cmUuc2Nzc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hdHVyZVByb3BzIGV4dGVuZHMgRGltZW5zaW9ucyB7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgYWxlcnRNZXNzYWdlPzogc3RyaW5nO1xuICAgIGNsZWFyU2lnbmF0dXJlOiBib29sZWFuO1xuICAgIHNob3dHcmlkOiBib29sZWFuO1xuICAgIGdyaWRDZWxsV2lkdGg6IG51bWJlcjtcbiAgICBncmlkQ2VsbEhlaWdodDogbnVtYmVyO1xuICAgIGdyaWRCb3JkZXJDb2xvcjogc3RyaW5nO1xuICAgIGdyaWRCb3JkZXJXaWR0aDogbnVtYmVyO1xuICAgIHBlblR5cGU6IHBlbk9wdGlvbnM7XG4gICAgcGVuQ29sb3I6IHN0cmluZztcbiAgICBvblNpZ25FbmRBY3Rpb24/OiAoaW1hZ2VVcmw/OiBzdHJpbmcpID0+IHZvaWQ7XG4gICAgd3JhcHBlclN0eWxlPzogb2JqZWN0O1xuICAgIHJlYWRPbmx5OiBib29sZWFuO1xuICAgIHNpZ25hdHVyZU1vZGU6IFwiZHJhd1wiIHwgXCJ0eXBlXCI7XG4gICAgc2hvd01vZGVUb2dnbGU6IGJvb2xlYW47XG4gICAgc2hvd0NsZWFyQnV0dG9uOiBib29sZWFuO1xuICAgIHNob3dTYXZlQnV0dG9uOiBib29sZWFuO1xuICAgIHNhdmVCdXR0b25DYXB0aW9uPzogc3RyaW5nO1xuICAgIHNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdD86IHN0cmluZztcbiAgICBvblNhdmU/OiAoaW1hZ2VVcmw/OiBzdHJpbmcpID0+IHZvaWQ7XG4gICAgaXNTYXZlRW5hYmxlZD86IGJvb2xlYW47XG4gICAgc2hvd0hlYWRlcjogYm9vbGVhbjtcbiAgICBoZWFkZXJUZXh0Pzogc3RyaW5nO1xuICAgIHNob3dXYXRlcm1hcms6IGJvb2xlYW47XG4gICAgd2F0ZXJtYXJrVGV4dD86IHN0cmluZztcbiAgICBvbldhdGVybWFya0NoYW5nZT86ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkO1xuICAgIGlzV2F0ZXJtYXJrUmVhZE9ubHk/OiBib29sZWFuO1xuICAgIHR5cGVGb250RmFtaWx5OiBzdHJpbmc7XG4gICAgdHlwZUZvbnRTaXplOiBudW1iZXI7XG4gICAgdHlwZVBsYWNlaG9sZGVyOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIHBlbk9wdGlvbnMgPSBcImZvdW50YWluXCIgfCBcImJhbGxwb2ludFwiIHwgXCJtYXJrZXJcIjtcblxuaW50ZXJmYWNlIFNpZ25hdHVyZVN0YXRlIHtcbiAgICBtb2RlOiBcImRyYXdcIiB8IFwidHlwZVwiO1xuICAgIHR5cGVkVGV4dDogc3RyaW5nO1xuICAgIGhhc1NpZ25hdHVyZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFNpZ25hdHVyZSBleHRlbmRzIFB1cmVDb21wb25lbnQ8U2lnbmF0dXJlUHJvcHMsIFNpZ25hdHVyZVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBjYW52YXNOb2RlOiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igc2lnbmF0dXJlX3BhZCBoYXMgbm8gdHlwZXNcbiAgICBwcml2YXRlIHNpZ25hdHVyZVBhZDogU2lnbmF0dXJlUGFkO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IFNpZ25hdHVyZVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG1vZGU6IHByb3BzLnNpZ25hdHVyZU1vZGUsXG4gICAgICAgICAgICB0eXBlZFRleHQ6IFwiXCIsXG4gICAgICAgICAgICBoYXNTaWduYXR1cmU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IHsgY2xhc3NOYW1lLCBhbGVydE1lc3NhZ2UsIHdyYXBwZXJTdHlsZSB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFNpemVDb250YWluZXJcbiAgICAgICAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJ3aWRnZXQtc2lnbmF0dXJlXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lSW5uZXI9XCJ3aWRnZXQtc2lnbmF0dXJlLXdyYXBwZXIgZm9ybS1jb250cm9sIG14LXRleHRhcmVhLWlucHV0IG14LXRleHRhcmVhXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17d3JhcHBlclN0eWxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxBbGVydCBib290c3RyYXBTdHlsZT1cImRhbmdlclwiPnthbGVydE1lc3NhZ2V9PC9BbGVydD5cbiAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJIZWFkZXIoKX1cbiAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJDb250cm9scygpfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS1jYW52YXMtYXJlYVwiPlxuICAgICAgICAgICAgICAgICAgICA8R3JpZCB7Li4udGhpcy5wcm9wc30gLz5cbiAgICAgICAgICAgICAgICAgICAgPGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS1jYW52YXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXsobm9kZTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsKTogdm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW52YXNOb2RlID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlcldhdGVybWFyaygpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxSZWFjdFJlc2l6ZURldGVjdG9yIGhhbmRsZVdpZHRoIGhhbmRsZUhlaWdodCBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX0gLz5cbiAgICAgICAgICAgIDwvU2l6ZUNvbnRhaW5lcj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckhlYWRlcigpOiBSZWFjdE5vZGUge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2hvd0hlYWRlciB8fCAhdGhpcy5wcm9wcy5oZWFkZXJUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLWhlYWRlclwiPnt0aGlzLnByb3BzLmhlYWRlclRleHR9PC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyQ29udHJvbHMoKTogUmVhY3ROb2RlIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVhZE9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hvd1RvZ2dsZSA9IHRoaXMucHJvcHMuc2hvd01vZGVUb2dnbGU7XG4gICAgICAgIGNvbnN0IHNob3dJbnB1dCA9IHRoaXMuc3RhdGUubW9kZSA9PT0gXCJ0eXBlXCI7XG4gICAgICAgIGNvbnN0IHNob3dDbGVhciA9IHRoaXMucHJvcHMuc2hvd0NsZWFyQnV0dG9uO1xuICAgICAgICBjb25zdCBzaG93U2F2ZSA9IHRoaXMucHJvcHMuc2hvd1NhdmVCdXR0b247XG5cbiAgICAgICAgaWYgKCFzaG93VG9nZ2xlICYmICFzaG93SW5wdXQgJiYgIXNob3dDbGVhciAmJiAhc2hvd1NhdmUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS1jb250cm9sc1wiPlxuICAgICAgICAgICAgICAgIHtzaG93VG9nZ2xlID8gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtdG9nZ2xlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnN0YXRlLm1vZGUgPT09IFwiZHJhd1wiID8gXCJhY3RpdmVcIiA6IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5zZXRNb2RlKFwiZHJhd1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBEcmF3XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuc3RhdGUubW9kZSA9PT0gXCJ0eXBlXCIgPyBcImFjdGl2ZVwiIDogXCJcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnNldE1vZGUoXCJ0eXBlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICB7c2hvd0lucHV0ID8gKFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtdHlwZWQtaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMudHlwZVBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudHlwZWRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25UeXBlZENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICB7c2hvd0NsZWFyID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLWNsZWFyXCIgb25DbGljaz17dGhpcy5oYW5kbGVDbGVhckNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIHtzaG93U2F2ZSA/IChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLXNhdmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVTYXZlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMucHJvcHMuaXNTYXZlRW5hYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMuc2F2ZUJ1dHRvbkNhcHRpb24gfHwgdGhpcy5wcm9wcy5zYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHQgfHwgXCJTYXZlXCJ9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNhbnZhc05vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkID0gbmV3IFNpZ25hdHVyZVBhZCh0aGlzLmNhbnZhc05vZGUsIHtcbiAgICAgICAgICAgICAgICBwZW5Db2xvcjogdGhpcy5wcm9wcy5wZW5Db2xvcixcbiAgICAgICAgICAgICAgICBvbkVuZDogdGhpcy5oYW5kbGVTaWduRW5kLFxuICAgICAgICAgICAgICAgIC4uLnRoaXMuc2lnbmF0dXJlUGFkT3B0aW9ucygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlNb2RlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBTaWduYXR1cmVQcm9wcyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5zaWduYXR1cmVQYWQpIHtcbiAgICAgICAgICAgIGlmIChwcmV2UHJvcHMuY2xlYXJTaWduYXR1cmUgIT09IHRoaXMucHJvcHMuY2xlYXJTaWduYXR1cmUgJiYgdGhpcy5wcm9wcy5jbGVhclNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdHlwZWRUZXh0OiBcIlwiLCBoYXNTaWduYXR1cmU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZQcm9wcy5yZWFkT25seSAhPT0gdGhpcy5wcm9wcy5yZWFkT25seSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlNb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldlByb3BzLnBlbkNvbG9yICE9PSB0aGlzLnByb3BzLnBlbkNvbG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQucGVuQ29sb3IgPSB0aGlzLnByb3BzLnBlbkNvbG9yO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm1vZGUgPT09IFwidHlwZVwiICYmIHRoaXMuc3RhdGUudHlwZWRUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVHlwZWRTaWduYXR1cmUodGhpcy5zdGF0ZS50eXBlZFRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmV2UHJvcHMuc2lnbmF0dXJlTW9kZSAhPT0gdGhpcy5wcm9wcy5zaWduYXR1cmVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRNb2RlKHRoaXMucHJvcHMuc2lnbmF0dXJlTW9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcHJldlByb3BzLnR5cGVGb250RmFtaWx5ICE9PSB0aGlzLnByb3BzLnR5cGVGb250RmFtaWx5IHx8XG4gICAgICAgICAgICAgICAgcHJldlByb3BzLnR5cGVGb250U2l6ZSAhPT0gdGhpcy5wcm9wcy50eXBlRm9udFNpemVcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm1vZGUgPT09IFwidHlwZVwiICYmIHRoaXMuc3RhdGUudHlwZWRUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVHlwZWRTaWduYXR1cmUodGhpcy5zdGF0ZS50eXBlZFRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNhbnZhc05vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzTm9kZS53aWR0aCA9XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNOb2RlICYmIHRoaXMuY2FudmFzTm9kZS5wYXJlbnRFbGVtZW50ID8gdGhpcy5jYW52YXNOb2RlLnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggOiAwO1xuICAgICAgICAgICAgdGhpcy5jYW52YXNOb2RlLmhlaWdodCA9XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNOb2RlICYmIHRoaXMuY2FudmFzTm9kZS5wYXJlbnRFbGVtZW50ID8gdGhpcy5jYW52YXNOb2RlLnBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IDogMDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm1vZGUgPT09IFwidHlwZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUeXBlZFNpZ25hdHVyZSh0aGlzLnN0YXRlLnR5cGVkVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLnNpZ25hdHVyZVBhZC50b0RhdGEoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZC5jbGVhcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkLmZyb21EYXRhKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2lnbmF0dXJlUGFkT3B0aW9ucygpOiBJT3B0aW9ucyB7XG4gICAgICAgIGxldCBvcHRpb25zOiBJT3B0aW9ucyA9IHt9O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wZW5UeXBlID09PSBcImZvdW50YWluXCIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7IG1pbldpZHRoOiAwLjYsIG1heFdpZHRoOiAyLjYsIHZlbG9jaXR5RmlsdGVyV2VpZ2h0OiAwLjYgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnBlblR5cGUgPT09IFwiYmFsbHBvaW50XCIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7IG1pbldpZHRoOiAxLjQsIG1heFdpZHRoOiAxLjUsIHZlbG9jaXR5RmlsdGVyV2VpZ2h0OiAxLjUgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnBlblR5cGUgPT09IFwibWFya2VyXCIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7IG1pbldpZHRoOiAyLCBtYXhXaWR0aDogNCwgdmVsb2NpdHlGaWx0ZXJXZWlnaHQ6IDAuOSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlU2lnbkVuZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25TaWduRW5kQWN0aW9uICYmIHRoaXMuc3RhdGUubW9kZSA9PT0gXCJkcmF3XCIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25TaWduRW5kQWN0aW9uKHRoaXMuc2lnbmF0dXJlUGFkLnRvRGF0YVVSTCgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zaWduYXR1cmVQYWQgJiYgIXRoaXMuc2lnbmF0dXJlUGFkLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhhc1NpZ25hdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHNldE1vZGUobW9kZTogXCJkcmF3XCIgfCBcInR5cGVcIik6IHZvaWQge1xuICAgICAgICBpZiAobW9kZSA9PT0gdGhpcy5zdGF0ZS5tb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vZGUgfSwgKCkgPT4gdGhpcy5hcHBseU1vZGUoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseU1vZGUoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5zaWduYXR1cmVQYWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFkT25seSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQub2ZmKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubW9kZSA9PT0gXCJ0eXBlXCIpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkLm9mZigpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJUeXBlZFNpZ25hdHVyZSh0aGlzLnN0YXRlLnR5cGVkVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZC5vbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblR5cGVkQ2hhbmdlID0gKGV2ZW50OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdHlwZWRUZXh0OiB0ZXh0LCBoYXNTaWduYXR1cmU6IHRleHQudHJpbSgpLmxlbmd0aCA+IDAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJUeXBlZFNpZ25hdHVyZSh0ZXh0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uU2lnbkVuZEFjdGlvbiAmJiB0ZXh0LnRyaW0oKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25TaWduRW5kQWN0aW9uKHRoaXMuc2lnbmF0dXJlUGFkLnRvRGF0YVVSTCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyVHlwZWRTaWduYXR1cmUodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5jYW52YXNOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jYW52YXNOb2RlLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgaWYgKCFjdHgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcblxuICAgICAgICBpZiAoIXRleHQudHJpbSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtYXhXaWR0aCA9IHRoaXMuY2FudmFzTm9kZS53aWR0aCAqIDAuOTtcbiAgICAgICAgbGV0IGZvbnRTaXplID0gTWF0aC5tYXgodGhpcy5wcm9wcy50eXBlRm9udFNpemUsIDgpO1xuICAgICAgICBjdHguZm9udCA9IGAke2ZvbnRTaXplfXB4ICR7dGhpcy5wcm9wcy50eXBlRm9udEZhbWlseX1gO1xuXG4gICAgICAgIHdoaWxlIChjdHgubWVhc3VyZVRleHQodGV4dCkud2lkdGggPiBtYXhXaWR0aCAmJiBmb250U2l6ZSA+IDgpIHtcbiAgICAgICAgICAgIGZvbnRTaXplIC09IDI7XG4gICAgICAgICAgICBjdHguZm9udCA9IGAke2ZvbnRTaXplfXB4ICR7dGhpcy5wcm9wcy50eXBlRm9udEZhbWlseX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucHJvcHMucGVuQ29sb3I7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgY3R4LmZpbGxUZXh0KHRleHQsIHRoaXMuY2FudmFzTm9kZS53aWR0aCAvIDIsIHRoaXMuY2FudmFzTm9kZS5oZWlnaHQgLyAyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZUNsZWFyQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudHlwZWRUZXh0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdHlwZWRUZXh0OiBcIlwiLCBoYXNTaWduYXR1cmU6IGZhbHNlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaGFzU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaGFzU2lnbmF0dXJlOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGhhbmRsZVNhdmVDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm9uU2F2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRhdGFVcmwgPSB0aGlzLmNhbnZhc05vZGUgPyB0aGlzLmNhbnZhc05vZGUudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpIDogdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnByb3BzLm9uU2F2ZShkYXRhVXJsKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJXYXRlcm1hcmsoKTogUmVhY3ROb2RlIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnNob3dXYXRlcm1hcmsgfHwgIXRoaXMuc3RhdGUuaGFzU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbldhdGVybWFya0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS13YXRlcm1hcmstaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLndhdGVybWFya1RleHQgPz8gXCJcIn1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25XYXRlcm1hcmtDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmlzV2F0ZXJtYXJrUmVhZE9ubHl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS13YXRlcm1hcmstdGV4dFwiPnt0aGlzLnByb3BzLndhdGVybWFya1RleHR9PC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25XYXRlcm1hcmtDaGFuZ2UgPSAoZXZlbnQ6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uV2F0ZXJtYXJrQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uV2F0ZXJtYXJrQ2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjbGVhckNhbnZhcygpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNhbnZhc05vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmNhbnZhc05vZGUuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzTm9kZS53aWR0aCwgdGhpcy5jYW52YXNOb2RlLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2lnbmF0dXJlUGFkKSB7XG4gICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZC5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ1NTUHJvcGVydGllcywgY3JlYXRlRWxlbWVudCwgUmVhY3RFbGVtZW50LCB1c2VDYWxsYmFjaywgdXNlTWVtbywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICAgIEVkaXRhYmxlVmFsdWUsXG4gICAgTGlzdEFjdGlvblZhbHVlLFxuICAgIExpc3RBdHRyaWJ1dGVWYWx1ZSxcbiAgICBMaXN0RXhwcmVzc2lvblZhbHVlLFxuICAgIExpc3RWYWx1ZSxcbiAgICBPYmplY3RJdGVtLFxuICAgIFZhbHVlU3RhdHVzXG59IGZyb20gXCJtZW5kaXhcIjtcblxuaW1wb3J0IHsgRGltZW5zaW9ucyB9IGZyb20gXCIuL1NpemVDb250YWluZXJcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwiLi4vdXRpbHMvVXRpbHNcIjtcbmltcG9ydCB7IHBlbk9wdGlvbnMsIFNpZ25hdHVyZSBhcyBTaWduYXR1cmVDYW52YXMgfSBmcm9tIFwiLi9TaWduYXR1cmVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBTaWduYXR1cmVDb250YWluZXJQcm9wcyBleHRlbmRzIERpbWVuc2lvbnMge1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIHdyYXBwZXJTdHlsZT86IENTU1Byb3BlcnRpZXM7XG4gICAgcmVhZE9ubHk6IGJvb2xlYW47XG4gICAgZGF0YVNvdXJjZT86IExpc3RWYWx1ZTtcbiAgICBoYXNTaWduYXR1cmVBdHRyaWJ1dGU/OiBMaXN0RXhwcmVzc2lvblZhbHVlPGJvb2xlYW4+O1xuICAgIGZyaWVuZGx5SWQ6IHN0cmluZztcbiAgICBzaWduYXR1cmVNb2RlOiBcImRyYXdcIiB8IFwidHlwZVwiO1xuICAgIHNob3dNb2RlVG9nZ2xlOiBib29sZWFuO1xuICAgIHNob3dDbGVhckJ1dHRvbjogYm9vbGVhbjtcbiAgICBzaG93U2F2ZUJ1dHRvbjogYm9vbGVhbjtcbiAgICBzYXZlQnV0dG9uQ2FwdGlvbj86IExpc3RFeHByZXNzaW9uVmFsdWU8c3RyaW5nPjtcbiAgICBzYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHQ6IHN0cmluZztcbiAgICBvblNhdmVBY3Rpb24/OiBMaXN0QWN0aW9uVmFsdWU7XG4gICAgc2hvd0hlYWRlcjogYm9vbGVhbjtcbiAgICBoZWFkZXJUZXh0PzogTGlzdEV4cHJlc3Npb25WYWx1ZTxzdHJpbmc+O1xuICAgIGhlYWRlclRleHREZWZhdWx0OiBzdHJpbmc7XG4gICAgYmFzZTY0QXR0cmlidXRlPzogTGlzdEF0dHJpYnV0ZVZhbHVlPHN0cmluZz47XG4gICAgc2hvd1dhdGVybWFyazogYm9vbGVhbjtcbiAgICB3YXRlcm1hcmtBdHRyaWJ1dGU/OiBMaXN0QXR0cmlidXRlVmFsdWU8c3RyaW5nPjtcbiAgICB0eXBlRm9udEZhbWlseTogc3RyaW5nO1xuICAgIHR5cGVGb250U2l6ZTogbnVtYmVyO1xuICAgIHR5cGVQbGFjZWhvbGRlcjogc3RyaW5nO1xuICAgIHNob3dHcmlkOiBib29sZWFuO1xuICAgIGdyaWRCb3JkZXJDb2xvcjogc3RyaW5nO1xuICAgIGdyaWRDZWxsSGVpZ2h0OiBudW1iZXI7XG4gICAgZ3JpZENlbGxXaWR0aDogbnVtYmVyO1xuICAgIGdyaWRCb3JkZXJXaWR0aDogbnVtYmVyO1xuICAgIHBlblR5cGU6IHBlbk9wdGlvbnM7XG4gICAgcGVuQ29sb3I6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZU9iamVjdEl0ZW0oZGF0YVNvdXJjZT86IExpc3RWYWx1ZSk6IE9iamVjdEl0ZW0gfCB1bmRlZmluZWQge1xuICAgIGlmICghZGF0YVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YVNvdXJjZS5zdGF0dXMgPT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSA/IGRhdGFTb3VyY2UuaXRlbXM/LlswXSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNpZ25hdHVyZUNvbnRhaW5lcihwcm9wczogU2lnbmF0dXJlQ29udGFpbmVyUHJvcHMpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtcbiAgICAgICAgZGF0YVNvdXJjZSxcbiAgICAgICAgaGFzU2lnbmF0dXJlQXR0cmlidXRlLFxuICAgICAgICB3cmFwcGVyU3R5bGUsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgcmVhZE9ubHksXG4gICAgICAgIGZyaWVuZGx5SWQsXG4gICAgICAgIHNpZ25hdHVyZU1vZGUsXG4gICAgICAgIHNob3dNb2RlVG9nZ2xlLFxuICAgICAgICBzaG93Q2xlYXJCdXR0b24sXG4gICAgICAgIHNob3dTYXZlQnV0dG9uLFxuICAgICAgICBzYXZlQnV0dG9uQ2FwdGlvbixcbiAgICAgICAgc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0LFxuICAgICAgICBvblNhdmVBY3Rpb24sXG4gICAgICAgIHNob3dIZWFkZXIsXG4gICAgICAgIGhlYWRlclRleHQsXG4gICAgICAgIGhlYWRlclRleHREZWZhdWx0LFxuICAgICAgICBiYXNlNjRBdHRyaWJ1dGUsXG4gICAgICAgIHNob3dXYXRlcm1hcmssXG4gICAgICAgIHdhdGVybWFya0F0dHJpYnV0ZSxcbiAgICAgICAgdHlwZUZvbnRGYW1pbHksXG4gICAgICAgIHR5cGVGb250U2l6ZSxcbiAgICAgICAgdHlwZVBsYWNlaG9sZGVyLFxuICAgICAgICBwZW5Db2xvcixcbiAgICAgICAgcGVuVHlwZSxcbiAgICAgICAgc2hvd0dyaWQsXG4gICAgICAgIGdyaWRCb3JkZXJDb2xvcixcbiAgICAgICAgZ3JpZEJvcmRlcldpZHRoLFxuICAgICAgICBncmlkQ2VsbEhlaWdodCxcbiAgICAgICAgZ3JpZENlbGxXaWR0aCxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIHdpZHRoVW5pdCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICBoZWlnaHRVbml0XG4gICAgfSA9IHByb3BzO1xuICAgIGNvbnN0IG14T2JqZWN0ID0gdXNlTWVtbzxPYmplY3RJdGVtIHwgdW5kZWZpbmVkPigoKSA9PiByZXNvbHZlT2JqZWN0SXRlbShkYXRhU291cmNlKSwgW2RhdGFTb3VyY2VdKTtcbiAgICBjb25zdCBzaWduYXR1cmVBdHRyaWJ1dGUgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFteE9iamVjdCB8fCAhaGFzU2lnbmF0dXJlQXR0cmlidXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNTaWduYXR1cmVBdHRyaWJ1dGUuZ2V0KG14T2JqZWN0KTtcbiAgICB9LCBbaGFzU2lnbmF0dXJlQXR0cmlidXRlLCBteE9iamVjdF0pO1xuXG4gICAgY29uc3QgYWxlcnRNZXNzYWdlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghbXhPYmplY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtmcmllbmRseUlkfTogRGF0YSBzb3VyY2UgaXMgZW1wdHkuYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9LCBbZnJpZW5kbHlJZCwgbXhPYmplY3RdKTtcblxuICAgIGNvbnN0IGlzUmVhZE9ubHkgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlYWRPbmx5IHx8ICFteE9iamVjdDtcbiAgICB9LCBbbXhPYmplY3QsIHJlYWRPbmx5XSk7XG5cbiAgICBjb25zdCB3YXRlcm1hcmtWYWx1ZSA9IHVzZU1lbW88RWRpdGFibGVWYWx1ZTxzdHJpbmc+IHwgdW5kZWZpbmVkPigoKSA9PiB7XG4gICAgICAgIGlmICghbXhPYmplY3QgfHwgIXdhdGVybWFya0F0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2F0ZXJtYXJrQXR0cmlidXRlLmdldChteE9iamVjdCk7XG4gICAgfSwgW214T2JqZWN0LCB3YXRlcm1hcmtBdHRyaWJ1dGVdKTtcblxuICAgIGNvbnN0IHdhdGVybWFya1RleHQgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCF3YXRlcm1hcmtWYWx1ZSB8fCB3YXRlcm1hcmtWYWx1ZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdhdGVybWFya1ZhbHVlLnZhbHVlID8/IFwiXCI7XG4gICAgfSwgW3dhdGVybWFya1ZhbHVlXSk7XG5cbiAgICBjb25zdCBoYW5kbGVXYXRlcm1hcmtDaGFuZ2UgPSB1c2VDYWxsYmFjayhcbiAgICAgICAgKHZhbHVlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICghd2F0ZXJtYXJrVmFsdWUgfHwgd2F0ZXJtYXJrVmFsdWUuc3RhdHVzICE9PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUgfHwgd2F0ZXJtYXJrVmFsdWUucmVhZE9ubHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXRlcm1hcmtWYWx1ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIFt3YXRlcm1hcmtWYWx1ZV1cbiAgICApO1xuXG4gICAgY29uc3Qgc2F2ZUJ1dHRvbkNhcHRpb25UZXh0ID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghbXhPYmplY3QgfHwgIXNhdmVCdXR0b25DYXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhcHRpb25WYWx1ZSA9IHNhdmVCdXR0b25DYXB0aW9uLmdldChteE9iamVjdCk7XG4gICAgICAgIGlmIChjYXB0aW9uVmFsdWUuc3RhdHVzICE9PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUpIHtcbiAgICAgICAgICAgIHJldHVybiBzYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhcHRpb25WYWx1ZS52YWx1ZSAhPT0gXCJcIiA/IGNhcHRpb25WYWx1ZS52YWx1ZSA6IHNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdDtcbiAgICB9LCBbbXhPYmplY3QsIHNhdmVCdXR0b25DYXB0aW9uLCBzYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHRdKTtcblxuICAgIGNvbnN0IGhlYWRlclRleHRWYWx1ZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIW14T2JqZWN0IHx8ICFoZWFkZXJUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gaGVhZGVyVGV4dERlZmF1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGVhZGVyVmFsdWUgPSBoZWFkZXJUZXh0LmdldChteE9iamVjdCk7XG4gICAgICAgIGlmIChoZWFkZXJWYWx1ZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGhlYWRlclRleHREZWZhdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoZWFkZXJWYWx1ZS52YWx1ZSAhPT0gXCJcIiA/IGhlYWRlclZhbHVlLnZhbHVlIDogaGVhZGVyVGV4dERlZmF1bHQ7XG4gICAgfSwgW214T2JqZWN0LCBoZWFkZXJUZXh0LCBoZWFkZXJUZXh0RGVmYXVsdF0pO1xuXG4gICAgY29uc3Qgc2F2ZUFjdGlvbiA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIW14T2JqZWN0IHx8ICFvblNhdmVBY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9uU2F2ZUFjdGlvbi5nZXQobXhPYmplY3QpO1xuICAgIH0sIFtteE9iamVjdCwgb25TYXZlQWN0aW9uXSk7XG5cbiAgICBjb25zdCBiYXNlNjRWYWx1ZSA9IHVzZU1lbW88RWRpdGFibGVWYWx1ZTxzdHJpbmc+IHwgdW5kZWZpbmVkPigoKSA9PiB7XG4gICAgICAgIGlmICghbXhPYmplY3QgfHwgIWJhc2U2NEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZTY0QXR0cmlidXRlLmdldChteE9iamVjdCk7XG4gICAgfSwgW214T2JqZWN0LCBiYXNlNjRBdHRyaWJ1dGVdKTtcblxuICAgIGNvbnN0IHNldEJhc2U2NFZhbHVlID0gdXNlQ2FsbGJhY2soXG4gICAgICAgICh2YWx1ZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWJhc2U2NFZhbHVlIHx8IGJhc2U2NFZhbHVlLnN0YXR1cyAhPT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlIHx8IGJhc2U2NFZhbHVlLnJlYWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZTY0VmFsdWUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBbYmFzZTY0VmFsdWVdXG4gICAgKTtcblxuICAgIGNvbnN0IGdlbmVyYXRlRmlsZU5hbWUgPSB1c2VDYWxsYmFjaygoZ3VpZDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuIGBzaWduYXR1cmUtJHtndWlkfS5wbmdgO1xuICAgIH0sIFtdKTtcblxuICAgIGNvbnN0IHNhdmVEb2N1bWVudCA9IHVzZUNhbGxiYWNrKFxuICAgICAgICAoYmFzZTY0VXJpOiBzdHJpbmcsIG9uU3VjY2Vzcz86ICgpID0+IHZvaWQpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICghYmFzZTY0VXJpIHx8ICFteE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG14LmRhdGEuc2F2ZURvY3VtZW50KFxuICAgICAgICAgICAgICAgIG14T2JqZWN0LmlkLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlRmlsZU5hbWUobXhPYmplY3QuaWQpLFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIFV0aWxzLmNvbnZlcnRVcmxUb0Jsb2IoYmFzZTY0VXJpKSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvblN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAoZXJyOiB7IG1lc3NhZ2U6IHN0cmluZyB9KSA9PiBteC51aS5lcnJvcihgRXJyb3Igc2F2aW5nIHNpZ25hdHVyZTogJHtlcnIubWVzc2FnZX1gKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgW2dlbmVyYXRlRmlsZU5hbWUsIG14T2JqZWN0XVxuICAgICk7XG5cbiAgICBjb25zdCBsYXN0U2lnbmF0dXJlRGF0YVVybFJlZiA9IHVzZVJlZjxzdHJpbmcgfCB1bmRlZmluZWQ+KCk7XG5cbiAgICBjb25zdCBoYW5kbGVTaWduRW5kID0gdXNlQ2FsbGJhY2soXG4gICAgICAgIChiYXNlNjRVcmk/OiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICghYmFzZTY0VXJpIHx8ICFteE9iamVjdCB8fCBpc1JlYWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFNpZ25hdHVyZURhdGFVcmxSZWYuY3VycmVudCA9IGJhc2U2NFVyaTtcbiAgICAgICAgICAgIHNldEJhc2U2NFZhbHVlKGJhc2U2NFVyaSk7XG4gICAgICAgICAgICBzYXZlRG9jdW1lbnQoYmFzZTY0VXJpKTtcbiAgICAgICAgfSxcbiAgICAgICAgW2lzUmVhZE9ubHksIG14T2JqZWN0LCBzYXZlRG9jdW1lbnQsIHNldEJhc2U2NFZhbHVlXVxuICAgICk7XG5cbiAgICBjb25zdCBoYW5kbGVTYXZlID0gdXNlQ2FsbGJhY2soXG4gICAgICAgIChiYXNlNjRVcmk/OiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFVcmwgPSBiYXNlNjRVcmkgfHwgbGFzdFNpZ25hdHVyZURhdGFVcmxSZWYuY3VycmVudDtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVBY3Rpb24gPSAoKTogdm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JlYWRPbmx5ICYmIHNhdmVBY3Rpb24/LmNhbkV4ZWN1dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUFjdGlvbi5leGVjdXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChkYXRhVXJsKSB7XG4gICAgICAgICAgICAgICAgc2V0QmFzZTY0VmFsdWUoZGF0YVVybCk7XG4gICAgICAgICAgICAgICAgc2F2ZURvY3VtZW50KGRhdGFVcmwsIGV4ZWN1dGVBY3Rpb24pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24oKTtcbiAgICAgICAgfSxcbiAgICAgICAgW2lzUmVhZE9ubHksIHNhdmVBY3Rpb24sIHNhdmVEb2N1bWVudCwgc2V0QmFzZTY0VmFsdWVdXG4gICAgKTtcblxuICAgIGNvbnN0IGNsZWFyU2lnbmF0dXJlID1cbiAgICAgICAgc2lnbmF0dXJlQXR0cmlidXRlPy5zdGF0dXMgPT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSA/IHNpZ25hdHVyZUF0dHJpYnV0ZS52YWx1ZSA9PT0gZmFsc2UgOiBmYWxzZTtcblxuICAgIGNvbnN0IHNob3VsZFNob3dXYXRlcm1hcmsgPSBzaG93V2F0ZXJtYXJrICYmICEhd2F0ZXJtYXJrVmFsdWU7XG5cbiAgICBjb25zdCBzaG91bGRTaG93Q29udHJvbHMgPSAhaXNSZWFkT25seTtcblxuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KFNpZ25hdHVyZUNhbnZhcywge1xuICAgICAgICB3aWR0aCxcbiAgICAgICAgd2lkdGhVbml0LFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIGhlaWdodFVuaXQsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgd3JhcHBlclN0eWxlLFxuICAgICAgICBhbGVydE1lc3NhZ2UsXG4gICAgICAgIGNsZWFyU2lnbmF0dXJlLFxuICAgICAgICByZWFkT25seTogaXNSZWFkT25seSxcbiAgICAgICAgb25TaWduRW5kQWN0aW9uOiBoYW5kbGVTaWduRW5kLFxuICAgICAgICBzaWduYXR1cmVNb2RlLFxuICAgICAgICBzaG93TW9kZVRvZ2dsZTogc2hvdWxkU2hvd0NvbnRyb2xzICYmIHNob3dNb2RlVG9nZ2xlLFxuICAgICAgICBzaG93Q2xlYXJCdXR0b246IHNob3VsZFNob3dDb250cm9scyAmJiBzaG93Q2xlYXJCdXR0b24sXG4gICAgICAgIHNob3dTYXZlQnV0dG9uOiBzaG91bGRTaG93Q29udHJvbHMgJiYgc2hvd1NhdmVCdXR0b24sXG4gICAgICAgIHNhdmVCdXR0b25DYXB0aW9uOiBzYXZlQnV0dG9uQ2FwdGlvblRleHQsXG4gICAgICAgIHNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdCxcbiAgICAgICAgb25TYXZlOiBoYW5kbGVTYXZlLFxuICAgICAgICBpc1NhdmVFbmFibGVkOiAhIXNhdmVBY3Rpb24/LmNhbkV4ZWN1dGUgJiYgIWlzUmVhZE9ubHksXG4gICAgICAgIHNob3dIZWFkZXIsXG4gICAgICAgIGhlYWRlclRleHQ6IGhlYWRlclRleHRWYWx1ZSxcbiAgICAgICAgc2hvd1dhdGVybWFyazogc2hvdWxkU2hvd1dhdGVybWFyayxcbiAgICAgICAgd2F0ZXJtYXJrVGV4dCxcbiAgICAgICAgb25XYXRlcm1hcmtDaGFuZ2U6IGhhbmRsZVdhdGVybWFya0NoYW5nZSxcbiAgICAgICAgaXNXYXRlcm1hcmtSZWFkT25seTogaXNSZWFkT25seSB8fCAhIXdhdGVybWFya1ZhbHVlPy5yZWFkT25seSxcbiAgICAgICAgdHlwZUZvbnRGYW1pbHksXG4gICAgICAgIHR5cGVGb250U2l6ZSxcbiAgICAgICAgdHlwZVBsYWNlaG9sZGVyLFxuICAgICAgICBwZW5Db2xvcixcbiAgICAgICAgcGVuVHlwZSxcbiAgICAgICAgc2hvd0dyaWQsXG4gICAgICAgIGdyaWRCb3JkZXJDb2xvcixcbiAgICAgICAgZ3JpZEJvcmRlcldpZHRoLFxuICAgICAgICBncmlkQ2VsbEhlaWdodCxcbiAgICAgICAgZ3JpZENlbGxXaWR0aFxuICAgIH0pO1xufVxuIiwiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCwgUmVhY3RFbGVtZW50IH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IFNpZ25hdHVyZUNvbnRhaW5lciB9IGZyb20gXCIuL2NvbXBvbmVudHMvU2lnbmF0dXJlQ29udGFpbmVyXCI7XG5pbXBvcnQgeyBTaWduYXR1cmVDb250YWluZXJQcm9wcyB9IGZyb20gXCIuLi90eXBpbmdzL1NpZ25hdHVyZVByb3BzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaWduYXR1cmVXZWIocHJvcHM6IFNpZ25hdHVyZUNvbnRhaW5lclByb3BzKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBwcm9wc0FueSA9IHByb3BzIGFzIFNpZ25hdHVyZUNvbnRhaW5lclByb3BzICYge1xuICAgICAgICByZWFkT25seT86IGJvb2xlYW47XG4gICAgICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcbiAgICAgICAgZWRpdGFiaWxpdHk/OiBzdHJpbmc7XG4gICAgfTtcbiAgICBjb25zdCBlZGl0YWJpbGl0eSA9IHR5cGVvZiBwcm9wc0FueS5lZGl0YWJpbGl0eSA9PT0gXCJzdHJpbmdcIiA/IHByb3BzQW55LmVkaXRhYmlsaXR5LnRvTG93ZXJDYXNlKCkgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgcmVhZE9ubHkgPVxuICAgICAgICBwcm9wc0FueS5yZWFkT25seSA/P1xuICAgICAgICAocHJvcHNBbnkuZWRpdGFibGUgPT09IGZhbHNlID8gdHJ1ZSA6IHVuZGVmaW5lZCkgPz9cbiAgICAgICAgKHByb3BzQW55LmVkaXRhYmxlID09PSB0cnVlID8gZmFsc2UgOiB1bmRlZmluZWQpID8/XG4gICAgICAgIChlZGl0YWJpbGl0eSA9PT0gXCJuZXZlclwiIHx8IGVkaXRhYmlsaXR5ID09PSBcInJlYWQtb25seVwiIHx8IGVkaXRhYmlsaXR5ID09PSBcInJlYWRvbmx5XCIgPyB0cnVlIDogdW5kZWZpbmVkKSA/P1xuICAgICAgICAoZWRpdGFiaWxpdHkgPT09IFwiYWx3YXlzXCIgPyBmYWxzZSA6IHVuZGVmaW5lZCkgPz9cbiAgICAgICAgZmFsc2U7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8U2lnbmF0dXJlQ29udGFpbmVyXG4gICAgICAgICAgICBjbGFzc05hbWU9e3Byb3BzLmNsYXNzfVxuICAgICAgICAgICAgd3JhcHBlclN0eWxlPXtwcm9wcy5zdHlsZX1cbiAgICAgICAgICAgIHJlYWRPbmx5PXtyZWFkT25seX1cbiAgICAgICAgICAgIGRhdGFTb3VyY2U9e3Byb3BzLmRhdGFTb3VyY2V9XG4gICAgICAgICAgICBoYXNTaWduYXR1cmVBdHRyaWJ1dGU9e3Byb3BzLmhhc1NpZ25hdHVyZUF0dHJpYnV0ZX1cbiAgICAgICAgICAgIGZyaWVuZGx5SWQ9e3Byb3BzLm5hbWV9XG4gICAgICAgICAgICBzaWduYXR1cmVNb2RlPXtwcm9wcy5zaWduYXR1cmVNb2RlfVxuICAgICAgICAgICAgc2hvd01vZGVUb2dnbGU9e3Byb3BzLnNob3dNb2RlVG9nZ2xlfVxuICAgICAgICAgICAgc2hvd0NsZWFyQnV0dG9uPXtwcm9wcy5zaG93Q2xlYXJCdXR0b259XG4gICAgICAgICAgICBzaG93U2F2ZUJ1dHRvbj17cHJvcHMuc2hvd1NhdmVCdXR0b259XG4gICAgICAgICAgICBzYXZlQnV0dG9uQ2FwdGlvbj17cHJvcHMuc2F2ZUJ1dHRvbkNhcHRpb259XG4gICAgICAgICAgICBzYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHQ9e3Byb3BzLnNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdH1cbiAgICAgICAgICAgIG9uU2F2ZUFjdGlvbj17cHJvcHMub25TYXZlQWN0aW9ufVxuICAgICAgICAgICAgc2hvd0hlYWRlcj17cHJvcHMuc2hvd0hlYWRlcn1cbiAgICAgICAgICAgIGhlYWRlclRleHQ9e3Byb3BzLmhlYWRlclRleHR9XG4gICAgICAgICAgICBoZWFkZXJUZXh0RGVmYXVsdD17cHJvcHMuaGVhZGVyVGV4dERlZmF1bHR9XG4gICAgICAgICAgICBiYXNlNjRBdHRyaWJ1dGU9e3Byb3BzLmJhc2U2NEF0dHJpYnV0ZX1cbiAgICAgICAgICAgIHNob3dXYXRlcm1hcms9e3Byb3BzLnNob3dXYXRlcm1hcmt9XG4gICAgICAgICAgICB3YXRlcm1hcmtBdHRyaWJ1dGU9e3Byb3BzLndhdGVybWFya0F0dHJpYnV0ZX1cbiAgICAgICAgICAgIHR5cGVGb250RmFtaWx5PXtwcm9wcy50eXBlRm9udEZhbWlseX1cbiAgICAgICAgICAgIHR5cGVGb250U2l6ZT17cHJvcHMudHlwZUZvbnRTaXplfVxuICAgICAgICAgICAgdHlwZVBsYWNlaG9sZGVyPXtwcm9wcy50eXBlUGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICB3aWR0aD17cHJvcHMud2lkdGh9XG4gICAgICAgICAgICB3aWR0aFVuaXQ9e3Byb3BzLndpZHRoVW5pdH1cbiAgICAgICAgICAgIGhlaWdodD17cHJvcHMuaGVpZ2h0fVxuICAgICAgICAgICAgaGVpZ2h0VW5pdD17cHJvcHMuaGVpZ2h0VW5pdH1cbiAgICAgICAgICAgIHNob3dHcmlkPXtwcm9wcy5zaG93R3JpZH1cbiAgICAgICAgICAgIGdyaWRCb3JkZXJDb2xvcj17cHJvcHMuZ3JpZEJvcmRlckNvbG9yfVxuICAgICAgICAgICAgZ3JpZEJvcmRlcldpZHRoPXtwcm9wcy5ncmlkQm9yZGVyV2lkdGh9XG4gICAgICAgICAgICBncmlkQ2VsbEhlaWdodD17cHJvcHMuZ3JpZENlbGxIZWlnaHR9XG4gICAgICAgICAgICBncmlkQ2VsbFdpZHRoPXtwcm9wcy5ncmlkQ2VsbFdpZHRofVxuICAgICAgICAgICAgcGVuQ29sb3I9e3Byb3BzLnBlbkNvbG9yfVxuICAgICAgICAgICAgcGVuVHlwZT17cHJvcHMucGVuVHlwZX1cbiAgICAgICAgLz5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbIlBvaW50IiwiY29uc3RydWN0b3IiLCJ4IiwieSIsInByZXNzdXJlIiwidGltZSIsImlzTmFOIiwiRXJyb3IiLCJEYXRlIiwibm93IiwiZGlzdGFuY2VUbyIsInN0YXJ0IiwiTWF0aCIsInNxcnQiLCJwb3ciLCJlcXVhbHMiLCJvdGhlciIsInZlbG9jaXR5RnJvbSIsImhhc093biIsImhhc093blByb3BlcnR5IiwiY2xhc3NOYW1lcyIsImNsYXNzZXMiLCJpIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiYXJnIiwiYXBwZW5kQ2xhc3MiLCJwYXJzZVZhbHVlIiwiQXJyYXkiLCJpc0FycmF5IiwiYXBwbHkiLCJ0b1N0cmluZyIsIk9iamVjdCIsInByb3RvdHlwZSIsImluY2x1ZGVzIiwia2V5IiwiY2FsbCIsInZhbHVlIiwibmV3Q2xhc3MiLCJtb2R1bGUiLCJleHBvcnRzIiwiZGVmYXVsdCIsIndpbmRvdyIsImlzT2JqZWN0IiwidHlwZSIsImZyZWVHbG9iYWwiLCJnbG9iYWwiLCJyZXF1aXJlIiwiZnJlZVNlbGYiLCJzZWxmIiwicm9vdCIsIkZ1bmN0aW9uIiwicmVXaGl0ZXNwYWNlIiwidHJpbW1lZEVuZEluZGV4Iiwic3RyaW5nIiwiaW5kZXgiLCJ0ZXN0IiwiY2hhckF0IiwicmVUcmltU3RhcnQiLCJiYXNlVHJpbSIsInNsaWNlIiwicmVwbGFjZSIsIlN5bWJvbCIsIm9iamVjdFByb3RvIiwibmF0aXZlT2JqZWN0VG9TdHJpbmciLCJzeW1Ub1N0cmluZ1RhZyIsInRvU3RyaW5nVGFnIiwidW5kZWZpbmVkIiwiZ2V0UmF3VGFnIiwiaXNPd24iLCJ0YWciLCJ1bm1hc2tlZCIsImUiLCJyZXN1bHQiLCJvYmplY3RUb1N0cmluZyIsIm51bGxUYWciLCJ1bmRlZmluZWRUYWciLCJiYXNlR2V0VGFnIiwiaXNPYmplY3RMaWtlIiwic3ltYm9sVGFnIiwiaXNTeW1ib2wiLCJOQU4iLCJyZUlzQmFkSGV4IiwicmVJc0JpbmFyeSIsInJlSXNPY3RhbCIsImZyZWVQYXJzZUludCIsInBhcnNlSW50IiwidG9OdW1iZXIiLCJ2YWx1ZU9mIiwiaXNCaW5hcnkiLCJGVU5DX0VSUk9SX1RFWFQiLCJuYXRpdmVNYXgiLCJtYXgiLCJuYXRpdmVNaW4iLCJtaW4iLCJkZWJvdW5jZSIsImZ1bmMiLCJ3YWl0Iiwib3B0aW9ucyIsImxhc3RBcmdzIiwibGFzdFRoaXMiLCJtYXhXYWl0IiwidGltZXJJZCIsImxhc3RDYWxsVGltZSIsImxhc3RJbnZva2VUaW1lIiwibGVhZGluZyIsIm1heGluZyIsInRyYWlsaW5nIiwiVHlwZUVycm9yIiwiaW52b2tlRnVuYyIsImFyZ3MiLCJ0aGlzQXJnIiwibGVhZGluZ0VkZ2UiLCJzZXRUaW1lb3V0IiwidGltZXJFeHBpcmVkIiwicmVtYWluaW5nV2FpdCIsInRpbWVTaW5jZUxhc3RDYWxsIiwidGltZVNpbmNlTGFzdEludm9rZSIsInRpbWVXYWl0aW5nIiwic2hvdWxkSW52b2tlIiwidHJhaWxpbmdFZGdlIiwiY2FuY2VsIiwiY2xlYXJUaW1lb3V0IiwiZmx1c2giLCJkZWJvdW5jZWQiLCJpc0ludm9raW5nIiwidGhyb3R0bGUiLCJleHRlbmRTdGF0aWNzIiwiZCIsImIiLCJzZXRQcm90b3R5cGVPZiIsIl9fcHJvdG9fXyIsInAiLCJfX2V4dGVuZHMiLCJTdHJpbmciLCJfXyIsImNyZWF0ZSIsIl9fcmVzdCIsInMiLCJ0IiwiaW5kZXhPZiIsImdldE93blByb3BlcnR5U3ltYm9scyIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwiU3VwcHJlc3NlZEVycm9yIiwiZXJyb3IiLCJzdXBwcmVzc2VkIiwibWVzc2FnZSIsIm5hbWUiLCJSZWFjdFJlc2l6ZURldGVjdG9yIiwiU2lnbmF0dXJlQ2FudmFzIl0sIm1hcHBpbmdzIjoi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LEtBQUssQ0FBQyxVQUFVLEVBQzVCLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxpQkFBaUIsRUFDMUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxlQUFlLEVBQ3RDLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxFQUNsQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsa0JBQWtCLEVBQzVDLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUNwQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFDaEMsZUFBZSxFQUFFLEtBQUssQ0FBQyxlQUFlLEVBQ3RDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUNsQixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFDMUIsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQ3BCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUM1QixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFDeEIsZUFBZSxFQUFFLEtBQUssQ0FBQyxlQUFlLEVBQ3RDLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZSxFQUN0QyxjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFDcEMsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQ2xDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUN4QixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFDeEIsQ0FBQSxFQUNKO0FBQ047Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4XX0=
