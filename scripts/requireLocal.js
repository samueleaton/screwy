'use strict';

require.local = function () {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	args.unshift(__dirname);
	return require(require('path').join.apply(null, args));
};