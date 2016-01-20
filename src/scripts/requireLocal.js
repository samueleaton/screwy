require.local = function(...args) {
	args.unshift(__dirname);
	return require(require('path').join.apply(null, args));
}
