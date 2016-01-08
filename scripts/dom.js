'use strict';

module.exports = function () {
	var _cache = {};

	function cleanCache() {
		var htmlDoc = document.getElementsByTagName('html')[0];
		Object.keys(_cache).forEach(function (k) {
			if (!htmlDoc.contains(_cache[k])) delete _cache[k];
		});
	}

	function removeFromCache() {
		var args = [];
		for (var i = 0, ii = arguments.length; i < ii; i++) {
			args.push(arguments[i]);
		}
		args.forEach(function (elm) {
			var elementId = elm;
			if (elm instanceof HTMLElement && elm.id) elementId = elm.id;
			if (_cache[elementId]) delete _cache[elementId];
		});
	}

	function getElementById(id) {
		var element = document.getElementById(id);
		if (!element) return null;
		_cache[id] = addMethods(element);
		return _cache[id];
	}

	function getElementsByClassName(parent, className) {
		var elements = parent.getElementsByClassName(className);
		addCollectionMethods(elements);
		return elements;
	}

	function getElementsByTagName(parent, tag) {
		var elements = parent.getElementsByTagName(tag);
		addCollectionMethods(elements);
		return elements;
	}

	function createElement(el) {
		return addMethods(document.createElement(el));
	}

	function removeElement(el, destroy) {
		var DESTROY = destroy === false ? destroy : true;
		var element = el;
		if (typeof el === 'string') {
			element = dom(el);
		}
		if (element.parentNode) {
			element.parentNode.removeChild(element);
		}
		if (DESTROY) {
			removeFromCache(el);
		}
	}

	function addCollectionMethods(elements) {
		elements.each = function (toEach) {
			var self = this;
			for (var i = 0, ii = self.length; i < ii; i++) {
				toEach(self[i]);
			}
		};

		elements.toArr = function (toEach) {
			var arr = [];
			for (var i = 0, ii = this.length; i < ii; i++) {
				arr.push(this[i]);
			}
			return arr;
		};
	}

	function addMethods(obj) {
		obj.append = function () {
			for (var i = 0, ii = arguments.length; i < ii; i++) {
				this.appendChild(arguments[i]);
			}
			return this;
		};

		obj.addClass = function () {
			var args = [];
			for (var i = 0, ii = arguments.length; i < ii; i++) {
				args.push(arguments[i]);
			}
			this.classList.add.apply(this.classList, args);
			return this;
		};

		obj.hasClass = function (c) {
			return this.classList.contains(c);
		};

		obj.removeClass = function () {
			for (var i = 0, ii = arguments.length; i < ii; i++) {
				this.classList.remove(arguments[i]);
			}
			return this;
		};

		obj.setId = function (id) {
			this.id = id;
			if (!_cache[id]) {
				// console.log("add to cache:",id);
				_cache[id] = this;
			}
			return this;
		};

		Object.defineProperty(obj, 'text', {
			configurable: true,
			enumerable: true,
			writable: true,
			// property value is a method
			value: function value(str) {
				if (typeof str === 'string') obj.appendChild(document.createTextNode(str));
				return obj;
			}
		});

		obj.purge = function (text) {
			while (this.firstChild) {
				this.removeChild(this.firstChild);
			}
			return this;
		};

		obj.attr = function (key, val) {
			this.setAttribute(key, val);
			return this;
		};

		obj.listen = function () {
			var args = [];
			for (var i = 0, ii = arguments.length; i < ii; i++) {
				args.push(arguments[i]);
			}
			this.addEventListener.apply(this, args);
			return this;
		};

		obj.emit = function (evt) {
			return this.dispatchEvent(new Event(evt));
		};

		obj.queryByClass = function (className) {
			return getElementsByClassName(this, className);
		};

		obj.queryByTag = function (tag) {
			return getElementsByTagName(this, tag);
		};

		obj.getComputedStyle = function (prop, format) {
			var computedStyle = getComputedStyle(this);
			var propVal = computedStyle.getPropertyValue(prop);
			if (format === 'int') return parseInt(propVal);
			if (format === 'float') return parseFloat(propVal);
			return propVal;
		};

		obj.destructor = function (cb) {
			this.onDestruct = cb;
			return this;
		};

		return obj;
	}

	function parseDomInput(input) {
		// if elemnt already cached, return it
		if (_cache[input]) {
			// console.log("from cache:",input);
			return _cache[input];
		}
		return getElementById(input);
	}

	// function getPropVal(elmnt, prop, format) {
	// 	let computedStyle;
	// 	if (elmnt instanceof CSSStyleDeclaration) {
	// 		computedStyle = elmnt;
	// 	} else if (elmnt instanceof HTMLElement) {
	// 		computedStyle = getComputedStyle(elmnt);
	// 	} else {
	// 		throw new Error('could not get property value of non-element');
	// 	}

	// 	if (format === 'int') return parseInt(computedStyle.getPropertyValue(prop));
	// 	if (format === 'float') return parseInt(computedStyle.getPropertyValue(prop));
	// 	return computedStyle.getPropertyValue(prop);
	// }

	function _dom(input) {
		return parseDomInput(input);
	}

	_dom.get = parseDomInput;
	_dom.queryByClass = function (className) {
		return getElementsByClassName(document.body, className);
	};
	_dom.create = createElement;
	_dom.remove = removeElement;
	_dom.cache = {
		delete: removeFromCache,
		clean: cleanCache,
		get: function get() {
			var obj = {};
			Object.keys(_cache).forEach(function (key) {
				obj[key] = _cache[key];
			});
			return obj;
		}
	};
	return _dom;
}();