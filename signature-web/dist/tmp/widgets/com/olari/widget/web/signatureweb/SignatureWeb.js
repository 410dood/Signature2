define(['exports', 'react', 'react-dom'], (function (exports, React, reactDom) { 'use strict';

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

    function resolveObjectItem(dataSource) {
        if (!dataSource) {
            return undefined;
        }
        return dataSource.status === "available" /* ValueStatus.Available */ ? dataSource.items?.[0] : undefined;
    }
    function SignatureContainer(props) {
        const { dataSource, hasSignatureAttribute, wrapperStyle, className, readOnly, friendlyId, signatureMode, showModeToggle, showClearButton, showSaveButton, saveButtonCaption, saveButtonCaptionDefault, onSaveAction, showHeader, headerText, headerTextDefault, base64Attribute, showWatermark, watermarkAttribute, typeFontFamily, typeFontSize, typePlaceholder, penColor, penType, showGrid, gridBorderColor, gridBorderWidth, gridCellHeight, gridCellWidth, width, widthUnit, height, heightUnit } = props;
        const mxObject = React.useMemo(() => resolveObjectItem(dataSource), [dataSource]);
        const signatureAttribute = React.useMemo(() => {
            if (!mxObject || !hasSignatureAttribute) {
                return undefined;
            }
            return hasSignatureAttribute.get(mxObject);
        }, [hasSignatureAttribute, mxObject]);
        const alertMessage = React.useMemo(() => {
            if (!mxObject) {
                return `${friendlyId}: Data source is empty.`;
            }
            return "";
        }, [friendlyId, mxObject]);
        const isReadOnly = React.useMemo(() => {
            return readOnly || !mxObject;
        }, [mxObject, readOnly]);
        const watermarkValue = React.useMemo(() => {
            if (!mxObject || !watermarkAttribute) {
                return undefined;
            }
            return watermarkAttribute.get(mxObject);
        }, [mxObject, watermarkAttribute]);
        const watermarkText = React.useMemo(() => {
            if (!watermarkValue || watermarkValue.status !== "available" /* ValueStatus.Available */) {
                return "";
            }
            return watermarkValue.value ?? "";
        }, [watermarkValue]);
        const handleWatermarkChange = React.useCallback((value) => {
            if (!watermarkValue || watermarkValue.status !== "available" /* ValueStatus.Available */ || watermarkValue.readOnly) {
                return;
            }
            watermarkValue.setValue(value);
        }, [watermarkValue]);
        const saveButtonCaptionText = React.useMemo(() => {
            if (!mxObject || !saveButtonCaption) {
                return saveButtonCaptionDefault;
            }
            const captionValue = saveButtonCaption.get(mxObject);
            if (captionValue.status !== "available" /* ValueStatus.Available */) {
                return saveButtonCaptionDefault;
            }
            return captionValue.value !== "" ? captionValue.value : saveButtonCaptionDefault;
        }, [mxObject, saveButtonCaption, saveButtonCaptionDefault]);
        const headerTextValue = React.useMemo(() => {
            if (!mxObject || !headerText) {
                return headerTextDefault;
            }
            const headerValue = headerText.get(mxObject);
            if (headerValue.status !== "available" /* ValueStatus.Available */) {
                return headerTextDefault;
            }
            return headerValue.value !== "" ? headerValue.value : headerTextDefault;
        }, [mxObject, headerText, headerTextDefault]);
        const saveAction = React.useMemo(() => {
            if (!mxObject || !onSaveAction) {
                return undefined;
            }
            return onSaveAction.get(mxObject);
        }, [mxObject, onSaveAction]);
        const base64Value = React.useMemo(() => {
            if (!mxObject || !base64Attribute) {
                return undefined;
            }
            return base64Attribute.get(mxObject);
        }, [mxObject, base64Attribute]);
        const setBase64Value = React.useCallback((value) => {
            if (!base64Value || base64Value.status !== "available" /* ValueStatus.Available */ || base64Value.readOnly) {
                return;
            }
            base64Value.setValue(value);
        }, [base64Value]);
        const generateFileName = React.useCallback((guid) => {
            return `signature-${guid}.png`;
        }, []);
        const saveDocument = React.useCallback((base64Uri, onSuccess) => {
            if (!base64Uri || !mxObject) {
                return;
            }
            mx.data.saveDocument(mxObject.id, generateFileName(mxObject.id), {}, Utils.convertUrlToBlob(base64Uri), () => {
                if (onSuccess) {
                    onSuccess();
                }
            }, (err) => mx.ui.error(`Error saving signature: ${err.message}`));
        }, [generateFileName, mxObject]);
        const lastSignatureDataUrlRef = React.useRef();
        const handleSignEnd = React.useCallback((base64Uri) => {
            if (!base64Uri || !mxObject || isReadOnly) {
                return;
            }
            lastSignatureDataUrlRef.current = base64Uri;
            setBase64Value(base64Uri);
            saveDocument(base64Uri);
        }, [isReadOnly, mxObject, saveDocument, setBase64Value]);
        const handleSave = React.useCallback((base64Uri) => {
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
        return React.createElement(Signature, {
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
        return (React.createElement(SignatureContainer, { className: props.class, wrapperStyle: props.style, readOnly: readOnly, dataSource: props.dataSource, hasSignatureAttribute: props.hasSignatureAttribute, friendlyId: props.name, signatureMode: props.signatureMode, showModeToggle: props.showModeToggle, showClearButton: props.showClearButton, showSaveButton: props.showSaveButton, saveButtonCaption: props.saveButtonCaption, saveButtonCaptionDefault: props.saveButtonCaptionDefault, onSaveAction: props.onSaveAction, showHeader: props.showHeader, headerText: props.headerText, headerTextDefault: props.headerTextDefault, base64Attribute: props.base64Attribute, showWatermark: props.showWatermark, watermarkAttribute: props.watermarkAttribute, typeFontFamily: props.typeFontFamily, typeFontSize: props.typeFontSize, typePlaceholder: props.typePlaceholder, width: props.width, widthUnit: props.widthUnit, height: props.height, heightUnit: props.heightUnit, showGrid: props.showGrid, gridBorderColor: props.gridBorderColor, gridBorderWidth: props.gridBorderWidth, gridCellHeight: props.gridCellHeight, gridCellWidth: props.gridCellWidth, penColor: props.penColor, penType: props.penType }));
    }

    exports.SignatureWeb = SignatureWeb;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmF0dXJlV2ViLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvVXRpbHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc2lnbmF0dXJlX3BhZC9kaXN0L3NpZ25hdHVyZV9wYWQuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvbm93LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fdHJpbW1lZEVuZEluZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRyaW0uanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRSYXdUYWcuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRUYWcuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNTeW1ib2wuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL3RvTnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9kZWJvdW5jZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvdGhyb3R0bGUuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QtcmVzaXplLWRldGVjdG9yL2J1aWxkL2luZGV4LmVzbS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL0FsZXJ0LnRzeCIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL0dyaWQudHN4IiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvU2l6ZUNvbnRhaW5lci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1NpZ25hdHVyZS50c3giLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9TaWduYXR1cmVDb250YWluZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvU2lnbmF0dXJlV2ViLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4dHJhbmVvdXMtY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFV0aWxzIHtcbiAgICBzdGF0aWMgY29udmVydFVybFRvQmxvYihiYXNlNjRVcmk6IHN0cmluZyk6IEJsb2Ige1xuICAgICAgICBjb25zdCBjb250ZW50VHlwZSA9IFwiaW1hZ2UvcG5nXCI7XG4gICAgICAgIGNvbnN0IHNsaWNlU2l6ZSA9IDUxMjtcbiAgICAgICAgY29uc3QgYnl0ZUNoYXJhY3RlcnMgPSBhdG9iKGJhc2U2NFVyaS5zcGxpdChcIjtiYXNlNjQsXCIpWzFdKTtcbiAgICAgICAgY29uc3QgYnl0ZUFycmF5cyA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IG9mZnNldCA9IDA7IG9mZnNldCA8IGJ5dGVDaGFyYWN0ZXJzLmxlbmd0aDsgb2Zmc2V0ICs9IHNsaWNlU2l6ZSkge1xuICAgICAgICAgICAgY29uc3Qgc2xpY2UgPSBieXRlQ2hhcmFjdGVycy5zbGljZShvZmZzZXQsIG9mZnNldCArIHNsaWNlU2l6ZSk7XG4gICAgICAgICAgICBjb25zdCBieXRlTnVtYmVycyA9IG5ldyBBcnJheShzbGljZS5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGljZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGJ5dGVOdW1iZXJzW2ldID0gc2xpY2UuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJ5dGVBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ5dGVOdW1iZXJzKTtcbiAgICAgICAgICAgIGJ5dGVBcnJheXMucHVzaChieXRlQXJyYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKGJ5dGVBcnJheXMsIHsgdHlwZTogY29udGVudFR5cGUgfSk7XG4gICAgfVxufVxuIiwiLyohXG4gKiBTaWduYXR1cmUgUGFkIHY0LjAuMCB8IGh0dHBzOi8vZ2l0aHViLmNvbS9zemltZWsvc2lnbmF0dXJlX3BhZFxuICogKGMpIDIwMjEgU3p5bW9uIE5vd2FrIHwgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cblxuY2xhc3MgUG9pbnQge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHByZXNzdXJlLCB0aW1lKSB7XG4gICAgICAgIGlmIChpc05hTih4KSB8fCBpc05hTih5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQb2ludCBpcyBpbnZhbGlkOiAoJHt4fSwgJHt5fSlgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnggPSAreDtcbiAgICAgICAgdGhpcy55ID0gK3k7XG4gICAgICAgIHRoaXMucHJlc3N1cmUgPSBwcmVzc3VyZSB8fCAwO1xuICAgICAgICB0aGlzLnRpbWUgPSB0aW1lIHx8IERhdGUubm93KCk7XG4gICAgfVxuICAgIGRpc3RhbmNlVG8oc3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh0aGlzLnggLSBzdGFydC54LCAyKSArIE1hdGgucG93KHRoaXMueSAtIHN0YXJ0LnksIDIpKTtcbiAgICB9XG4gICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgIHJldHVybiAodGhpcy54ID09PSBvdGhlci54ICYmXG4gICAgICAgICAgICB0aGlzLnkgPT09IG90aGVyLnkgJiZcbiAgICAgICAgICAgIHRoaXMucHJlc3N1cmUgPT09IG90aGVyLnByZXNzdXJlICYmXG4gICAgICAgICAgICB0aGlzLnRpbWUgPT09IG90aGVyLnRpbWUpO1xuICAgIH1cbiAgICB2ZWxvY2l0eUZyb20oc3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZSAhPT0gc3RhcnQudGltZVxuICAgICAgICAgICAgPyB0aGlzLmRpc3RhbmNlVG8oc3RhcnQpIC8gKHRoaXMudGltZSAtIHN0YXJ0LnRpbWUpXG4gICAgICAgICAgICA6IDA7XG4gICAgfVxufVxuXG5jbGFzcyBCZXppZXIge1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0UG9pbnQsIGNvbnRyb2wyLCBjb250cm9sMSwgZW5kUG9pbnQsIHN0YXJ0V2lkdGgsIGVuZFdpZHRoKSB7XG4gICAgICAgIHRoaXMuc3RhcnRQb2ludCA9IHN0YXJ0UG9pbnQ7XG4gICAgICAgIHRoaXMuY29udHJvbDIgPSBjb250cm9sMjtcbiAgICAgICAgdGhpcy5jb250cm9sMSA9IGNvbnRyb2wxO1xuICAgICAgICB0aGlzLmVuZFBvaW50ID0gZW5kUG9pbnQ7XG4gICAgICAgIHRoaXMuc3RhcnRXaWR0aCA9IHN0YXJ0V2lkdGg7XG4gICAgICAgIHRoaXMuZW5kV2lkdGggPSBlbmRXaWR0aDtcbiAgICB9XG4gICAgc3RhdGljIGZyb21Qb2ludHMocG9pbnRzLCB3aWR0aHMpIHtcbiAgICAgICAgY29uc3QgYzIgPSB0aGlzLmNhbGN1bGF0ZUNvbnRyb2xQb2ludHMocG9pbnRzWzBdLCBwb2ludHNbMV0sIHBvaW50c1syXSkuYzI7XG4gICAgICAgIGNvbnN0IGMzID0gdGhpcy5jYWxjdWxhdGVDb250cm9sUG9pbnRzKHBvaW50c1sxXSwgcG9pbnRzWzJdLCBwb2ludHNbM10pLmMxO1xuICAgICAgICByZXR1cm4gbmV3IEJlemllcihwb2ludHNbMV0sIGMyLCBjMywgcG9pbnRzWzJdLCB3aWR0aHMuc3RhcnQsIHdpZHRocy5lbmQpO1xuICAgIH1cbiAgICBzdGF0aWMgY2FsY3VsYXRlQ29udHJvbFBvaW50cyhzMSwgczIsIHMzKSB7XG4gICAgICAgIGNvbnN0IGR4MSA9IHMxLnggLSBzMi54O1xuICAgICAgICBjb25zdCBkeTEgPSBzMS55IC0gczIueTtcbiAgICAgICAgY29uc3QgZHgyID0gczIueCAtIHMzLng7XG4gICAgICAgIGNvbnN0IGR5MiA9IHMyLnkgLSBzMy55O1xuICAgICAgICBjb25zdCBtMSA9IHsgeDogKHMxLnggKyBzMi54KSAvIDIuMCwgeTogKHMxLnkgKyBzMi55KSAvIDIuMCB9O1xuICAgICAgICBjb25zdCBtMiA9IHsgeDogKHMyLnggKyBzMy54KSAvIDIuMCwgeTogKHMyLnkgKyBzMy55KSAvIDIuMCB9O1xuICAgICAgICBjb25zdCBsMSA9IE1hdGguc3FydChkeDEgKiBkeDEgKyBkeTEgKiBkeTEpO1xuICAgICAgICBjb25zdCBsMiA9IE1hdGguc3FydChkeDIgKiBkeDIgKyBkeTIgKiBkeTIpO1xuICAgICAgICBjb25zdCBkeG0gPSBtMS54IC0gbTIueDtcbiAgICAgICAgY29uc3QgZHltID0gbTEueSAtIG0yLnk7XG4gICAgICAgIGNvbnN0IGsgPSBsMiAvIChsMSArIGwyKTtcbiAgICAgICAgY29uc3QgY20gPSB7IHg6IG0yLnggKyBkeG0gKiBrLCB5OiBtMi55ICsgZHltICogayB9O1xuICAgICAgICBjb25zdCB0eCA9IHMyLnggLSBjbS54O1xuICAgICAgICBjb25zdCB0eSA9IHMyLnkgLSBjbS55O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYzE6IG5ldyBQb2ludChtMS54ICsgdHgsIG0xLnkgKyB0eSksXG4gICAgICAgICAgICBjMjogbmV3IFBvaW50KG0yLnggKyB0eCwgbTIueSArIHR5KSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbGVuZ3RoKCkge1xuICAgICAgICBjb25zdCBzdGVwcyA9IDEwO1xuICAgICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgICAgbGV0IHB4O1xuICAgICAgICBsZXQgcHk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHN0ZXBzOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSBpIC8gc3RlcHM7XG4gICAgICAgICAgICBjb25zdCBjeCA9IHRoaXMucG9pbnQodCwgdGhpcy5zdGFydFBvaW50LngsIHRoaXMuY29udHJvbDEueCwgdGhpcy5jb250cm9sMi54LCB0aGlzLmVuZFBvaW50LngpO1xuICAgICAgICAgICAgY29uc3QgY3kgPSB0aGlzLnBvaW50KHQsIHRoaXMuc3RhcnRQb2ludC55LCB0aGlzLmNvbnRyb2wxLnksIHRoaXMuY29udHJvbDIueSwgdGhpcy5lbmRQb2ludC55KTtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHhkaWZmID0gY3ggLSBweDtcbiAgICAgICAgICAgICAgICBjb25zdCB5ZGlmZiA9IGN5IC0gcHk7XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IE1hdGguc3FydCh4ZGlmZiAqIHhkaWZmICsgeWRpZmYgKiB5ZGlmZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweCA9IGN4O1xuICAgICAgICAgICAgcHkgPSBjeTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgICBwb2ludCh0LCBzdGFydCwgYzEsIGMyLCBlbmQpIHtcbiAgICAgICAgcmV0dXJuIChzdGFydCAqICgxLjAgLSB0KSAqICgxLjAgLSB0KSAqICgxLjAgLSB0KSlcbiAgICAgICAgICAgICsgKDMuMCAqIGMxICogKDEuMCAtIHQpICogKDEuMCAtIHQpICogdClcbiAgICAgICAgICAgICsgKDMuMCAqIGMyICogKDEuMCAtIHQpICogdCAqIHQpXG4gICAgICAgICAgICArIChlbmQgKiB0ICogdCAqIHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGhyb3R0bGUoZm4sIHdhaXQgPSAyNTApIHtcbiAgICBsZXQgcHJldmlvdXMgPSAwO1xuICAgIGxldCB0aW1lb3V0ID0gbnVsbDtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGxldCBzdG9yZWRDb250ZXh0O1xuICAgIGxldCBzdG9yZWRBcmdzO1xuICAgIGNvbnN0IGxhdGVyID0gKCkgPT4ge1xuICAgICAgICBwcmV2aW91cyA9IERhdGUubm93KCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICByZXN1bHQgPSBmbi5hcHBseShzdG9yZWRDb250ZXh0LCBzdG9yZWRBcmdzKTtcbiAgICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICBzdG9yZWRDb250ZXh0ID0gbnVsbDtcbiAgICAgICAgICAgIHN0b3JlZEFyZ3MgPSBbXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHdyYXBwZXIoLi4uYXJncykge1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgICAgc3RvcmVkQ29udGV4dCA9IHRoaXM7XG4gICAgICAgIHN0b3JlZEFyZ3MgPSBhcmdzO1xuICAgICAgICBpZiAocmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCkge1xuICAgICAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgICAgIHJlc3VsdCA9IGZuLmFwcGx5KHN0b3JlZENvbnRleHQsIHN0b3JlZEFyZ3MpO1xuICAgICAgICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgc3RvcmVkQ29udGV4dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgc3RvcmVkQXJncyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICB0aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xufVxuXG5jbGFzcyBTaWduYXR1cmVQYWQgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gICAgY29uc3RydWN0b3IoY2FudmFzLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuX2hhbmRsZU1vdXNlRG93biA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbnMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3bmluZ1N0cm9rZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Ryb2tlQmVnaW4oZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVNb3VzZU1vdmUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kcmF3bmluZ1N0cm9rZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0cm9rZU1vdmVVcGRhdGUoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVNb3VzZVVwID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9ucyA9PT0gMSAmJiB0aGlzLl9kcmF3bmluZ1N0cm9rZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXduaW5nU3Ryb2tlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Ryb2tlRW5kKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlVG91Y2hTdGFydCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Ryb2tlQmVnaW4odG91Y2gpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVUb3VjaE1vdmUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBjb25zdCB0b3VjaCA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF07XG4gICAgICAgICAgICB0aGlzLl9zdHJva2VNb3ZlVXBkYXRlKHRvdWNoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlVG91Y2hFbmQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHdhc0NhbnZhc1RvdWNoZWQgPSBldmVudC50YXJnZXQgPT09IHRoaXMuY2FudmFzO1xuICAgICAgICAgICAgaWYgKHdhc0NhbnZhc1RvdWNoZWQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Ryb2tlRW5kKHRvdWNoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlUG9pbnRlclN0YXJ0ID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9kcmF3bmluZ1N0cm9rZSA9IHRydWU7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5fc3Ryb2tlQmVnaW4oZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9oYW5kbGVQb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RyYXduaW5nU3Ryb2tlKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VNb3ZlVXBkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faGFuZGxlUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZHJhd25pbmdTdHJva2UgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IHdhc0NhbnZhc1RvdWNoZWQgPSBldmVudC50YXJnZXQgPT09IHRoaXMuY2FudmFzO1xuICAgICAgICAgICAgaWYgKHdhc0NhbnZhc1RvdWNoZWQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0cm9rZUVuZChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudmVsb2NpdHlGaWx0ZXJXZWlnaHQgPSBvcHRpb25zLnZlbG9jaXR5RmlsdGVyV2VpZ2h0IHx8IDAuNztcbiAgICAgICAgdGhpcy5taW5XaWR0aCA9IG9wdGlvbnMubWluV2lkdGggfHwgMC41O1xuICAgICAgICB0aGlzLm1heFdpZHRoID0gb3B0aW9ucy5tYXhXaWR0aCB8fCAyLjU7XG4gICAgICAgIHRoaXMudGhyb3R0bGUgPSAoJ3Rocm90dGxlJyBpbiBvcHRpb25zID8gb3B0aW9ucy50aHJvdHRsZSA6IDE2KTtcbiAgICAgICAgdGhpcy5taW5EaXN0YW5jZSA9ICgnbWluRGlzdGFuY2UnIGluIG9wdGlvbnMgPyBvcHRpb25zLm1pbkRpc3RhbmNlIDogNSk7XG4gICAgICAgIHRoaXMuZG90U2l6ZSA9IG9wdGlvbnMuZG90U2l6ZSB8fCAwO1xuICAgICAgICB0aGlzLnBlbkNvbG9yID0gb3B0aW9ucy5wZW5Db2xvciB8fCAnYmxhY2snO1xuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IG9wdGlvbnMuYmFja2dyb3VuZENvbG9yIHx8ICdyZ2JhKDAsMCwwLDApJztcbiAgICAgICAgdGhpcy5fc3Ryb2tlTW92ZVVwZGF0ZSA9IHRoaXMudGhyb3R0bGVcbiAgICAgICAgICAgID8gdGhyb3R0bGUoU2lnbmF0dXJlUGFkLnByb3RvdHlwZS5fc3Ryb2tlVXBkYXRlLCB0aGlzLnRocm90dGxlKVxuICAgICAgICAgICAgOiBTaWduYXR1cmVQYWQucHJvdG90eXBlLl9zdHJva2VVcGRhdGU7XG4gICAgICAgIHRoaXMuX2N0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMub24oKTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIGNvbnN0IHsgX2N0eDogY3R4LCBjYW52YXMgfSA9IHRoaXM7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgICB0aGlzLl9pc0VtcHR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgZnJvbURhdGFVUkwoZGF0YVVybCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgY29uc3QgcmF0aW8gPSBvcHRpb25zLnJhdGlvIHx8IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IG9wdGlvbnMud2lkdGggfHwgdGhpcy5jYW52YXMud2lkdGggLyByYXRpbztcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0IHx8IHRoaXMuY2FudmFzLmhlaWdodCAvIHJhdGlvO1xuICAgICAgICAgICAgY29uc3QgeE9mZnNldCA9IG9wdGlvbnMueE9mZnNldCB8fCAwO1xuICAgICAgICAgICAgY29uc3QgeU9mZnNldCA9IG9wdGlvbnMueU9mZnNldCB8fCAwO1xuICAgICAgICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdHguZHJhd0ltYWdlKGltYWdlLCB4T2Zmc2V0LCB5T2Zmc2V0LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1hZ2Uub25lcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1hZ2UuY3Jvc3NPcmlnaW4gPSAnYW5vbnltb3VzJztcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IGRhdGFVcmw7XG4gICAgICAgICAgICB0aGlzLl9pc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b0RhdGFVUkwodHlwZSA9ICdpbWFnZS9wbmcnLCBlbmNvZGVyT3B0aW9ucykge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlL3N2Zyt4bWwnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl90b1NWRygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMudG9EYXRhVVJMKHR5cGUsIGVuY29kZXJPcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvbigpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUudG91Y2hBY3Rpb24gPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm1zVG91Y2hBY3Rpb24gPSAnbm9uZSc7XG4gICAgICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVQb2ludGVyRXZlbnRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVNb3VzZUV2ZW50cygpO1xuICAgICAgICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZVRvdWNoRXZlbnRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb2ZmKCkge1xuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3VjaEFjdGlvbiA9ICdhdXRvJztcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUubXNUb3VjaEFjdGlvbiA9ICdhdXRvJztcbiAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB0aGlzLl9oYW5kbGVQb2ludGVyU3RhcnQpO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHRoaXMuX2hhbmRsZVBvaW50ZXJNb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcy5faGFuZGxlUG9pbnRlckVuZCk7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZU1vdXNlRG93bik7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZU1vdXNlTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKTtcbiAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX2hhbmRsZVRvdWNoU3RhcnQpO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVUb3VjaE1vdmUpO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZVRvdWNoRW5kKTtcbiAgICB9XG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzRW1wdHk7XG4gICAgfVxuICAgIGZyb21EYXRhKHBvaW50R3JvdXBzLCB7IGNsZWFyID0gdHJ1ZSB9ID0ge30pIHtcbiAgICAgICAgaWYgKGNsZWFyKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZnJvbURhdGEocG9pbnRHcm91cHMsIHRoaXMuX2RyYXdDdXJ2ZS5iaW5kKHRoaXMpLCB0aGlzLl9kcmF3RG90LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9kYXRhID0gY2xlYXIgPyBwb2ludEdyb3VwcyA6IHRoaXMuX2RhdGEuY29uY2F0KHBvaW50R3JvdXBzKTtcbiAgICB9XG4gICAgdG9EYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgICB9XG4gICAgX3N0cm9rZUJlZ2luKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2JlZ2luU3Ryb2tlJywgeyBkZXRhaWw6IGV2ZW50IH0pKTtcbiAgICAgICAgY29uc3QgbmV3UG9pbnRHcm91cCA9IHtcbiAgICAgICAgICAgIGRvdFNpemU6IHRoaXMuZG90U2l6ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiB0aGlzLm1pbldpZHRoLFxuICAgICAgICAgICAgbWF4V2lkdGg6IHRoaXMubWF4V2lkdGgsXG4gICAgICAgICAgICBwZW5Db2xvcjogdGhpcy5wZW5Db2xvcixcbiAgICAgICAgICAgIHBvaW50czogW10sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2RhdGEucHVzaChuZXdQb2ludEdyb3VwKTtcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgICAgdGhpcy5fc3Ryb2tlVXBkYXRlKGV2ZW50KTtcbiAgICB9XG4gICAgX3N0cm9rZVVwZGF0ZShldmVudCkge1xuICAgICAgICBpZiAodGhpcy5fZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3N0cm9rZUJlZ2luKGV2ZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdiZWZvcmVVcGRhdGVTdHJva2UnLCB7IGRldGFpbDogZXZlbnQgfSkpO1xuICAgICAgICBjb25zdCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIGNvbnN0IHByZXNzdXJlID0gZXZlbnQucHJlc3N1cmUgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBldmVudC5wcmVzc3VyZVxuICAgICAgICAgICAgOiBldmVudC5mb3JjZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBldmVudC5mb3JjZVxuICAgICAgICAgICAgICAgIDogMDtcbiAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLl9jcmVhdGVQb2ludCh4LCB5LCBwcmVzc3VyZSk7XG4gICAgICAgIGNvbnN0IGxhc3RQb2ludEdyb3VwID0gdGhpcy5fZGF0YVt0aGlzLl9kYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCBsYXN0UG9pbnRzID0gbGFzdFBvaW50R3JvdXAucG9pbnRzO1xuICAgICAgICBjb25zdCBsYXN0UG9pbnQgPSBsYXN0UG9pbnRzLmxlbmd0aCA+IDAgJiYgbGFzdFBvaW50c1tsYXN0UG9pbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCBpc0xhc3RQb2ludFRvb0Nsb3NlID0gbGFzdFBvaW50XG4gICAgICAgICAgICA/IHBvaW50LmRpc3RhbmNlVG8obGFzdFBvaW50KSA8PSB0aGlzLm1pbkRpc3RhbmNlXG4gICAgICAgICAgICA6IGZhbHNlO1xuICAgICAgICBjb25zdCB7IHBlbkNvbG9yLCBkb3RTaXplLCBtaW5XaWR0aCwgbWF4V2lkdGggfSA9IGxhc3RQb2ludEdyb3VwO1xuICAgICAgICBpZiAoIWxhc3RQb2ludCB8fCAhKGxhc3RQb2ludCAmJiBpc0xhc3RQb2ludFRvb0Nsb3NlKSkge1xuICAgICAgICAgICAgY29uc3QgY3VydmUgPSB0aGlzLl9hZGRQb2ludChwb2ludCk7XG4gICAgICAgICAgICBpZiAoIWxhc3RQb2ludCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdEb3QocG9pbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgcGVuQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICAgICAgIG1pbldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGN1cnZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhd0N1cnZlKGN1cnZlLCB7XG4gICAgICAgICAgICAgICAgICAgIHBlbkNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0UG9pbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHRpbWU6IHBvaW50LnRpbWUsXG4gICAgICAgICAgICAgICAgeDogcG9pbnQueCxcbiAgICAgICAgICAgICAgICB5OiBwb2ludC55LFxuICAgICAgICAgICAgICAgIHByZXNzdXJlOiBwb2ludC5wcmVzc3VyZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2FmdGVyVXBkYXRlU3Ryb2tlJywgeyBkZXRhaWw6IGV2ZW50IH0pKTtcbiAgICB9XG4gICAgX3N0cm9rZUVuZChldmVudCkge1xuICAgICAgICB0aGlzLl9zdHJva2VVcGRhdGUoZXZlbnQpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdlbmRTdHJva2UnLCB7IGRldGFpbDogZXZlbnQgfSkpO1xuICAgIH1cbiAgICBfaGFuZGxlUG9pbnRlckV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5fZHJhd25pbmdTdHJva2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB0aGlzLl9oYW5kbGVQb2ludGVyU3RhcnQpO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHRoaXMuX2hhbmRsZVBvaW50ZXJNb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcy5faGFuZGxlUG9pbnRlckVuZCk7XG4gICAgfVxuICAgIF9oYW5kbGVNb3VzZUV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5fZHJhd25pbmdTdHJva2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5faGFuZGxlTW91c2VEb3duKTtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZU1vdXNlVXApO1xuICAgIH1cbiAgICBfaGFuZGxlVG91Y2hFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9oYW5kbGVUb3VjaFN0YXJ0KTtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlVG91Y2hNb3ZlKTtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVUb3VjaEVuZCk7XG4gICAgfVxuICAgIF9yZXNldCgpIHtcbiAgICAgICAgdGhpcy5fbGFzdFBvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9sYXN0VmVsb2NpdHkgPSAwO1xuICAgICAgICB0aGlzLl9sYXN0V2lkdGggPSAodGhpcy5taW5XaWR0aCArIHRoaXMubWF4V2lkdGgpIC8gMjtcbiAgICAgICAgdGhpcy5fY3R4LmZpbGxTdHlsZSA9IHRoaXMucGVuQ29sb3I7XG4gICAgfVxuICAgIF9jcmVhdGVQb2ludCh4LCB5LCBwcmVzc3VyZSkge1xuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoeCAtIHJlY3QubGVmdCwgeSAtIHJlY3QudG9wLCBwcmVzc3VyZSwgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgIH1cbiAgICBfYWRkUG9pbnQocG9pbnQpIHtcbiAgICAgICAgY29uc3QgeyBfbGFzdFBvaW50cyB9ID0gdGhpcztcbiAgICAgICAgX2xhc3RQb2ludHMucHVzaChwb2ludCk7XG4gICAgICAgIGlmIChfbGFzdFBvaW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICBpZiAoX2xhc3RQb2ludHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgX2xhc3RQb2ludHMudW5zaGlmdChfbGFzdFBvaW50c1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB3aWR0aHMgPSB0aGlzLl9jYWxjdWxhdGVDdXJ2ZVdpZHRocyhfbGFzdFBvaW50c1sxXSwgX2xhc3RQb2ludHNbMl0pO1xuICAgICAgICAgICAgY29uc3QgY3VydmUgPSBCZXppZXIuZnJvbVBvaW50cyhfbGFzdFBvaW50cywgd2lkdGhzKTtcbiAgICAgICAgICAgIF9sYXN0UG9pbnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICByZXR1cm4gY3VydmU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIF9jYWxjdWxhdGVDdXJ2ZVdpZHRocyhzdGFydFBvaW50LCBlbmRQb2ludCkge1xuICAgICAgICBjb25zdCB2ZWxvY2l0eSA9IHRoaXMudmVsb2NpdHlGaWx0ZXJXZWlnaHQgKiBlbmRQb2ludC52ZWxvY2l0eUZyb20oc3RhcnRQb2ludCkgK1xuICAgICAgICAgICAgKDEgLSB0aGlzLnZlbG9jaXR5RmlsdGVyV2VpZ2h0KSAqIHRoaXMuX2xhc3RWZWxvY2l0eTtcbiAgICAgICAgY29uc3QgbmV3V2lkdGggPSB0aGlzLl9zdHJva2VXaWR0aCh2ZWxvY2l0eSk7XG4gICAgICAgIGNvbnN0IHdpZHRocyA9IHtcbiAgICAgICAgICAgIGVuZDogbmV3V2lkdGgsXG4gICAgICAgICAgICBzdGFydDogdGhpcy5fbGFzdFdpZHRoLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9sYXN0VmVsb2NpdHkgPSB2ZWxvY2l0eTtcbiAgICAgICAgdGhpcy5fbGFzdFdpZHRoID0gbmV3V2lkdGg7XG4gICAgICAgIHJldHVybiB3aWR0aHM7XG4gICAgfVxuICAgIF9zdHJva2VXaWR0aCh2ZWxvY2l0eSkge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5tYXhXaWR0aCAvICh2ZWxvY2l0eSArIDEpLCB0aGlzLm1pbldpZHRoKTtcbiAgICB9XG4gICAgX2RyYXdDdXJ2ZVNlZ21lbnQoeCwgeSwgd2lkdGgpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fY3R4O1xuICAgICAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgICAgICBjdHguYXJjKHgsIHksIHdpZHRoLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9pc0VtcHR5ID0gZmFsc2U7XG4gICAgfVxuICAgIF9kcmF3Q3VydmUoY3VydmUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fY3R4O1xuICAgICAgICBjb25zdCB3aWR0aERlbHRhID0gY3VydmUuZW5kV2lkdGggLSBjdXJ2ZS5zdGFydFdpZHRoO1xuICAgICAgICBjb25zdCBkcmF3U3RlcHMgPSBNYXRoLmNlaWwoY3VydmUubGVuZ3RoKCkpICogMjtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gb3B0aW9ucy5wZW5Db2xvcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkcmF3U3RlcHM7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgdCA9IGkgLyBkcmF3U3RlcHM7XG4gICAgICAgICAgICBjb25zdCB0dCA9IHQgKiB0O1xuICAgICAgICAgICAgY29uc3QgdHR0ID0gdHQgKiB0O1xuICAgICAgICAgICAgY29uc3QgdSA9IDEgLSB0O1xuICAgICAgICAgICAgY29uc3QgdXUgPSB1ICogdTtcbiAgICAgICAgICAgIGNvbnN0IHV1dSA9IHV1ICogdTtcbiAgICAgICAgICAgIGxldCB4ID0gdXV1ICogY3VydmUuc3RhcnRQb2ludC54O1xuICAgICAgICAgICAgeCArPSAzICogdXUgKiB0ICogY3VydmUuY29udHJvbDEueDtcbiAgICAgICAgICAgIHggKz0gMyAqIHUgKiB0dCAqIGN1cnZlLmNvbnRyb2wyLng7XG4gICAgICAgICAgICB4ICs9IHR0dCAqIGN1cnZlLmVuZFBvaW50Lng7XG4gICAgICAgICAgICBsZXQgeSA9IHV1dSAqIGN1cnZlLnN0YXJ0UG9pbnQueTtcbiAgICAgICAgICAgIHkgKz0gMyAqIHV1ICogdCAqIGN1cnZlLmNvbnRyb2wxLnk7XG4gICAgICAgICAgICB5ICs9IDMgKiB1ICogdHQgKiBjdXJ2ZS5jb250cm9sMi55O1xuICAgICAgICAgICAgeSArPSB0dHQgKiBjdXJ2ZS5lbmRQb2ludC55O1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLm1pbihjdXJ2ZS5zdGFydFdpZHRoICsgdHR0ICogd2lkdGhEZWx0YSwgb3B0aW9ucy5tYXhXaWR0aCk7XG4gICAgICAgICAgICB0aGlzLl9kcmF3Q3VydmVTZWdtZW50KHgsIHksIHdpZHRoKTtcbiAgICAgICAgfVxuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgfVxuICAgIF9kcmF3RG90KHBvaW50LCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgY29uc3Qgd2lkdGggPSBvcHRpb25zLmRvdFNpemUgPiAwXG4gICAgICAgICAgICA/IG9wdGlvbnMuZG90U2l6ZVxuICAgICAgICAgICAgOiAob3B0aW9ucy5taW5XaWR0aCArIG9wdGlvbnMubWF4V2lkdGgpIC8gMjtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLl9kcmF3Q3VydmVTZWdtZW50KHBvaW50LngsIHBvaW50LnksIHdpZHRoKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gb3B0aW9ucy5wZW5Db2xvcjtcbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICB9XG4gICAgX2Zyb21EYXRhKHBvaW50R3JvdXBzLCBkcmF3Q3VydmUsIGRyYXdEb3QpIHtcbiAgICAgICAgZm9yIChjb25zdCBncm91cCBvZiBwb2ludEdyb3Vwcykge1xuICAgICAgICAgICAgY29uc3QgeyBwZW5Db2xvciwgZG90U2l6ZSwgbWluV2lkdGgsIG1heFdpZHRoLCBwb2ludHMgfSA9IGdyb3VwO1xuICAgICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb2ludHMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzaWNQb2ludCA9IHBvaW50c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQoYmFzaWNQb2ludC54LCBiYXNpY1BvaW50LnksIGJhc2ljUG9pbnQucHJlc3N1cmUsIGJhc2ljUG9pbnQudGltZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVuQ29sb3IgPSBwZW5Db2xvcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGogPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VydmUgPSB0aGlzLl9hZGRQb2ludChwb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJ2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0N1cnZlKGN1cnZlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgICAgICAgICAgICBkcmF3RG90KHBvaW50c1swXSwge1xuICAgICAgICAgICAgICAgICAgICBwZW5Db2xvcixcbiAgICAgICAgICAgICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIG1heFdpZHRoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF90b1NWRygpIHtcbiAgICAgICAgY29uc3QgcG9pbnRHcm91cHMgPSB0aGlzLl9kYXRhO1xuICAgICAgICBjb25zdCByYXRpbyA9IE1hdGgubWF4KHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEsIDEpO1xuICAgICAgICBjb25zdCBtaW5YID0gMDtcbiAgICAgICAgY29uc3QgbWluWSA9IDA7XG4gICAgICAgIGNvbnN0IG1heFggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHJhdGlvO1xuICAgICAgICBjb25zdCBtYXhZID0gdGhpcy5jYW52YXMuaGVpZ2h0IC8gcmF0aW87XG4gICAgICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnc3ZnJyk7XG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy5jYW52YXMud2lkdGgudG9TdHJpbmcoKSk7XG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuY2FudmFzLmhlaWdodC50b1N0cmluZygpKTtcbiAgICAgICAgdGhpcy5fZnJvbURhdGEocG9pbnRHcm91cHMsIChjdXJ2ZSwgeyBwZW5Db2xvciB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncGF0aCcpO1xuICAgICAgICAgICAgaWYgKCFpc05hTihjdXJ2ZS5jb250cm9sMS54KSAmJlxuICAgICAgICAgICAgICAgICFpc05hTihjdXJ2ZS5jb250cm9sMS55KSAmJlxuICAgICAgICAgICAgICAgICFpc05hTihjdXJ2ZS5jb250cm9sMi54KSAmJlxuICAgICAgICAgICAgICAgICFpc05hTihjdXJ2ZS5jb250cm9sMi55KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBgTSAke2N1cnZlLnN0YXJ0UG9pbnQueC50b0ZpeGVkKDMpfSwke2N1cnZlLnN0YXJ0UG9pbnQueS50b0ZpeGVkKDMpfSBgICtcbiAgICAgICAgICAgICAgICAgICAgYEMgJHtjdXJ2ZS5jb250cm9sMS54LnRvRml4ZWQoMyl9LCR7Y3VydmUuY29udHJvbDEueS50b0ZpeGVkKDMpfSBgICtcbiAgICAgICAgICAgICAgICAgICAgYCR7Y3VydmUuY29udHJvbDIueC50b0ZpeGVkKDMpfSwke2N1cnZlLmNvbnRyb2wyLnkudG9GaXhlZCgzKX0gYCArXG4gICAgICAgICAgICAgICAgICAgIGAke2N1cnZlLmVuZFBvaW50LngudG9GaXhlZCgzKX0sJHtjdXJ2ZS5lbmRQb2ludC55LnRvRml4ZWQoMyl9YDtcbiAgICAgICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnZCcsIGF0dHIpO1xuICAgICAgICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLCAoY3VydmUuZW5kV2lkdGggKiAyLjI1KS50b0ZpeGVkKDMpKTtcbiAgICAgICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgcGVuQ29sb3IpO1xuICAgICAgICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKCdmaWxsJywgJ25vbmUnKTtcbiAgICAgICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKTtcbiAgICAgICAgICAgICAgICBzdmcuYXBwZW5kQ2hpbGQocGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIChwb2ludCwgeyBwZW5Db2xvciwgZG90U2l6ZSwgbWluV2lkdGgsIG1heFdpZHRoIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NpcmNsZScpO1xuICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IGRvdFNpemUgPiAwID8gZG90U2l6ZSA6IChtaW5XaWR0aCArIG1heFdpZHRoKSAvIDI7XG4gICAgICAgICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdyJywgc2l6ZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ2N4JywgcG9pbnQueC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ2N5JywgcG9pbnQueS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCBwZW5Db2xvcik7XG4gICAgICAgICAgICBzdmcuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9ICdkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LCc7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9ICc8c3ZnJyArXG4gICAgICAgICAgICAnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIicgK1xuICAgICAgICAgICAgJyB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIicgK1xuICAgICAgICAgICAgYCB2aWV3Qm94PVwiJHttaW5YfSAke21pbll9ICR7dGhpcy5jYW52YXMud2lkdGh9ICR7dGhpcy5jYW52YXMuaGVpZ2h0fVwiYCArXG4gICAgICAgICAgICBgIHdpZHRoPVwiJHttYXhYfVwiYCArXG4gICAgICAgICAgICBgIGhlaWdodD1cIiR7bWF4WX1cImAgK1xuICAgICAgICAgICAgJz4nO1xuICAgICAgICBsZXQgYm9keSA9IHN2Zy5pbm5lckhUTUw7XG4gICAgICAgIGlmIChib2R5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGR1bW15ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZHVtbXknKTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gc3ZnLmNoaWxkTm9kZXM7XG4gICAgICAgICAgICBkdW1teS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkdW1teS5hcHBlbmRDaGlsZChub2Rlc1tpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keSA9IGR1bW15LmlubmVySFRNTDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb290ZXIgPSAnPC9zdmc+JztcbiAgICAgICAgY29uc3QgZGF0YSA9IGhlYWRlciArIGJvZHkgKyBmb290ZXI7XG4gICAgICAgIHJldHVybiBwcmVmaXggKyBidG9hKGRhdGEpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgU2lnbmF0dXJlUGFkIGFzIGRlZmF1bHQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpZ25hdHVyZV9wYWQuanMubWFwXG4iLCIvKiFcblx0Q29weXJpZ2h0IChjKSAyMDE4IEplZCBXYXRzb24uXG5cdExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgc2VlXG5cdGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbiovXG4vKiBnbG9iYWwgZGVmaW5lICovXG5cbihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgaGFzT3duID0ge30uaGFzT3duUHJvcGVydHk7XG5cblx0ZnVuY3Rpb24gY2xhc3NOYW1lcyAoKSB7XG5cdFx0dmFyIGNsYXNzZXMgPSAnJztcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0aWYgKGFyZykge1xuXHRcdFx0XHRjbGFzc2VzID0gYXBwZW5kQ2xhc3MoY2xhc3NlcywgcGFyc2VWYWx1ZShhcmcpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gY2xhc3Nlcztcblx0fVxuXG5cdGZ1bmN0aW9uIHBhcnNlVmFsdWUgKGFyZykge1xuXHRcdGlmICh0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmV0dXJuIGFyZztcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGFyZyAhPT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lcy5hcHBseShudWxsLCBhcmcpO1xuXHRcdH1cblxuXHRcdGlmIChhcmcudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgJiYgIWFyZy50b1N0cmluZy50b1N0cmluZygpLmluY2x1ZGVzKCdbbmF0aXZlIGNvZGVdJykpIHtcblx0XHRcdHJldHVybiBhcmcudG9TdHJpbmcoKTtcblx0XHR9XG5cblx0XHR2YXIgY2xhc3NlcyA9ICcnO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGFyZykge1xuXHRcdFx0aWYgKGhhc093bi5jYWxsKGFyZywga2V5KSAmJiBhcmdba2V5XSkge1xuXHRcdFx0XHRjbGFzc2VzID0gYXBwZW5kQ2xhc3MoY2xhc3Nlcywga2V5KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gY2xhc3Nlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGFwcGVuZENsYXNzICh2YWx1ZSwgbmV3Q2xhc3MpIHtcblx0XHRpZiAoIW5ld0NsYXNzKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHRcblx0XHRpZiAodmFsdWUpIHtcblx0XHRcdHJldHVybiB2YWx1ZSArICcgJyArIG5ld0NsYXNzO1xuXHRcdH1cblx0XG5cdFx0cmV0dXJuIHZhbHVlICsgbmV3Q2xhc3M7XG5cdH1cblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRjbGFzc05hbWVzLmRlZmF1bHQgPSBjbGFzc05hbWVzO1xuXHRcdG1vZHVsZS5leHBvcnRzID0gY2xhc3NOYW1lcztcblx0fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gcmVnaXN0ZXIgYXMgJ2NsYXNzbmFtZXMnLCBjb25zaXN0ZW50IHdpdGggbnBtIHBhY2thZ2UgbmFtZVxuXHRcdGRlZmluZSgnY2xhc3NuYW1lcycsIFtdLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lcztcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuY2xhc3NOYW1lcyA9IGNsYXNzTmFtZXM7XG5cdH1cbn0oKSk7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJlZUdsb2JhbDtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vdztcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIGEgc2luZ2xlIHdoaXRlc3BhY2UgY2hhcmFjdGVyLiAqL1xudmFyIHJlV2hpdGVzcGFjZSA9IC9cXHMvO1xuXG4vKipcbiAqIFVzZWQgYnkgYF8udHJpbWAgYW5kIGBfLnRyaW1FbmRgIHRvIGdldCB0aGUgaW5kZXggb2YgdGhlIGxhc3Qgbm9uLXdoaXRlc3BhY2VcbiAqIGNoYXJhY3RlciBvZiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbGFzdCBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIHRyaW1tZWRFbmRJbmRleChzdHJpbmcpIHtcbiAgdmFyIGluZGV4ID0gc3RyaW5nLmxlbmd0aDtcblxuICB3aGlsZSAoaW5kZXgtLSAmJiByZVdoaXRlc3BhY2UudGVzdChzdHJpbmcuY2hhckF0KGluZGV4KSkpIHt9XG4gIHJldHVybiBpbmRleDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0cmltbWVkRW5kSW5kZXg7XG4iLCJ2YXIgdHJpbW1lZEVuZEluZGV4ID0gcmVxdWlyZSgnLi9fdHJpbW1lZEVuZEluZGV4Jyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW1TdGFydCA9IC9eXFxzKy87XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udHJpbWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byB0cmltLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdHJpbW1lZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUcmltKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nXG4gICAgPyBzdHJpbmcuc2xpY2UoMCwgdHJpbW1lZEVuZEluZGV4KHN0cmluZykgKyAxKS5yZXBsYWNlKHJlVHJpbVN0YXJ0LCAnJylcbiAgICA6IHN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVHJpbTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYXdUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1N0cmluZztcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTeW1ib2w7XG4iLCJ2YXIgYmFzZVRyaW0gPSByZXF1aXJlKCcuL19iYXNlVHJpbScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGlzU3ltYm9sID0gcmVxdWlyZSgnLi9pc1N5bWJvbCcpO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gYmFzZVRyaW0odmFsdWUpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b051bWJlcjtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBub3cgPSByZXF1aXJlKCcuL25vdycpLFxuICAgIHRvTnVtYmVyID0gcmVxdWlyZSgnLi90b051bWJlcicpO1xuXG4vKiogRXJyb3IgbWVzc2FnZSBjb25zdGFudHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyBpbnZva2luZyBgZnVuY2AgdW50aWwgYWZ0ZXIgYHdhaXRgXG4gKiBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3YXNcbiAqIGludm9rZWQuIFRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgIG1ldGhvZCB0byBjYW5jZWxcbiAqIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLlxuICogUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlXG4gKiBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkXG4gKiB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50XG4gKiBjYWxscyB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYFxuICogaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUsXG4gICAgICBsYXN0SW52b2tlVGltZSA9IDAsXG4gICAgICBsZWFkaW5nID0gZmFsc2UsXG4gICAgICBtYXhpbmcgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gdG9OdW1iZXIod2FpdCkgfHwgMDtcbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICEhb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heGluZyA9ICdtYXhXYWl0JyBpbiBvcHRpb25zO1xuICAgIG1heFdhaXQgPSBtYXhpbmcgPyBuYXRpdmVNYXgodG9OdW1iZXIob3B0aW9ucy5tYXhXYWl0KSB8fCAwLCB3YWl0KSA6IG1heFdhaXQ7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUZ1bmModGltZSkge1xuICAgIHZhciBhcmdzID0gbGFzdEFyZ3MsXG4gICAgICAgIHRoaXNBcmcgPSBsYXN0VGhpcztcblxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlYWRpbmdFZGdlKHRpbWUpIHtcbiAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgcmV0dXJuIGxlYWRpbmcgPyBpbnZva2VGdW5jKHRpbWUpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtYWluaW5nV2FpdCh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZSxcbiAgICAgICAgdGltZVdhaXRpbmcgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nXG4gICAgICA/IG5hdGl2ZU1pbih0aW1lV2FpdGluZywgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpXG4gICAgICA6IHRpbWVXYWl0aW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJvdW5jZTtcbiIsInZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vZGVib3VuY2UnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIEVycm9yIG1lc3NhZ2UgY29uc3RhbnRzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiIsImltcG9ydCBSZWFjdCx7aXNWYWxpZEVsZW1lbnQsY3JlYXRlUmVmLGNsb25lRWxlbWVudCxQdXJlQ29tcG9uZW50LENvbXBvbmVudCxmb3J3YXJkUmVmLHVzZVJlZix1c2VTdGF0ZSx1c2VDYWxsYmFjayx1c2VFZmZlY3R9ZnJvbSdyZWFjdCc7aW1wb3J0IHtmaW5kRE9NTm9kZX1mcm9tJ3JlYWN0LWRvbSc7aW1wb3J0IGRlYm91bmNlIGZyb20nbG9kYXNoL2RlYm91bmNlJztpbXBvcnQgdGhyb3R0bGUgZnJvbSdsb2Rhc2gvdGhyb3R0bGUnOy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSwgU3VwcHJlc3NlZEVycm9yLCBTeW1ib2wgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbnZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbnR5cGVvZiBTdXBwcmVzc2VkRXJyb3IgPT09IFwiZnVuY3Rpb25cIiA/IFN1cHByZXNzZWRFcnJvciA6IGZ1bmN0aW9uIChlcnJvciwgc3VwcHJlc3NlZCwgbWVzc2FnZSkge1xyXG4gICAgdmFyIGUgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICByZXR1cm4gZS5uYW1lID0gXCJTdXBwcmVzc2VkRXJyb3JcIiwgZS5lcnJvciA9IGVycm9yLCBlLnN1cHByZXNzZWQgPSBzdXBwcmVzc2VkLCBlO1xyXG59O3ZhciBwYXRjaFJlc2l6ZUNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc2l6ZUNhbGxiYWNrLCByZWZyZXNoTW9kZSwgcmVmcmVzaFJhdGUsIHJlZnJlc2hPcHRpb25zKSB7XG4gICAgc3dpdGNoIChyZWZyZXNoTW9kZSkge1xuICAgICAgICBjYXNlICdkZWJvdW5jZSc6XG4gICAgICAgICAgICByZXR1cm4gZGVib3VuY2UocmVzaXplQ2FsbGJhY2ssIHJlZnJlc2hSYXRlLCByZWZyZXNoT3B0aW9ucyk7XG4gICAgICAgIGNhc2UgJ3Rocm90dGxlJzpcbiAgICAgICAgICAgIHJldHVybiB0aHJvdHRsZShyZXNpemVDYWxsYmFjaywgcmVmcmVzaFJhdGUsIHJlZnJlc2hPcHRpb25zKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiByZXNpemVDYWxsYmFjaztcbiAgICB9XG59O1xudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAoZm4pIHsgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJzsgfTtcbnZhciBpc1NTUiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnOyB9O1xudmFyIGlzRE9NRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQgaW5zdGFuY2VvZiBFbGVtZW50IHx8IGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRG9jdW1lbnQ7XG59O3ZhciBSZXNpemVEZXRlY3RvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoUmVzaXplRGV0ZWN0b3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gUmVzaXplRGV0ZWN0b3IocHJvcHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgcHJvcHMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmNhbmNlbEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMucmVzaXplSGFuZGxlciAmJiBfdGhpcy5yZXNpemVIYW5kbGVyLmNhbmNlbCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbmNlbCBkZWJvdW5jZWQgaGFuZGxlclxuICAgICAgICAgICAgICAgIF90aGlzLnJlc2l6ZUhhbmRsZXIuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgX3RoaXMucmVzaXplSGFuZGxlciA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIF90aGlzLmF0dGFjaE9ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hID0gX3RoaXMucHJvcHMsIHRhcmdldFJlZiA9IF9hLnRhcmdldFJlZiwgb2JzZXJ2ZXJPcHRpb25zID0gX2Eub2JzZXJ2ZXJPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGlzU1NSKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0UmVmICYmIHRhcmdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudGFyZ2V0UmVmLmN1cnJlbnQgPSB0YXJnZXRSZWYuY3VycmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gX3RoaXMuZ2V0RWxlbWVudCgpO1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gY2FuJ3QgZmluZCBlbGVtZW50IHRvIG9ic2VydmVcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX3RoaXMub2JzZXJ2YWJsZUVsZW1lbnQgJiYgX3RoaXMub2JzZXJ2YWJsZUVsZW1lbnQgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBlbGVtZW50IGlzIGFscmVhZHkgb2JzZXJ2ZWRcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5vYnNlcnZhYmxlRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgICAgICBfdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKGVsZW1lbnQsIG9ic2VydmVyT3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICAgIF90aGlzLmdldEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSBfdGhpcy5wcm9wcywgcXVlcnlTZWxlY3RvciA9IF9hLnF1ZXJ5U2VsZWN0b3IsIHRhcmdldERvbUVsID0gX2EudGFyZ2V0RG9tRWw7XG4gICAgICAgICAgICBpZiAoaXNTU1IoKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIC8vIGluIGNhc2Ugd2UgcGFzcyBhIHF1ZXJ5U2VsZWN0b3JcbiAgICAgICAgICAgIGlmIChxdWVyeVNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHF1ZXJ5U2VsZWN0b3IpO1xuICAgICAgICAgICAgLy8gaW4gY2FzZSB3ZSBwYXNzIGEgRE9NIGVsZW1lbnRcbiAgICAgICAgICAgIGlmICh0YXJnZXREb21FbCAmJiBpc0RPTUVsZW1lbnQodGFyZ2V0RG9tRWwpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXREb21FbDtcbiAgICAgICAgICAgIC8vIGluIGNhc2Ugd2UgcGFzcyBhIFJlYWN0IHJlZiB1c2luZyBSZWFjdC5jcmVhdGVSZWYoKVxuICAgICAgICAgICAgaWYgKF90aGlzLnRhcmdldFJlZiAmJiBpc0RPTUVsZW1lbnQoX3RoaXMudGFyZ2V0UmVmLmN1cnJlbnQpKVxuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50YXJnZXRSZWYuY3VycmVudDtcbiAgICAgICAgICAgIC8vIHRoZSB3b3JzZSBjYXNlIHdoZW4gd2UgZG9uJ3QgcmVjZWl2ZSBhbnkgaW5mb3JtYXRpb24gZnJvbSB0aGUgcGFyZW50IGFuZCB0aGUgbGlicmFyeSBkb2Vzbid0IGFkZCBhbnkgd3JhcHBlcnNcbiAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdXNlIGEgZGVwcmVjYXRlZCBgZmluZERPTU5vZGVgIG1ldGhvZCBpbiBvcmRlciB0byBmaW5kIGEgRE9NIGVsZW1lbnQgdG8gYXR0YWNoIHRvXG4gICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnQgPSBmaW5kRE9NTm9kZShfdGhpcyk7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRFbGVtZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdmFyIHJlbmRlclR5cGUgPSBfdGhpcy5nZXRSZW5kZXJUeXBlKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKHJlbmRlclR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdyZW5kZXJQcm9wJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NoaWxkRnVuY3Rpb24nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2hpbGQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2hpbGRBcnJheSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuY3JlYXRlUmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uIChlbnRyaWVzKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSBfdGhpcy5wcm9wcywgX2IgPSBfYS5oYW5kbGVXaWR0aCwgaGFuZGxlV2lkdGggPSBfYiA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9iLCBfYyA9IF9hLmhhbmRsZUhlaWdodCwgaGFuZGxlSGVpZ2h0ID0gX2MgPT09IHZvaWQgMCA/IHRydWUgOiBfYywgb25SZXNpemUgPSBfYS5vblJlc2l6ZTtcbiAgICAgICAgICAgIGlmICghaGFuZGxlV2lkdGggJiYgIWhhbmRsZUhlaWdodClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB2YXIgbm90aWZ5UmVzaXplID0gZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gX2Eud2lkdGgsIGhlaWdodCA9IF9hLmhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuc3RhdGUud2lkdGggPT09IHdpZHRoICYmIF90aGlzLnN0YXRlLmhlaWdodCA9PT0gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNraXAgaWYgZGltZW5zaW9ucyBoYXZlbid0IGNoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKF90aGlzLnN0YXRlLndpZHRoID09PSB3aWR0aCAmJiAhaGFuZGxlSGVpZ2h0KSB8fCAoX3RoaXMuc3RhdGUuaGVpZ2h0ID09PSBoZWlnaHQgJiYgIWhhbmRsZVdpZHRoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBwcm9jZXNzIGBoYW5kbGVIZWlnaHQvaGFuZGxlV2lkdGhgIHByb3BzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb25SZXNpemUgPT09IG51bGwgfHwgb25SZXNpemUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9uUmVzaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gKGVudHJ5ICYmIGVudHJ5LmNvbnRlbnRSZWN0KSB8fCB7fSwgd2lkdGggPSBfYS53aWR0aCwgaGVpZ2h0ID0gX2EuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciBzaG91bGRTZXRTaXplID0gIV90aGlzLnNraXBPbk1vdW50ICYmICFpc1NTUigpO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRTZXRTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmeVJlc2l6ZSh7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF90aGlzLnNraXBPbk1vdW50ID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuZ2V0UmVuZGVyVHlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IF90aGlzLnByb3BzLCByZW5kZXIgPSBfYS5yZW5kZXIsIGNoaWxkcmVuID0gX2EuY2hpbGRyZW47XG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihyZW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgLy8gREVQUkVDQVRFRC4gVXNlIGBDaGlsZCBGdW5jdGlvbiBQYXR0ZXJuYCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgcmV0dXJuICdyZW5kZXJQcm9wJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnY2hpbGRGdW5jdGlvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNWYWxpZEVsZW1lbnQoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdjaGlsZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgICAgICAgICAvLyBERVBSRUNBVEVELiBXcmFwIGNoaWxkcmVuIHdpdGggYSBzaW5nbGUgcGFyZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuICdjaGlsZEFycmF5JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERFUFJFQ0FURUQuIFVzZSBgQ2hpbGQgRnVuY3Rpb24gUGF0dGVybmAgaW5zdGVhZFxuICAgICAgICAgICAgcmV0dXJuICdwYXJlbnQnO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgc2tpcE9uTW91bnQgPSBwcm9wcy5za2lwT25Nb3VudCwgcmVmcmVzaE1vZGUgPSBwcm9wcy5yZWZyZXNoTW9kZSwgX2EgPSBwcm9wcy5yZWZyZXNoUmF0ZSwgcmVmcmVzaFJhdGUgPSBfYSA9PT0gdm9pZCAwID8gMTAwMCA6IF9hLCByZWZyZXNoT3B0aW9ucyA9IHByb3BzLnJlZnJlc2hPcHRpb25zO1xuICAgICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBoZWlnaHQ6IHVuZGVmaW5lZFxuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5zaXplUmVmID0ge1xuICAgICAgICAgICAgY3VycmVudDogX3RoaXMuc3RhdGVcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuc2tpcE9uTW91bnQgPSBza2lwT25Nb3VudDtcbiAgICAgICAgX3RoaXMudGFyZ2V0UmVmID0gY3JlYXRlUmVmKCk7XG4gICAgICAgIF90aGlzLm9ic2VydmFibGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGlzU1NSKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy5yZXNpemVIYW5kbGVyID0gcGF0Y2hSZXNpemVDYWxsYmFjayhfdGhpcy5jcmVhdGVSZXNpemVIYW5kbGVyLCByZWZyZXNoTW9kZSwgcmVmcmVzaFJhdGUsIHJlZnJlc2hPcHRpb25zKTtcbiAgICAgICAgX3RoaXMucmVzaXplT2JzZXJ2ZXIgPSBuZXcgd2luZG93LlJlc2l6ZU9ic2VydmVyKF90aGlzLnJlc2l6ZUhhbmRsZXIpO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFJlc2l6ZURldGVjdG9yLnByb3RvdHlwZS5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hdHRhY2hPYnNlcnZlcigpO1xuICAgIH07XG4gICAgUmVzaXplRGV0ZWN0b3IucHJvdG90eXBlLmNvbXBvbmVudERpZFVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hdHRhY2hPYnNlcnZlcigpO1xuICAgICAgICB0aGlzLnNpemVSZWYuY3VycmVudCA9IHRoaXMuc3RhdGU7XG4gICAgfTtcbiAgICBSZXNpemVEZXRlY3Rvci5wcm90b3R5cGUuY29tcG9uZW50V2lsbFVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChpc1NTUigpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlRWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmNhbmNlbEhhbmRsZXIoKTtcbiAgICB9O1xuICAgIFJlc2l6ZURldGVjdG9yLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMucHJvcHMsIHJlbmRlciA9IF9hLnJlbmRlciwgY2hpbGRyZW4gPSBfYS5jaGlsZHJlbiwgX2IgPSBfYS5ub2RlVHlwZSwgV3JhcHBlclRhZyA9IF9iID09PSB2b2lkIDAgPyAnZGl2JyA6IF9iO1xuICAgICAgICB2YXIgX2MgPSB0aGlzLnN0YXRlLCB3aWR0aCA9IF9jLndpZHRoLCBoZWlnaHQgPSBfYy5oZWlnaHQ7XG4gICAgICAgIHZhciBjaGlsZFByb3BzID0geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0LCB0YXJnZXRSZWY6IHRoaXMudGFyZ2V0UmVmIH07XG4gICAgICAgIHZhciByZW5kZXJUeXBlID0gdGhpcy5nZXRSZW5kZXJUeXBlKCk7XG4gICAgICAgIHN3aXRjaCAocmVuZGVyVHlwZSkge1xuICAgICAgICAgICAgY2FzZSAncmVuZGVyUHJvcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbmRlciA9PT0gbnVsbCB8fCByZW5kZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlbmRlcihjaGlsZFByb3BzKTtcbiAgICAgICAgICAgIGNhc2UgJ2NoaWxkRnVuY3Rpb24nOiB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkRnVuY3Rpb24gPSBjaGlsZHJlbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRGdW5jdGlvbiA9PT0gbnVsbCB8fCBjaGlsZEZ1bmN0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjaGlsZEZ1bmN0aW9uKGNoaWxkUHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnY2hpbGQnOiB7XG4gICAgICAgICAgICAgICAgLy8gQFRPRE8gYnVnIHByb25lIGxvZ2ljXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgJiYgdHlwZW9mIGNoaWxkLnR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoaWxkIGlzIGEgbmF0aXZlIERPTSBlbGVtZW50cyBzdWNoIGFzIGRpdiwgc3BhbiBldGNcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICAgICAgICAgICAgICBjaGlsZFByb3BzLnRhcmdldFJlZjsgdmFyIG5hdGl2ZVByb3BzID0gX19yZXN0KGNoaWxkUHJvcHMsIFtcInRhcmdldFJlZlwiXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZUVsZW1lbnQoY2hpbGQsIG5hdGl2ZVByb3BzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY2xhc3Mgb3IgZnVuY3Rpb25hbCBjb21wb25lbnQgb3RoZXJ3aXNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lRWxlbWVudChjaGlsZCwgY2hpbGRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdjaGlsZEFycmF5Jzoge1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZEFycmF5ID0gY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkQXJyYXkubWFwKGZ1bmN0aW9uIChlbCkgeyByZXR1cm4gISFlbCAmJiBjbG9uZUVsZW1lbnQoZWwsIGNoaWxkUHJvcHMpOyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoV3JhcHBlclRhZywgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBSZXNpemVEZXRlY3Rvcjtcbn0oUHVyZUNvbXBvbmVudCkpO2Z1bmN0aW9uIHdpdGhSZXNpemVEZXRlY3RvcihDb21wb25lbnRJbm5lciwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgdmFyIFJlc2l6ZURldGVjdG9ySE9DID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoUmVzaXplRGV0ZWN0b3JIT0MsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIFJlc2l6ZURldGVjdG9ySE9DKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5yZWYgPSBjcmVhdGVSZWYoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBSZXNpemVEZXRlY3RvckhPQy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hID0gdGhpcy5wcm9wcywgZm9yd2FyZGVkUmVmID0gX2EuZm9yd2FyZGVkUmVmLCByZXN0ID0gX19yZXN0KF9hLCBbXCJmb3J3YXJkZWRSZWZcIl0pO1xuICAgICAgICAgICAgdmFyIHRhcmdldFJlZiA9IGZvcndhcmRlZFJlZiAhPT0gbnVsbCAmJiBmb3J3YXJkZWRSZWYgIT09IHZvaWQgMCA/IGZvcndhcmRlZFJlZiA6IHRoaXMucmVmO1xuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFJlc2l6ZURldGVjdG9yLCBfX2Fzc2lnbih7fSwgb3B0aW9ucywgeyB0YXJnZXRSZWY6IHRhcmdldFJlZiB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENvbXBvbmVudElubmVyLCBfX2Fzc2lnbih7IHRhcmdldFJlZjogdGFyZ2V0UmVmIH0sIHJlc3QpKSkpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gUmVzaXplRGV0ZWN0b3JIT0M7XG4gICAgfShDb21wb25lbnQpKTtcbiAgICBmdW5jdGlvbiBmb3J3YXJkUmVmV3JhcHBlcihwcm9wcywgcmVmKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlc2l6ZURldGVjdG9ySE9DLCBfX2Fzc2lnbih7fSwgcHJvcHMsIHsgZm9yd2FyZGVkUmVmOiByZWYgfSkpO1xuICAgIH1cbiAgICB2YXIgbmFtZSA9IENvbXBvbmVudElubmVyLmRpc3BsYXlOYW1lIHx8IENvbXBvbmVudElubmVyLm5hbWU7XG4gICAgZm9yd2FyZFJlZldyYXBwZXIuZGlzcGxheU5hbWUgPSBcIndpdGhSZXNpemVEZXRlY3RvcihcIi5jb25jYXQobmFtZSwgXCIpXCIpO1xuICAgIHJldHVybiBmb3J3YXJkUmVmKGZvcndhcmRSZWZXcmFwcGVyKTtcbn1mdW5jdGlvbiB1c2VSZXNpemVEZXRlY3RvcihfYSkge1xuICAgIHZhciBfYiA9IF9hID09PSB2b2lkIDAgPyB7fSA6IF9hLCBfYyA9IF9iLnNraXBPbk1vdW50LCBza2lwT25Nb3VudCA9IF9jID09PSB2b2lkIDAgPyBmYWxzZSA6IF9jLCByZWZyZXNoTW9kZSA9IF9iLnJlZnJlc2hNb2RlLCBfZCA9IF9iLnJlZnJlc2hSYXRlLCByZWZyZXNoUmF0ZSA9IF9kID09PSB2b2lkIDAgPyAxMDAwIDogX2QsIHJlZnJlc2hPcHRpb25zID0gX2IucmVmcmVzaE9wdGlvbnMsIF9lID0gX2IuaGFuZGxlV2lkdGgsIGhhbmRsZVdpZHRoID0gX2UgPT09IHZvaWQgMCA/IHRydWUgOiBfZSwgX2YgPSBfYi5oYW5kbGVIZWlnaHQsIGhhbmRsZUhlaWdodCA9IF9mID09PSB2b2lkIDAgPyB0cnVlIDogX2YsIHRhcmdldFJlZiA9IF9iLnRhcmdldFJlZiwgb2JzZXJ2ZXJPcHRpb25zID0gX2Iub2JzZXJ2ZXJPcHRpb25zLCBvblJlc2l6ZSA9IF9iLm9uUmVzaXplO1xuICAgIHZhciBza2lwUmVzaXplID0gdXNlUmVmKHNraXBPbk1vdW50KTtcbiAgICB2YXIgX2cgPSB1c2VTdGF0ZSh7XG4gICAgICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgICAgIGhlaWdodDogdW5kZWZpbmVkXG4gICAgfSksIHNpemUgPSBfZ1swXSwgc2V0U2l6ZSA9IF9nWzFdO1xuICAgIC8vIHdlIGFyZSBnb2luZyB0byB1c2UgdGhpcyByZWYgdG8gc3RvcmUgdGhlIGxhc3QgZWxlbWVudCB0aGF0IHdhcyBwYXNzZWQgdG8gdGhlIGhvb2tcbiAgICB2YXIgX2ggPSB1c2VTdGF0ZSgodGFyZ2V0UmVmID09PSBudWxsIHx8IHRhcmdldFJlZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogdGFyZ2V0UmVmLmN1cnJlbnQpIHx8IG51bGwpLCByZWZFbGVtZW50ID0gX2hbMF0sIHNldFJlZkVsZW1lbnQgPSBfaFsxXTtcbiAgICAvLyBpZiB0YXJnZXRSZWYgaXMgcGFzc2VkLCB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgcmVmRWxlbWVudFxuICAgIC8vIHdlIGhhdmUgdG8gdXNlIHNldFRpbWVvdXQgYmVjYXVzZSByZWYgZ2V0IGFzc2lnbmVkIGFmdGVyIHRoZSBob29rIGlzIGNhbGxlZFxuICAgIC8vIGluIHRoZSBmdXR1cmUgcmVsZWFzZXMgd2UgYXJlIGdvaW5nIHRvIHJlbW92ZSB0YXJnZXRSZWYgYW5kIGZvcmNlIHVzZXJzIHRvIHVzZSByZWYgcmV0dXJuZWQgYnkgdGhlIGhvb2tcbiAgICBpZiAodGFyZ2V0UmVmKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRhcmdldFJlZi5jdXJyZW50ICE9PSByZWZFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0UmVmRWxlbWVudCh0YXJnZXRSZWYuY3VycmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgIH1cbiAgICAvLyB0aGlzIGlzIGEgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCBldmVyeSB0aW1lIHRoZSByZWYgaXMgY2hhbmdlZFxuICAgIC8vIHdlIGNhbGwgc2V0U3RhdGUgaW5zaWRlIHRvIHRyaWdnZXIgcmVyZW5kZXJcbiAgICB2YXIgb25SZWZDaGFuZ2UgPSB1c2VDYWxsYmFjayhmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBpZiAobm9kZSAhPT0gcmVmRWxlbWVudCkge1xuICAgICAgICAgICAgc2V0UmVmRWxlbWVudChub2RlKTtcbiAgICAgICAgfVxuICAgIH0sIFtyZWZFbGVtZW50XSk7XG4gICAgLy8gYWRkaW5nIGBjdXJyZW50YCB0byBtYWtlIGl0IGNvbXBhdGlibGUgd2l0aCB1c2VSZWYgc2hhcGVcbiAgICBvblJlZkNoYW5nZS5jdXJyZW50ID0gcmVmRWxlbWVudDtcbiAgICB2YXIgc2hvdWxkU2V0U2l6ZSA9IHVzZUNhbGxiYWNrKGZ1bmN0aW9uIChwcmV2U2l6ZSwgbmV4dFNpemUpIHtcbiAgICAgICAgaWYgKHByZXZTaXplLndpZHRoID09PSBuZXh0U2l6ZS53aWR0aCAmJiBwcmV2U2l6ZS5oZWlnaHQgPT09IG5leHRTaXplLmhlaWdodCkge1xuICAgICAgICAgICAgLy8gc2tpcCBpZiBkaW1lbnNpb25zIGhhdmVuJ3QgY2hhbmdlZFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocHJldlNpemUud2lkdGggPT09IG5leHRTaXplLndpZHRoICYmICFoYW5kbGVIZWlnaHQpIHx8XG4gICAgICAgICAgICAocHJldlNpemUuaGVpZ2h0ID09PSBuZXh0U2l6ZS5oZWlnaHQgJiYgIWhhbmRsZVdpZHRoKSkge1xuICAgICAgICAgICAgLy8gcHJvY2VzcyBgaGFuZGxlSGVpZ2h0L2hhbmRsZVdpZHRoYCBwcm9wc1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sIFtoYW5kbGVXaWR0aCwgaGFuZGxlSGVpZ2h0XSk7XG4gICAgdmFyIHJlc2l6ZUNhbGxiYWNrID0gdXNlQ2FsbGJhY2soZnVuY3Rpb24gKGVudHJpZXMpIHtcbiAgICAgICAgaWYgKCFoYW5kbGVXaWR0aCAmJiAhaGFuZGxlSGVpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAoc2tpcFJlc2l6ZS5jdXJyZW50KSB7XG4gICAgICAgICAgICBza2lwUmVzaXplLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbnRyaWVzLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICB2YXIgX2EgPSAoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LmNvbnRlbnRSZWN0KSB8fCB7fSwgd2lkdGggPSBfYS53aWR0aCwgaGVpZ2h0ID0gX2EuaGVpZ2h0O1xuICAgICAgICAgICAgc2V0U2l6ZShmdW5jdGlvbiAocHJldlNpemUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNob3VsZFNldFNpemUocHJldlNpemUsIHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9KSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZTaXplO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LCBbaGFuZGxlV2lkdGgsIGhhbmRsZUhlaWdodCwgc2tpcFJlc2l6ZSwgc2hvdWxkU2V0U2l6ZV0pO1xuICAgIHZhciByZXNpemVIYW5kbGVyID0gdXNlQ2FsbGJhY2socGF0Y2hSZXNpemVDYWxsYmFjayhyZXNpemVDYWxsYmFjaywgcmVmcmVzaE1vZGUsIHJlZnJlc2hSYXRlLCByZWZyZXNoT3B0aW9ucyksIFtcbiAgICAgICAgcmVzaXplQ2FsbGJhY2ssXG4gICAgICAgIHJlZnJlc2hNb2RlLFxuICAgICAgICByZWZyZXNoUmF0ZSxcbiAgICAgICAgcmVmcmVzaE9wdGlvbnNcbiAgICBdKTtcbiAgICAvLyBvbiByZWZFbGVtZW50IGNoYW5nZVxuICAgIHVzZUVmZmVjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXNpemVPYnNlcnZlcjtcbiAgICAgICAgaWYgKHJlZkVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJlc2l6ZU9ic2VydmVyID0gbmV3IHdpbmRvdy5SZXNpemVPYnNlcnZlcihyZXNpemVIYW5kbGVyKTtcbiAgICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUocmVmRWxlbWVudCwgb2JzZXJ2ZXJPcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzaXplLndpZHRoIHx8IHNpemUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgc2V0U2l6ZSh7IHdpZHRoOiB1bmRlZmluZWQsIGhlaWdodDogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2EsIF9iLCBfYztcbiAgICAgICAgICAgIChfYSA9IHJlc2l6ZU9ic2VydmVyID09PSBudWxsIHx8IHJlc2l6ZU9ic2VydmVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2FsbChyZXNpemVPYnNlcnZlcik7XG4gICAgICAgICAgICAoX2MgPSAoX2IgPSByZXNpemVIYW5kbGVyKS5jYW5jZWwpID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy5jYWxsKF9iKTtcbiAgICAgICAgfTtcbiAgICB9LCBbcmVzaXplSGFuZGxlciwgcmVmRWxlbWVudF0pO1xuICAgIHVzZUVmZmVjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgIG9uUmVzaXplID09PSBudWxsIHx8IG9uUmVzaXplID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvblJlc2l6ZShzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgfSwgW3NpemVdKTtcbiAgICByZXR1cm4gX19hc3NpZ24oeyByZWY6IG9uUmVmQ2hhbmdlIH0sIHNpemUpO1xufWV4cG9ydHtSZXNpemVEZXRlY3RvciBhcyBkZWZhdWx0LHVzZVJlc2l6ZURldGVjdG9yLHdpdGhSZXNpemVEZXRlY3Rvcn07Ly8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguZXNtLmpzLm1hcFxuIiwiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCwgRkMsIFByb3BzV2l0aENoaWxkcmVuIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFsZXJ0UHJvcHMgZXh0ZW5kcyBQcm9wc1dpdGhDaGlsZHJlbiB7XG4gICAgYm9vdHN0cmFwU3R5bGU/OiBcImRlZmF1bHRcIiB8IFwicHJpbWFyeVwiIHwgXCJzdWNjZXNzXCIgfCBcImluZm9cIiB8IFwid2FybmluZ1wiIHwgXCJkYW5nZXJcIjtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBBbGVydDogRkM8QWxlcnRQcm9wcz4gPSAoeyBib290c3RyYXBTdHlsZSA9IFwiZGFuZ2VyXCIsIGNsYXNzTmFtZSwgY2hpbGRyZW4gfSkgPT5cbiAgICBjaGlsZHJlbiA/IDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGBhbGVydCBhbGVydC0ke2Jvb3RzdHJhcFN0eWxlfWAsIGNsYXNzTmFtZSl9PntjaGlsZHJlbn08L2Rpdj4gOiBudWxsO1xuXG5BbGVydC5kaXNwbGF5TmFtZSA9IFwiQWxlcnRcIjtcbiIsImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIEZDIH0gZnJvbSBcInJlYWN0XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR3JpZEJhY2tncm91bmRQcm9wcyB7XG4gICAgZ3JpZENlbGxXaWR0aDogbnVtYmVyO1xuICAgIGdyaWRDZWxsSGVpZ2h0OiBudW1iZXI7XG4gICAgZ3JpZEJvcmRlckNvbG9yOiBzdHJpbmc7XG4gICAgZ3JpZEJvcmRlcldpZHRoOiBudW1iZXI7XG4gICAgc2hvd0dyaWQ/OiBib29sZWFuO1xufVxuZXhwb3J0IGNvbnN0IEdyaWQ6IEZDPEdyaWRCYWNrZ3JvdW5kUHJvcHM+ID0gKHtcbiAgICBncmlkQ2VsbFdpZHRoLFxuICAgIGdyaWRDZWxsSGVpZ2h0LFxuICAgIGdyaWRCb3JkZXJDb2xvcixcbiAgICBncmlkQm9yZGVyV2lkdGgsXG4gICAgc2hvd0dyaWQgPSB0cnVlXG59KSA9PiB7XG4gICAgY29uc3QgaWQgPSBgZ3JpZCR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMCl9YDtcbiAgICByZXR1cm4gc2hvd0dyaWQgPyAoXG4gICAgICAgIDxzdmcgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS1ncmlkXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICAgICAgICAgIDxkZWZzPlxuICAgICAgICAgICAgICAgIDxwYXR0ZXJuIGlkPXtpZH0gd2lkdGg9e2dyaWRDZWxsV2lkdGh9IGhlaWdodD17Z3JpZENlbGxIZWlnaHR9IHBhdHRlcm5Vbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICB4MT1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgeTE9e2dyaWRDZWxsSGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICAgICAgeDI9e2dyaWRDZWxsV2lkdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICB5Mj17Z3JpZENlbGxIZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U9e2dyaWRCb3JkZXJDb2xvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXtncmlkQm9yZGVyV2lkdGh9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICB4MT17Z3JpZENlbGxXaWR0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHkxPVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB4Mj17Z3JpZENlbGxXaWR0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHkyPXtncmlkQ2VsbEhlaWdodH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZT17Z3JpZEJvcmRlckNvbG9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9e2dyaWRCb3JkZXJXaWR0aH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3BhdHRlcm4+XG4gICAgICAgICAgICA8L2RlZnM+XG4gICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgZmlsbD17YHVybCgjJHtpZH0pYH0gLz5cbiAgICAgICAgPC9zdmc+XG4gICAgKSA6IG51bGw7XG59O1xuXG5HcmlkLmRpc3BsYXlOYW1lID0gXCJHcmlkXCI7XG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBDU1NQcm9wZXJ0aWVzLCBGQywgUHJvcHNXaXRoQ2hpbGRyZW4gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmV4cG9ydCB0eXBlIEhlaWdodFVuaXRUeXBlID0gXCJwZXJjZW50YWdlT2ZXaWR0aFwiIHwgXCJwZXJjZW50YWdlT2ZQYXJlbnRcIiB8IFwicGl4ZWxzXCI7XG5cbmV4cG9ydCB0eXBlIFdpZHRoVW5pdFR5cGUgPSBcInBlcmNlbnRhZ2VcIiB8IFwicGl4ZWxzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGltZW5zaW9ucyB7XG4gICAgd2lkdGhVbml0OiBXaWR0aFVuaXRUeXBlO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0VW5pdDogSGVpZ2h0VW5pdFR5cGU7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2l6ZVByb3BzIGV4dGVuZHMgRGltZW5zaW9ucywgUHJvcHNXaXRoQ2hpbGRyZW4ge1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIGNsYXNzTmFtZUlubmVyPzogc3RyaW5nO1xuICAgIHJlYWRPbmx5PzogYm9vbGVhbjtcbiAgICBzdHlsZT86IENTU1Byb3BlcnRpZXM7XG59XG5cbmV4cG9ydCBjb25zdCBTaXplQ29udGFpbmVyOiBGQzxTaXplUHJvcHM+ID0gKHtcbiAgICBjbGFzc05hbWUsXG4gICAgY2xhc3NOYW1lSW5uZXIsXG4gICAgd2lkdGhVbml0LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFVuaXQsXG4gICAgaGVpZ2h0LFxuICAgIGNoaWxkcmVuLFxuICAgIHN0eWxlLFxuICAgIHJlYWRPbmx5ID0gZmFsc2Vcbn0pID0+IHtcbiAgICBjb25zdCBzdHlsZVdpZHRoID0gd2lkdGhVbml0ID09PSBcInBlcmNlbnRhZ2VcIiA/IGAke3dpZHRofSVgIDogYCR7d2lkdGh9cHhgO1xuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZXMoY2xhc3NOYW1lLCBcInNpemUtYm94XCIpLFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJyZWxhdGl2ZVwiLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBzdHlsZVdpZHRoLFxuICAgICAgICAgICAgICAgIC4uLmdldEhlaWdodChoZWlnaHRVbml0LCBoZWlnaHQsIHdpZHRoVW5pdCwgd2lkdGgpLFxuICAgICAgICAgICAgICAgIC4uLnN0eWxlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lcyhcInNpemUtYm94LWlubmVyXCIsIGNsYXNzTmFtZUlubmVyKSxcbiAgICAgICAgICAgICAgICByZWFkT25seSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogcmVhZE9ubHksXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBcIjBcIixcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICBib3R0b206IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBcIjBcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICApXG4gICAgKTtcbn07XG5cblNpemVDb250YWluZXIuZGlzcGxheU5hbWUgPSBcIlNpemVDb250YWluZXJcIjtcblxuY29uc3QgZ2V0SGVpZ2h0ID0gKFxuICAgIGhlaWdodFVuaXQ6IEhlaWdodFVuaXRUeXBlLFxuICAgIGhlaWdodDogbnVtYmVyLFxuICAgIHdpZHRoVW5pdDogV2lkdGhVbml0VHlwZSxcbiAgICB3aWR0aDogbnVtYmVyXG4pOiBDU1NQcm9wZXJ0aWVzID0+IHtcbiAgICBjb25zdCBzdHlsZTogQ1NTUHJvcGVydGllcyA9IHt9O1xuICAgIGlmIChoZWlnaHRVbml0ID09PSBcInBlcmNlbnRhZ2VPZldpZHRoXCIpIHtcbiAgICAgICAgY29uc3QgcmF0aW8gPSAoaGVpZ2h0IC8gMTAwKSAqIHdpZHRoO1xuICAgICAgICBpZiAod2lkdGhVbml0ID09PSBcInBlcmNlbnRhZ2VcIikge1xuICAgICAgICAgICAgc3R5bGUuaGVpZ2h0ID0gXCJhdXRvXCI7XG4gICAgICAgICAgICBzdHlsZS5wYWRkaW5nQm90dG9tID0gYCR7cmF0aW99JWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBgJHtyYXRpb31weGA7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGhlaWdodFVuaXQgPT09IFwicGl4ZWxzXCIpIHtcbiAgICAgICAgc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgICB9IGVsc2UgaWYgKGhlaWdodFVuaXQgPT09IFwicGVyY2VudGFnZU9mUGFyZW50XCIpIHtcbiAgICAgICAgc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fSVgO1xuICAgIH1cblxuICAgIHJldHVybiBzdHlsZTtcbn07XG4iLCJpbXBvcnQgeyBDaGFuZ2VFdmVudCwgY3JlYXRlRWxlbWVudCwgUHVyZUNvbXBvbmVudCwgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5cbi8vIEB0cy1leHBlY3QtZXJyb3Igc2lnbmF0dXJlX3BhZCBoYXMgbm8gdHlwZXNcbmltcG9ydCBTaWduYXR1cmVQYWQsIHsgSU9wdGlvbnMgfSBmcm9tIFwic2lnbmF0dXJlX3BhZFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBSZWFjdFJlc2l6ZURldGVjdG9yIGZyb20gXCJyZWFjdC1yZXNpemUtZGV0ZWN0b3JcIjtcblxuaW1wb3J0IHsgQWxlcnQgfSBmcm9tIFwiLi9BbGVydFwiO1xuaW1wb3J0IHsgR3JpZCB9IGZyb20gXCIuL0dyaWRcIjtcbmltcG9ydCB7IERpbWVuc2lvbnMsIFNpemVDb250YWluZXIgfSBmcm9tIFwiLi9TaXplQ29udGFpbmVyXCI7XG5cbmltcG9ydCBcIi4uL3VpL1NpZ25hdHVyZS5zY3NzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmF0dXJlUHJvcHMgZXh0ZW5kcyBEaW1lbnNpb25zIHtcbiAgICBjbGFzc05hbWU6IHN0cmluZztcbiAgICBhbGVydE1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgY2xlYXJTaWduYXR1cmU6IGJvb2xlYW47XG4gICAgc2hvd0dyaWQ6IGJvb2xlYW47XG4gICAgZ3JpZENlbGxXaWR0aDogbnVtYmVyO1xuICAgIGdyaWRDZWxsSGVpZ2h0OiBudW1iZXI7XG4gICAgZ3JpZEJvcmRlckNvbG9yOiBzdHJpbmc7XG4gICAgZ3JpZEJvcmRlcldpZHRoOiBudW1iZXI7XG4gICAgcGVuVHlwZTogcGVuT3B0aW9ucztcbiAgICBwZW5Db2xvcjogc3RyaW5nO1xuICAgIG9uU2lnbkVuZEFjdGlvbj86IChpbWFnZVVybD86IHN0cmluZykgPT4gdm9pZDtcbiAgICB3cmFwcGVyU3R5bGU/OiBvYmplY3Q7XG4gICAgcmVhZE9ubHk6IGJvb2xlYW47XG4gICAgc2lnbmF0dXJlTW9kZTogXCJkcmF3XCIgfCBcInR5cGVcIjtcbiAgICBzaG93TW9kZVRvZ2dsZTogYm9vbGVhbjtcbiAgICBzaG93Q2xlYXJCdXR0b246IGJvb2xlYW47XG4gICAgc2hvd1NhdmVCdXR0b246IGJvb2xlYW47XG4gICAgc2F2ZUJ1dHRvbkNhcHRpb24/OiBzdHJpbmc7XG4gICAgc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0Pzogc3RyaW5nO1xuICAgIG9uU2F2ZT86IChpbWFnZVVybD86IHN0cmluZykgPT4gdm9pZDtcbiAgICBpc1NhdmVFbmFibGVkPzogYm9vbGVhbjtcbiAgICBzaG93SGVhZGVyOiBib29sZWFuO1xuICAgIGhlYWRlclRleHQ/OiBzdHJpbmc7XG4gICAgc2hvd1dhdGVybWFyazogYm9vbGVhbjtcbiAgICB3YXRlcm1hcmtUZXh0Pzogc3RyaW5nO1xuICAgIG9uV2F0ZXJtYXJrQ2hhbmdlPzogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQ7XG4gICAgaXNXYXRlcm1hcmtSZWFkT25seT86IGJvb2xlYW47XG4gICAgdHlwZUZvbnRGYW1pbHk6IHN0cmluZztcbiAgICB0eXBlRm9udFNpemU6IG51bWJlcjtcbiAgICB0eXBlUGxhY2Vob2xkZXI6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgcGVuT3B0aW9ucyA9IFwiZm91bnRhaW5cIiB8IFwiYmFsbHBvaW50XCIgfCBcIm1hcmtlclwiO1xuXG5pbnRlcmZhY2UgU2lnbmF0dXJlU3RhdGUge1xuICAgIG1vZGU6IFwiZHJhd1wiIHwgXCJ0eXBlXCI7XG4gICAgdHlwZWRUZXh0OiBzdHJpbmc7XG4gICAgaGFzU2lnbmF0dXJlOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgU2lnbmF0dXJlIGV4dGVuZHMgUHVyZUNvbXBvbmVudDxTaWduYXR1cmVQcm9wcywgU2lnbmF0dXJlU3RhdGU+IHtcbiAgICBwcml2YXRlIGNhbnZhc05vZGU6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBzaWduYXR1cmVfcGFkIGhhcyBubyB0eXBlc1xuICAgIHByaXZhdGUgc2lnbmF0dXJlUGFkOiBTaWduYXR1cmVQYWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogU2lnbmF0dXJlUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW9kZTogcHJvcHMuc2lnbmF0dXJlTW9kZSxcbiAgICAgICAgICAgIHR5cGVkVGV4dDogXCJcIixcbiAgICAgICAgICAgIGhhc1NpZ25hdHVyZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZW5kZXIoKTogUmVhY3ROb2RlIHtcbiAgICAgICAgY29uc3QgeyBjbGFzc05hbWUsIGFsZXJ0TWVzc2FnZSwgd3JhcHBlclN0eWxlIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8U2l6ZUNvbnRhaW5lclxuICAgICAgICAgICAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIndpZGdldC1zaWduYXR1cmVcIiwgY2xhc3NOYW1lKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWVJbm5lcj1cIndpZGdldC1zaWduYXR1cmUtd3JhcHBlciBmb3JtLWNvbnRyb2wgbXgtdGV4dGFyZWEtaW5wdXQgbXgtdGV4dGFyZWFcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt3cmFwcGVyU3R5bGV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEFsZXJ0IGJvb3RzdHJhcFN0eWxlPVwiZGFuZ2VyXCI+e2FsZXJ0TWVzc2FnZX08L0FsZXJ0PlxuICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckhlYWRlcigpfVxuICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckNvbnRyb2xzKCl9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLWNhbnZhcy1hcmVhXCI+XG4gICAgICAgICAgICAgICAgICAgIDxHcmlkIHsuLi50aGlzLnByb3BzfSAvPlxuICAgICAgICAgICAgICAgICAgICA8Y2FudmFzXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLWNhbnZhc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9eyhub2RlOiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGwpOiB2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc05vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyV2F0ZXJtYXJrKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFJlYWN0UmVzaXplRGV0ZWN0b3IgaGFuZGxlV2lkdGggaGFuZGxlSGVpZ2h0IG9uUmVzaXplPXt0aGlzLm9uUmVzaXplfSAvPlxuICAgICAgICAgICAgPC9TaXplQ29udGFpbmVyPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVySGVhZGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5zaG93SGVhZGVyIHx8ICF0aGlzLnByb3BzLmhlYWRlclRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtaGVhZGVyXCI+e3RoaXMucHJvcHMuaGVhZGVyVGV4dH08L2Rpdj47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJDb250cm9scygpOiBSZWFjdE5vZGUge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFkT25seSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaG93VG9nZ2xlID0gdGhpcy5wcm9wcy5zaG93TW9kZVRvZ2dsZTtcbiAgICAgICAgY29uc3Qgc2hvd0lucHV0ID0gdGhpcy5zdGF0ZS5tb2RlID09PSBcInR5cGVcIjtcbiAgICAgICAgY29uc3Qgc2hvd0NsZWFyID0gdGhpcy5wcm9wcy5zaG93Q2xlYXJCdXR0b247XG4gICAgICAgIGNvbnN0IHNob3dTYXZlID0gdGhpcy5wcm9wcy5zaG93U2F2ZUJ1dHRvbjtcblxuICAgICAgICBpZiAoIXNob3dUb2dnbGUgJiYgIXNob3dJbnB1dCAmJiAhc2hvd0NsZWFyICYmICFzaG93U2F2ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLWNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAge3Nob3dUb2dnbGUgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS10b2dnbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuc3RhdGUubW9kZSA9PT0gXCJkcmF3XCIgPyBcImFjdGl2ZVwiIDogXCJcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnNldE1vZGUoXCJkcmF3XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIERyYXdcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5zdGF0ZS5tb2RlID09PSBcInR5cGVcIiA/IFwiYWN0aXZlXCIgOiBcIlwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0TW9kZShcInR5cGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIHtzaG93SW5wdXQgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2lkZ2V0LXNpZ25hdHVyZS10eXBlZC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dGhpcy5wcm9wcy50eXBlUGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS50eXBlZFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblR5cGVkQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIHtzaG93Q2xlYXIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtY2xlYXJcIiBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsZWFyQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgQ2xlYXJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAge3Nob3dTYXZlID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndpZGdldC1zaWduYXR1cmUtc2F2ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVNhdmVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5wcm9wcy5pc1NhdmVFbmFibGVkfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5zYXZlQnV0dG9uQ2FwdGlvbiB8fCB0aGlzLnByb3BzLnNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdCB8fCBcIlNhdmVcIn1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY2FudmFzTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQgPSBuZXcgU2lnbmF0dXJlUGFkKHRoaXMuY2FudmFzTm9kZSwge1xuICAgICAgICAgICAgICAgIHBlbkNvbG9yOiB0aGlzLnByb3BzLnBlbkNvbG9yLFxuICAgICAgICAgICAgICAgIG9uRW5kOiB0aGlzLmhhbmRsZVNpZ25FbmQsXG4gICAgICAgICAgICAgICAgLi4udGhpcy5zaWduYXR1cmVQYWRPcHRpb25zKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hcHBseU1vZGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFNpZ25hdHVyZVByb3BzKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNpZ25hdHVyZVBhZCkge1xuICAgICAgICAgICAgaWYgKHByZXZQcm9wcy5jbGVhclNpZ25hdHVyZSAhPT0gdGhpcy5wcm9wcy5jbGVhclNpZ25hdHVyZSAmJiB0aGlzLnByb3BzLmNsZWFyU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0eXBlZFRleHQ6IFwiXCIsIGhhc1NpZ25hdHVyZTogZmFsc2UgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldlByb3BzLnJlYWRPbmx5ICE9PSB0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseU1vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmV2UHJvcHMucGVuQ29sb3IgIT09IHRoaXMucHJvcHMucGVuQ29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZC5wZW5Db2xvciA9IHRoaXMucHJvcHMucGVuQ29sb3I7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW9kZSA9PT0gXCJ0eXBlXCIgJiYgdGhpcy5zdGF0ZS50eXBlZFRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUeXBlZFNpZ25hdHVyZSh0aGlzLnN0YXRlLnR5cGVkVGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZQcm9wcy5zaWduYXR1cmVNb2RlICE9PSB0aGlzLnByb3BzLnNpZ25hdHVyZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE1vZGUodGhpcy5wcm9wcy5zaWduYXR1cmVNb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBwcmV2UHJvcHMudHlwZUZvbnRGYW1pbHkgIT09IHRoaXMucHJvcHMudHlwZUZvbnRGYW1pbHkgfHxcbiAgICAgICAgICAgICAgICBwcmV2UHJvcHMudHlwZUZvbnRTaXplICE9PSB0aGlzLnByb3BzLnR5cGVGb250U2l6ZVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW9kZSA9PT0gXCJ0eXBlXCIgJiYgdGhpcy5zdGF0ZS50eXBlZFRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUeXBlZFNpZ25hdHVyZSh0aGlzLnN0YXRlLnR5cGVkVGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlc2l6ZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY2FudmFzTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNOb2RlLndpZHRoID1cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc05vZGUgJiYgdGhpcy5jYW52YXNOb2RlLnBhcmVudEVsZW1lbnQgPyB0aGlzLmNhbnZhc05vZGUucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCA6IDA7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc05vZGUuaGVpZ2h0ID1cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc05vZGUgJiYgdGhpcy5jYW52YXNOb2RlLnBhcmVudEVsZW1lbnQgPyB0aGlzLmNhbnZhc05vZGUucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgOiAwO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW9kZSA9PT0gXCJ0eXBlXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclR5cGVkU2lnbmF0dXJlKHRoaXMuc3RhdGUudHlwZWRUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuc2lnbmF0dXJlUGFkLnRvRGF0YSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQuZnJvbURhdGEoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzaWduYXR1cmVQYWRPcHRpb25zKCk6IElPcHRpb25zIHtcbiAgICAgICAgbGV0IG9wdGlvbnM6IElPcHRpb25zID0ge307XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBlblR5cGUgPT09IFwiZm91bnRhaW5cIikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHsgbWluV2lkdGg6IDAuNiwgbWF4V2lkdGg6IDIuNiwgdmVsb2NpdHlGaWx0ZXJXZWlnaHQ6IDAuNiB9O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucGVuVHlwZSA9PT0gXCJiYWxscG9pbnRcIikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHsgbWluV2lkdGg6IDEuNCwgbWF4V2lkdGg6IDEuNSwgdmVsb2NpdHlGaWx0ZXJXZWlnaHQ6IDEuNSB9O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucGVuVHlwZSA9PT0gXCJtYXJrZXJcIikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHsgbWluV2lkdGg6IDIsIG1heFdpZHRoOiA0LCB2ZWxvY2l0eUZpbHRlcldlaWdodDogMC45IH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVTaWduRW5kID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblNpZ25FbmRBY3Rpb24gJiYgdGhpcy5zdGF0ZS5tb2RlID09PSBcImRyYXdcIikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNpZ25FbmRBY3Rpb24odGhpcy5zaWduYXR1cmVQYWQudG9EYXRhVVJMKCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNpZ25hdHVyZVBhZCAmJiAhdGhpcy5zaWduYXR1cmVQYWQuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaGFzU2lnbmF0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2V0TW9kZShtb2RlOiBcImRyYXdcIiB8IFwidHlwZVwiKTogdm9pZCB7XG4gICAgICAgIGlmIChtb2RlID09PSB0aGlzLnN0YXRlLm1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbW9kZSB9LCAoKSA9PiB0aGlzLmFwcGx5TW9kZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5TW9kZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnNpZ25hdHVyZVBhZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAgICAgICB0aGlzLnNpZ25hdHVyZVBhZC5vZmYoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tb2RlID09PSBcInR5cGVcIikge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgICAgICAgICAgdGhpcy5zaWduYXR1cmVQYWQub2ZmKCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclR5cGVkU2lnbmF0dXJlKHRoaXMuc3RhdGUudHlwZWRUZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkLm9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVHlwZWRDaGFuZ2UgPSAoZXZlbnQ6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0eXBlZFRleHQ6IHRleHQsIGhhc1NpZ25hdHVyZTogdGV4dC50cmltKCkubGVuZ3RoID4gMCB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclR5cGVkU2lnbmF0dXJlKHRleHQpO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25TaWduRW5kQWN0aW9uICYmIHRleHQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNpZ25FbmRBY3Rpb24odGhpcy5zaWduYXR1cmVQYWQudG9EYXRhVVJMKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJUeXBlZFNpZ25hdHVyZSh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNhbnZhc05vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmNhbnZhc05vZGUuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBpZiAoIWN0eCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGVhckNhbnZhcygpO1xuXG4gICAgICAgIGlmICghdGV4dC50cmltKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1heFdpZHRoID0gdGhpcy5jYW52YXNOb2RlLndpZHRoICogMC45O1xuICAgICAgICBsZXQgZm9udFNpemUgPSBNYXRoLm1heCh0aGlzLnByb3BzLnR5cGVGb250U2l6ZSwgOCk7XG4gICAgICAgIGN0eC5mb250ID0gYCR7Zm9udFNpemV9cHggJHt0aGlzLnByb3BzLnR5cGVGb250RmFtaWx5fWA7XG5cbiAgICAgICAgd2hpbGUgKGN0eC5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aCA+IG1heFdpZHRoICYmIGZvbnRTaXplID4gOCkge1xuICAgICAgICAgICAgZm9udFNpemUgLT0gMjtcbiAgICAgICAgICAgIGN0eC5mb250ID0gYCR7Zm9udFNpemV9cHggJHt0aGlzLnByb3BzLnR5cGVGb250RmFtaWx5fWA7XG4gICAgICAgIH1cblxuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wcm9wcy5wZW5Db2xvcjtcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG4gICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICBjdHguZmlsbFRleHQodGV4dCwgdGhpcy5jYW52YXNOb2RlLndpZHRoIC8gMiwgdGhpcy5jYW52YXNOb2RlLmhlaWdodCAvIDIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlQ2xlYXJDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS50eXBlZFRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0eXBlZFRleHQ6IFwiXCIsIGhhc1NpZ25hdHVyZTogZmFsc2UgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5oYXNTaWduYXR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBoYXNTaWduYXR1cmU6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaGFuZGxlU2F2ZUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMub25TYXZlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YVVybCA9IHRoaXMuY2FudmFzTm9kZSA/IHRoaXMuY2FudmFzTm9kZS50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIikgOiB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMucHJvcHMub25TYXZlKGRhdGFVcmwpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlcldhdGVybWFyaygpOiBSZWFjdE5vZGUge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2hvd1dhdGVybWFyayB8fCAhdGhpcy5zdGF0ZS5oYXNTaWduYXR1cmUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uV2F0ZXJtYXJrQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLXdhdGVybWFyay1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMud2F0ZXJtYXJrVGV4dCA/PyBcIlwifVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbldhdGVybWFya0NoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuaXNXYXRlcm1hcmtSZWFkT25seX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJ3aWRnZXQtc2lnbmF0dXJlLXdhdGVybWFyay10ZXh0XCI+e3RoaXMucHJvcHMud2F0ZXJtYXJrVGV4dH08L2Rpdj47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldhdGVybWFya0NoYW5nZSA9IChldmVudDogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25XYXRlcm1hcmtDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25XYXRlcm1hcmtDaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGNsZWFyQ2FudmFzKCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuY2FudmFzTm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY2FudmFzTm9kZS5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXNOb2RlLndpZHRoLCB0aGlzLmNhbnZhc05vZGUuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zaWduYXR1cmVQYWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlUGFkLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDU1NQcm9wZXJ0aWVzLCBjcmVhdGVFbGVtZW50LCBSZWFjdEVsZW1lbnQsIHVzZUNhbGxiYWNrLCB1c2VNZW1vLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gICAgRWRpdGFibGVWYWx1ZSxcbiAgICBMaXN0QWN0aW9uVmFsdWUsXG4gICAgTGlzdEF0dHJpYnV0ZVZhbHVlLFxuICAgIExpc3RFeHByZXNzaW9uVmFsdWUsXG4gICAgTGlzdFZhbHVlLFxuICAgIE9iamVjdEl0ZW0sXG4gICAgVmFsdWVTdGF0dXNcbn0gZnJvbSBcIm1lbmRpeFwiO1xuXG5pbXBvcnQgeyBEaW1lbnNpb25zIH0gZnJvbSBcIi4vU2l6ZUNvbnRhaW5lclwiO1xuaW1wb3J0IFV0aWxzIGZyb20gXCIuLi91dGlscy9VdGlsc1wiO1xuaW1wb3J0IHsgcGVuT3B0aW9ucywgU2lnbmF0dXJlIGFzIFNpZ25hdHVyZUNhbnZhcyB9IGZyb20gXCIuL1NpZ25hdHVyZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hdHVyZUNvbnRhaW5lclByb3BzIGV4dGVuZHMgRGltZW5zaW9ucyB7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgd3JhcHBlclN0eWxlPzogQ1NTUHJvcGVydGllcztcbiAgICByZWFkT25seTogYm9vbGVhbjtcbiAgICBkYXRhU291cmNlPzogTGlzdFZhbHVlO1xuICAgIGhhc1NpZ25hdHVyZUF0dHJpYnV0ZT86IExpc3RFeHByZXNzaW9uVmFsdWU8Ym9vbGVhbj47XG4gICAgZnJpZW5kbHlJZDogc3RyaW5nO1xuICAgIHNpZ25hdHVyZU1vZGU6IFwiZHJhd1wiIHwgXCJ0eXBlXCI7XG4gICAgc2hvd01vZGVUb2dnbGU6IGJvb2xlYW47XG4gICAgc2hvd0NsZWFyQnV0dG9uOiBib29sZWFuO1xuICAgIHNob3dTYXZlQnV0dG9uOiBib29sZWFuO1xuICAgIHNhdmVCdXR0b25DYXB0aW9uPzogTGlzdEV4cHJlc3Npb25WYWx1ZTxzdHJpbmc+O1xuICAgIHNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdDogc3RyaW5nO1xuICAgIG9uU2F2ZUFjdGlvbj86IExpc3RBY3Rpb25WYWx1ZTtcbiAgICBzaG93SGVhZGVyOiBib29sZWFuO1xuICAgIGhlYWRlclRleHQ/OiBMaXN0RXhwcmVzc2lvblZhbHVlPHN0cmluZz47XG4gICAgaGVhZGVyVGV4dERlZmF1bHQ6IHN0cmluZztcbiAgICBiYXNlNjRBdHRyaWJ1dGU/OiBMaXN0QXR0cmlidXRlVmFsdWU8c3RyaW5nPjtcbiAgICBzaG93V2F0ZXJtYXJrOiBib29sZWFuO1xuICAgIHdhdGVybWFya0F0dHJpYnV0ZT86IExpc3RBdHRyaWJ1dGVWYWx1ZTxzdHJpbmc+O1xuICAgIHR5cGVGb250RmFtaWx5OiBzdHJpbmc7XG4gICAgdHlwZUZvbnRTaXplOiBudW1iZXI7XG4gICAgdHlwZVBsYWNlaG9sZGVyOiBzdHJpbmc7XG4gICAgc2hvd0dyaWQ6IGJvb2xlYW47XG4gICAgZ3JpZEJvcmRlckNvbG9yOiBzdHJpbmc7XG4gICAgZ3JpZENlbGxIZWlnaHQ6IG51bWJlcjtcbiAgICBncmlkQ2VsbFdpZHRoOiBudW1iZXI7XG4gICAgZ3JpZEJvcmRlcldpZHRoOiBudW1iZXI7XG4gICAgcGVuVHlwZTogcGVuT3B0aW9ucztcbiAgICBwZW5Db2xvcjogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlT2JqZWN0SXRlbShkYXRhU291cmNlPzogTGlzdFZhbHVlKTogT2JqZWN0SXRlbSB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBkYXRhU291cmNlLnN0YXR1cyA9PT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlID8gZGF0YVNvdXJjZS5pdGVtcz8uWzBdIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2lnbmF0dXJlQ29udGFpbmVyKHByb3BzOiBTaWduYXR1cmVDb250YWluZXJQcm9wcyk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge1xuICAgICAgICBkYXRhU291cmNlLFxuICAgICAgICBoYXNTaWduYXR1cmVBdHRyaWJ1dGUsXG4gICAgICAgIHdyYXBwZXJTdHlsZSxcbiAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICByZWFkT25seSxcbiAgICAgICAgZnJpZW5kbHlJZCxcbiAgICAgICAgc2lnbmF0dXJlTW9kZSxcbiAgICAgICAgc2hvd01vZGVUb2dnbGUsXG4gICAgICAgIHNob3dDbGVhckJ1dHRvbixcbiAgICAgICAgc2hvd1NhdmVCdXR0b24sXG4gICAgICAgIHNhdmVCdXR0b25DYXB0aW9uLFxuICAgICAgICBzYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHQsXG4gICAgICAgIG9uU2F2ZUFjdGlvbixcbiAgICAgICAgc2hvd0hlYWRlcixcbiAgICAgICAgaGVhZGVyVGV4dCxcbiAgICAgICAgaGVhZGVyVGV4dERlZmF1bHQsXG4gICAgICAgIGJhc2U2NEF0dHJpYnV0ZSxcbiAgICAgICAgc2hvd1dhdGVybWFyayxcbiAgICAgICAgd2F0ZXJtYXJrQXR0cmlidXRlLFxuICAgICAgICB0eXBlRm9udEZhbWlseSxcbiAgICAgICAgdHlwZUZvbnRTaXplLFxuICAgICAgICB0eXBlUGxhY2Vob2xkZXIsXG4gICAgICAgIHBlbkNvbG9yLFxuICAgICAgICBwZW5UeXBlLFxuICAgICAgICBzaG93R3JpZCxcbiAgICAgICAgZ3JpZEJvcmRlckNvbG9yLFxuICAgICAgICBncmlkQm9yZGVyV2lkdGgsXG4gICAgICAgIGdyaWRDZWxsSGVpZ2h0LFxuICAgICAgICBncmlkQ2VsbFdpZHRoLFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgd2lkdGhVbml0LFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIGhlaWdodFVuaXRcbiAgICB9ID0gcHJvcHM7XG4gICAgY29uc3QgbXhPYmplY3QgPSB1c2VNZW1vPE9iamVjdEl0ZW0gfCB1bmRlZmluZWQ+KCgpID0+IHJlc29sdmVPYmplY3RJdGVtKGRhdGFTb3VyY2UpLCBbZGF0YVNvdXJjZV0pO1xuICAgIGNvbnN0IHNpZ25hdHVyZUF0dHJpYnV0ZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIW14T2JqZWN0IHx8ICFoYXNTaWduYXR1cmVBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc1NpZ25hdHVyZUF0dHJpYnV0ZS5nZXQobXhPYmplY3QpO1xuICAgIH0sIFtoYXNTaWduYXR1cmVBdHRyaWJ1dGUsIG14T2JqZWN0XSk7XG5cbiAgICBjb25zdCBhbGVydE1lc3NhZ2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFteE9iamVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke2ZyaWVuZGx5SWR9OiBEYXRhIHNvdXJjZSBpcyBlbXB0eS5gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH0sIFtmcmllbmRseUlkLCBteE9iamVjdF0pO1xuXG4gICAgY29uc3QgaXNSZWFkT25seSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICByZXR1cm4gcmVhZE9ubHkgfHwgIW14T2JqZWN0O1xuICAgIH0sIFtteE9iamVjdCwgcmVhZE9ubHldKTtcblxuICAgIGNvbnN0IHdhdGVybWFya1ZhbHVlID0gdXNlTWVtbzxFZGl0YWJsZVZhbHVlPHN0cmluZz4gfCB1bmRlZmluZWQ+KCgpID0+IHtcbiAgICAgICAgaWYgKCFteE9iamVjdCB8fCAhd2F0ZXJtYXJrQXR0cmlidXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3YXRlcm1hcmtBdHRyaWJ1dGUuZ2V0KG14T2JqZWN0KTtcbiAgICB9LCBbbXhPYmplY3QsIHdhdGVybWFya0F0dHJpYnV0ZV0pO1xuXG4gICAgY29uc3Qgd2F0ZXJtYXJrVGV4dCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXdhdGVybWFya1ZhbHVlIHx8IHdhdGVybWFya1ZhbHVlLnN0YXR1cyAhPT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2F0ZXJtYXJrVmFsdWUudmFsdWUgPz8gXCJcIjtcbiAgICB9LCBbd2F0ZXJtYXJrVmFsdWVdKTtcblxuICAgIGNvbnN0IGhhbmRsZVdhdGVybWFya0NoYW5nZSA9IHVzZUNhbGxiYWNrKFxuICAgICAgICAodmFsdWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKCF3YXRlcm1hcmtWYWx1ZSB8fCB3YXRlcm1hcmtWYWx1ZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSB8fCB3YXRlcm1hcmtWYWx1ZS5yZWFkT25seSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdhdGVybWFya1ZhbHVlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgW3dhdGVybWFya1ZhbHVlXVxuICAgICk7XG5cbiAgICBjb25zdCBzYXZlQnV0dG9uQ2FwdGlvblRleHQgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFteE9iamVjdCB8fCAhc2F2ZUJ1dHRvbkNhcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBzYXZlQnV0dG9uQ2FwdGlvbkRlZmF1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FwdGlvblZhbHVlID0gc2F2ZUJ1dHRvbkNhcHRpb24uZ2V0KG14T2JqZWN0KTtcbiAgICAgICAgaWYgKGNhcHRpb25WYWx1ZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FwdGlvblZhbHVlLnZhbHVlICE9PSBcIlwiID8gY2FwdGlvblZhbHVlLnZhbHVlIDogc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0O1xuICAgIH0sIFtteE9iamVjdCwgc2F2ZUJ1dHRvbkNhcHRpb24sIHNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdF0pO1xuXG4gICAgY29uc3QgaGVhZGVyVGV4dFZhbHVlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghbXhPYmplY3QgfHwgIWhlYWRlclRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBoZWFkZXJUZXh0RGVmYXVsdDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJWYWx1ZSA9IGhlYWRlclRleHQuZ2V0KG14T2JqZWN0KTtcbiAgICAgICAgaWYgKGhlYWRlclZhbHVlLnN0YXR1cyAhPT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gaGVhZGVyVGV4dERlZmF1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhlYWRlclZhbHVlLnZhbHVlICE9PSBcIlwiID8gaGVhZGVyVmFsdWUudmFsdWUgOiBoZWFkZXJUZXh0RGVmYXVsdDtcbiAgICB9LCBbbXhPYmplY3QsIGhlYWRlclRleHQsIGhlYWRlclRleHREZWZhdWx0XSk7XG5cbiAgICBjb25zdCBzYXZlQWN0aW9uID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghbXhPYmplY3QgfHwgIW9uU2F2ZUFjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb25TYXZlQWN0aW9uLmdldChteE9iamVjdCk7XG4gICAgfSwgW214T2JqZWN0LCBvblNhdmVBY3Rpb25dKTtcblxuICAgIGNvbnN0IGJhc2U2NFZhbHVlID0gdXNlTWVtbzxFZGl0YWJsZVZhbHVlPHN0cmluZz4gfCB1bmRlZmluZWQ+KCgpID0+IHtcbiAgICAgICAgaWYgKCFteE9iamVjdCB8fCAhYmFzZTY0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlNjRBdHRyaWJ1dGUuZ2V0KG14T2JqZWN0KTtcbiAgICB9LCBbbXhPYmplY3QsIGJhc2U2NEF0dHJpYnV0ZV0pO1xuXG4gICAgY29uc3Qgc2V0QmFzZTY0VmFsdWUgPSB1c2VDYWxsYmFjayhcbiAgICAgICAgKHZhbHVlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICghYmFzZTY0VmFsdWUgfHwgYmFzZTY0VmFsdWUuc3RhdHVzICE9PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUgfHwgYmFzZTY0VmFsdWUucmVhZE9ubHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlNjRWYWx1ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIFtiYXNlNjRWYWx1ZV1cbiAgICApO1xuXG4gICAgY29uc3QgZ2VuZXJhdGVGaWxlTmFtZSA9IHVzZUNhbGxiYWNrKChndWlkOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gYHNpZ25hdHVyZS0ke2d1aWR9LnBuZ2A7XG4gICAgfSwgW10pO1xuXG4gICAgY29uc3Qgc2F2ZURvY3VtZW50ID0gdXNlQ2FsbGJhY2soXG4gICAgICAgIChiYXNlNjRVcmk6IHN0cmluZywgb25TdWNjZXNzPzogKCkgPT4gdm9pZCk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKCFiYXNlNjRVcmkgfHwgIW14T2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbXguZGF0YS5zYXZlRG9jdW1lbnQoXG4gICAgICAgICAgICAgICAgbXhPYmplY3QuaWQsXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVGaWxlTmFtZShteE9iamVjdC5pZCksXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgVXRpbHMuY29udmVydFVybFRvQmxvYihiYXNlNjRVcmkpLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9uU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlcnI6IHsgbWVzc2FnZTogc3RyaW5nIH0pID0+IG14LnVpLmVycm9yKGBFcnJvciBzYXZpbmcgc2lnbmF0dXJlOiAke2Vyci5tZXNzYWdlfWApXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBbZ2VuZXJhdGVGaWxlTmFtZSwgbXhPYmplY3RdXG4gICAgKTtcblxuICAgIGNvbnN0IGxhc3RTaWduYXR1cmVEYXRhVXJsUmVmID0gdXNlUmVmPHN0cmluZyB8IHVuZGVmaW5lZD4oKTtcblxuICAgIGNvbnN0IGhhbmRsZVNpZ25FbmQgPSB1c2VDYWxsYmFjayhcbiAgICAgICAgKGJhc2U2NFVyaT86IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKCFiYXNlNjRVcmkgfHwgIW14T2JqZWN0IHx8IGlzUmVhZE9ubHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0U2lnbmF0dXJlRGF0YVVybFJlZi5jdXJyZW50ID0gYmFzZTY0VXJpO1xuICAgICAgICAgICAgc2V0QmFzZTY0VmFsdWUoYmFzZTY0VXJpKTtcbiAgICAgICAgICAgIHNhdmVEb2N1bWVudChiYXNlNjRVcmkpO1xuICAgICAgICB9LFxuICAgICAgICBbaXNSZWFkT25seSwgbXhPYmplY3QsIHNhdmVEb2N1bWVudCwgc2V0QmFzZTY0VmFsdWVdXG4gICAgKTtcblxuICAgIGNvbnN0IGhhbmRsZVNhdmUgPSB1c2VDYWxsYmFjayhcbiAgICAgICAgKGJhc2U2NFVyaT86IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0YVVybCA9IGJhc2U2NFVyaSB8fCBsYXN0U2lnbmF0dXJlRGF0YVVybFJlZi5jdXJyZW50O1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0ZUFjdGlvbiA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmVhZE9ubHkgJiYgc2F2ZUFjdGlvbj8uY2FuRXhlY3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzYXZlQWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGRhdGFVcmwpIHtcbiAgICAgICAgICAgICAgICBzZXRCYXNlNjRWYWx1ZShkYXRhVXJsKTtcbiAgICAgICAgICAgICAgICBzYXZlRG9jdW1lbnQoZGF0YVVybCwgZXhlY3V0ZUFjdGlvbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbigpO1xuICAgICAgICB9LFxuICAgICAgICBbaXNSZWFkT25seSwgc2F2ZUFjdGlvbiwgc2F2ZURvY3VtZW50LCBzZXRCYXNlNjRWYWx1ZV1cbiAgICApO1xuXG4gICAgY29uc3QgY2xlYXJTaWduYXR1cmUgPVxuICAgICAgICBzaWduYXR1cmVBdHRyaWJ1dGU/LnN0YXR1cyA9PT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlID8gc2lnbmF0dXJlQXR0cmlidXRlLnZhbHVlID09PSBmYWxzZSA6IGZhbHNlO1xuXG4gICAgY29uc3Qgc2hvdWxkU2hvd1dhdGVybWFyayA9IHNob3dXYXRlcm1hcmsgJiYgISF3YXRlcm1hcmtWYWx1ZTtcblxuICAgIGNvbnN0IHNob3VsZFNob3dDb250cm9scyA9ICFpc1JlYWRPbmx5O1xuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoU2lnbmF0dXJlQ2FudmFzLCB7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICB3aWR0aFVuaXQsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgaGVpZ2h0VW5pdCxcbiAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICB3cmFwcGVyU3R5bGUsXG4gICAgICAgIGFsZXJ0TWVzc2FnZSxcbiAgICAgICAgY2xlYXJTaWduYXR1cmUsXG4gICAgICAgIHJlYWRPbmx5OiBpc1JlYWRPbmx5LFxuICAgICAgICBvblNpZ25FbmRBY3Rpb246IGhhbmRsZVNpZ25FbmQsXG4gICAgICAgIHNpZ25hdHVyZU1vZGUsXG4gICAgICAgIHNob3dNb2RlVG9nZ2xlOiBzaG91bGRTaG93Q29udHJvbHMgJiYgc2hvd01vZGVUb2dnbGUsXG4gICAgICAgIHNob3dDbGVhckJ1dHRvbjogc2hvdWxkU2hvd0NvbnRyb2xzICYmIHNob3dDbGVhckJ1dHRvbixcbiAgICAgICAgc2hvd1NhdmVCdXR0b246IHNob3VsZFNob3dDb250cm9scyAmJiBzaG93U2F2ZUJ1dHRvbixcbiAgICAgICAgc2F2ZUJ1dHRvbkNhcHRpb246IHNhdmVCdXR0b25DYXB0aW9uVGV4dCxcbiAgICAgICAgc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0LFxuICAgICAgICBvblNhdmU6IGhhbmRsZVNhdmUsXG4gICAgICAgIGlzU2F2ZUVuYWJsZWQ6ICEhc2F2ZUFjdGlvbj8uY2FuRXhlY3V0ZSAmJiAhaXNSZWFkT25seSxcbiAgICAgICAgc2hvd0hlYWRlcixcbiAgICAgICAgaGVhZGVyVGV4dDogaGVhZGVyVGV4dFZhbHVlLFxuICAgICAgICBzaG93V2F0ZXJtYXJrOiBzaG91bGRTaG93V2F0ZXJtYXJrLFxuICAgICAgICB3YXRlcm1hcmtUZXh0LFxuICAgICAgICBvbldhdGVybWFya0NoYW5nZTogaGFuZGxlV2F0ZXJtYXJrQ2hhbmdlLFxuICAgICAgICBpc1dhdGVybWFya1JlYWRPbmx5OiBpc1JlYWRPbmx5IHx8ICEhd2F0ZXJtYXJrVmFsdWU/LnJlYWRPbmx5LFxuICAgICAgICB0eXBlRm9udEZhbWlseSxcbiAgICAgICAgdHlwZUZvbnRTaXplLFxuICAgICAgICB0eXBlUGxhY2Vob2xkZXIsXG4gICAgICAgIHBlbkNvbG9yLFxuICAgICAgICBwZW5UeXBlLFxuICAgICAgICBzaG93R3JpZCxcbiAgICAgICAgZ3JpZEJvcmRlckNvbG9yLFxuICAgICAgICBncmlkQm9yZGVyV2lkdGgsXG4gICAgICAgIGdyaWRDZWxsSGVpZ2h0LFxuICAgICAgICBncmlkQ2VsbFdpZHRoXG4gICAgfSk7XG59XG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBSZWFjdEVsZW1lbnQgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgU2lnbmF0dXJlQ29udGFpbmVyIH0gZnJvbSBcIi4vY29tcG9uZW50cy9TaWduYXR1cmVDb250YWluZXJcIjtcbmltcG9ydCB7IFNpZ25hdHVyZUNvbnRhaW5lclByb3BzIH0gZnJvbSBcIi4uL3R5cGluZ3MvU2lnbmF0dXJlUHJvcHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFNpZ25hdHVyZVdlYihwcm9wczogU2lnbmF0dXJlQ29udGFpbmVyUHJvcHMpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHByb3BzQW55ID0gcHJvcHMgYXMgU2lnbmF0dXJlQ29udGFpbmVyUHJvcHMgJiB7XG4gICAgICAgIHJlYWRPbmx5PzogYm9vbGVhbjtcbiAgICAgICAgZWRpdGFibGU/OiBib29sZWFuO1xuICAgICAgICBlZGl0YWJpbGl0eT86IHN0cmluZztcbiAgICB9O1xuICAgIGNvbnN0IGVkaXRhYmlsaXR5ID0gdHlwZW9mIHByb3BzQW55LmVkaXRhYmlsaXR5ID09PSBcInN0cmluZ1wiID8gcHJvcHNBbnkuZWRpdGFiaWxpdHkudG9Mb3dlckNhc2UoKSA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCByZWFkT25seSA9XG4gICAgICAgIHByb3BzQW55LnJlYWRPbmx5ID8/XG4gICAgICAgIChwcm9wc0FueS5lZGl0YWJsZSA9PT0gZmFsc2UgPyB0cnVlIDogdW5kZWZpbmVkKSA/P1xuICAgICAgICAocHJvcHNBbnkuZWRpdGFibGUgPT09IHRydWUgPyBmYWxzZSA6IHVuZGVmaW5lZCkgPz9cbiAgICAgICAgKGVkaXRhYmlsaXR5ID09PSBcIm5ldmVyXCIgfHwgZWRpdGFiaWxpdHkgPT09IFwicmVhZC1vbmx5XCIgfHwgZWRpdGFiaWxpdHkgPT09IFwicmVhZG9ubHlcIiA/IHRydWUgOiB1bmRlZmluZWQpID8/XG4gICAgICAgIChlZGl0YWJpbGl0eSA9PT0gXCJhbHdheXNcIiA/IGZhbHNlIDogdW5kZWZpbmVkKSA/P1xuICAgICAgICBmYWxzZTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxTaWduYXR1cmVDb250YWluZXJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cHJvcHMuY2xhc3N9XG4gICAgICAgICAgICB3cmFwcGVyU3R5bGU9e3Byb3BzLnN0eWxlfVxuICAgICAgICAgICAgcmVhZE9ubHk9e3JlYWRPbmx5fVxuICAgICAgICAgICAgZGF0YVNvdXJjZT17cHJvcHMuZGF0YVNvdXJjZX1cbiAgICAgICAgICAgIGhhc1NpZ25hdHVyZUF0dHJpYnV0ZT17cHJvcHMuaGFzU2lnbmF0dXJlQXR0cmlidXRlfVxuICAgICAgICAgICAgZnJpZW5kbHlJZD17cHJvcHMubmFtZX1cbiAgICAgICAgICAgIHNpZ25hdHVyZU1vZGU9e3Byb3BzLnNpZ25hdHVyZU1vZGV9XG4gICAgICAgICAgICBzaG93TW9kZVRvZ2dsZT17cHJvcHMuc2hvd01vZGVUb2dnbGV9XG4gICAgICAgICAgICBzaG93Q2xlYXJCdXR0b249e3Byb3BzLnNob3dDbGVhckJ1dHRvbn1cbiAgICAgICAgICAgIHNob3dTYXZlQnV0dG9uPXtwcm9wcy5zaG93U2F2ZUJ1dHRvbn1cbiAgICAgICAgICAgIHNhdmVCdXR0b25DYXB0aW9uPXtwcm9wcy5zYXZlQnV0dG9uQ2FwdGlvbn1cbiAgICAgICAgICAgIHNhdmVCdXR0b25DYXB0aW9uRGVmYXVsdD17cHJvcHMuc2F2ZUJ1dHRvbkNhcHRpb25EZWZhdWx0fVxuICAgICAgICAgICAgb25TYXZlQWN0aW9uPXtwcm9wcy5vblNhdmVBY3Rpb259XG4gICAgICAgICAgICBzaG93SGVhZGVyPXtwcm9wcy5zaG93SGVhZGVyfVxuICAgICAgICAgICAgaGVhZGVyVGV4dD17cHJvcHMuaGVhZGVyVGV4dH1cbiAgICAgICAgICAgIGhlYWRlclRleHREZWZhdWx0PXtwcm9wcy5oZWFkZXJUZXh0RGVmYXVsdH1cbiAgICAgICAgICAgIGJhc2U2NEF0dHJpYnV0ZT17cHJvcHMuYmFzZTY0QXR0cmlidXRlfVxuICAgICAgICAgICAgc2hvd1dhdGVybWFyaz17cHJvcHMuc2hvd1dhdGVybWFya31cbiAgICAgICAgICAgIHdhdGVybWFya0F0dHJpYnV0ZT17cHJvcHMud2F0ZXJtYXJrQXR0cmlidXRlfVxuICAgICAgICAgICAgdHlwZUZvbnRGYW1pbHk9e3Byb3BzLnR5cGVGb250RmFtaWx5fVxuICAgICAgICAgICAgdHlwZUZvbnRTaXplPXtwcm9wcy50eXBlRm9udFNpemV9XG4gICAgICAgICAgICB0eXBlUGxhY2Vob2xkZXI9e3Byb3BzLnR5cGVQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIHdpZHRoPXtwcm9wcy53aWR0aH1cbiAgICAgICAgICAgIHdpZHRoVW5pdD17cHJvcHMud2lkdGhVbml0fVxuICAgICAgICAgICAgaGVpZ2h0PXtwcm9wcy5oZWlnaHR9XG4gICAgICAgICAgICBoZWlnaHRVbml0PXtwcm9wcy5oZWlnaHRVbml0fVxuICAgICAgICAgICAgc2hvd0dyaWQ9e3Byb3BzLnNob3dHcmlkfVxuICAgICAgICAgICAgZ3JpZEJvcmRlckNvbG9yPXtwcm9wcy5ncmlkQm9yZGVyQ29sb3J9XG4gICAgICAgICAgICBncmlkQm9yZGVyV2lkdGg9e3Byb3BzLmdyaWRCb3JkZXJXaWR0aH1cbiAgICAgICAgICAgIGdyaWRDZWxsSGVpZ2h0PXtwcm9wcy5ncmlkQ2VsbEhlaWdodH1cbiAgICAgICAgICAgIGdyaWRDZWxsV2lkdGg9e3Byb3BzLmdyaWRDZWxsV2lkdGh9XG4gICAgICAgICAgICBwZW5Db2xvcj17cHJvcHMucGVuQ29sb3J9XG4gICAgICAgICAgICBwZW5UeXBlPXtwcm9wcy5wZW5UeXBlfVxuICAgICAgICAvPlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsiUG9pbnQiLCJjb25zdHJ1Y3RvciIsIngiLCJ5IiwicHJlc3N1cmUiLCJ0aW1lIiwiaXNOYU4iLCJFcnJvciIsIkRhdGUiLCJub3ciLCJkaXN0YW5jZVRvIiwic3RhcnQiLCJNYXRoIiwic3FydCIsInBvdyIsImVxdWFscyIsIm90aGVyIiwidmVsb2NpdHlGcm9tIiwiaGFzT3duIiwiaGFzT3duUHJvcGVydHkiLCJjbGFzc05hbWVzIiwiY2xhc3NlcyIsImkiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJhcmciLCJhcHBlbmRDbGFzcyIsInBhcnNlVmFsdWUiLCJBcnJheSIsImlzQXJyYXkiLCJhcHBseSIsInRvU3RyaW5nIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaW5jbHVkZXMiLCJrZXkiLCJjYWxsIiwidmFsdWUiLCJuZXdDbGFzcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJkZWZhdWx0Iiwid2luZG93IiwiaXNPYmplY3QiLCJ0eXBlIiwiZnJlZUdsb2JhbCIsImdsb2JhbCIsInJlcXVpcmUiLCJmcmVlU2VsZiIsInNlbGYiLCJyb290IiwiRnVuY3Rpb24iLCJyZVdoaXRlc3BhY2UiLCJ0cmltbWVkRW5kSW5kZXgiLCJzdHJpbmciLCJpbmRleCIsInRlc3QiLCJjaGFyQXQiLCJyZVRyaW1TdGFydCIsImJhc2VUcmltIiwic2xpY2UiLCJyZXBsYWNlIiwiU3ltYm9sIiwib2JqZWN0UHJvdG8iLCJuYXRpdmVPYmplY3RUb1N0cmluZyIsInN5bVRvU3RyaW5nVGFnIiwidG9TdHJpbmdUYWciLCJ1bmRlZmluZWQiLCJnZXRSYXdUYWciLCJpc093biIsInRhZyIsInVubWFza2VkIiwiZSIsInJlc3VsdCIsIm9iamVjdFRvU3RyaW5nIiwibnVsbFRhZyIsInVuZGVmaW5lZFRhZyIsImJhc2VHZXRUYWciLCJpc09iamVjdExpa2UiLCJzeW1ib2xUYWciLCJpc1N5bWJvbCIsIk5BTiIsInJlSXNCYWRIZXgiLCJyZUlzQmluYXJ5IiwicmVJc09jdGFsIiwiZnJlZVBhcnNlSW50IiwicGFyc2VJbnQiLCJ0b051bWJlciIsInZhbHVlT2YiLCJpc0JpbmFyeSIsIkZVTkNfRVJST1JfVEVYVCIsIm5hdGl2ZU1heCIsIm1heCIsIm5hdGl2ZU1pbiIsIm1pbiIsImRlYm91bmNlIiwiZnVuYyIsIndhaXQiLCJvcHRpb25zIiwibGFzdEFyZ3MiLCJsYXN0VGhpcyIsIm1heFdhaXQiLCJ0aW1lcklkIiwibGFzdENhbGxUaW1lIiwibGFzdEludm9rZVRpbWUiLCJsZWFkaW5nIiwibWF4aW5nIiwidHJhaWxpbmciLCJUeXBlRXJyb3IiLCJpbnZva2VGdW5jIiwiYXJncyIsInRoaXNBcmciLCJsZWFkaW5nRWRnZSIsInNldFRpbWVvdXQiLCJ0aW1lckV4cGlyZWQiLCJyZW1haW5pbmdXYWl0IiwidGltZVNpbmNlTGFzdENhbGwiLCJ0aW1lU2luY2VMYXN0SW52b2tlIiwidGltZVdhaXRpbmciLCJzaG91bGRJbnZva2UiLCJ0cmFpbGluZ0VkZ2UiLCJjYW5jZWwiLCJjbGVhclRpbWVvdXQiLCJmbHVzaCIsImRlYm91bmNlZCIsImlzSW52b2tpbmciLCJ0aHJvdHRsZSIsImV4dGVuZFN0YXRpY3MiLCJkIiwiYiIsInNldFByb3RvdHlwZU9mIiwiX19wcm90b19fIiwicCIsIl9fZXh0ZW5kcyIsIlN0cmluZyIsIl9fIiwiY3JlYXRlIiwiX19yZXN0IiwicyIsInQiLCJpbmRleE9mIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJTdXBwcmVzc2VkRXJyb3IiLCJlcnJvciIsInN1cHByZXNzZWQiLCJtZXNzYWdlIiwibmFtZSIsImNyZWF0ZUVsZW1lbnQiLCJQdXJlQ29tcG9uZW50IiwiUmVhY3RSZXNpemVEZXRlY3RvciIs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RUFDdEMsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQ3BDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxpQkFBaUIsRUFDMUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLHdCQUF3QixFQUN4RCxZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFDaEMsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQzVCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUM1QixpQkFBaUIsRUFBRSxLQUFLLENBQUMsaUJBQWlCLEVBQzFDLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZSxFQUN0QyxhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFDbEMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixFQUM1QyxjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFDcEMsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQ2hDLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZSxFQUN0QyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFDbEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQzFCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUNwQixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFDNUIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQ3hCLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZSxFQUN0QyxlQUFlLEVBQUUsS0FBSyxDQUFDLGVBQWUsRUFDdEMsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQ3BDLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxFQUNsQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFDeEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQ3hCLENBQUEsRUFDSjtJQUNOOzs7Ozs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMThdfQ==
