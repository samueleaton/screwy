'use strict';

module.exports = function () {

	var charMap = {
		numeric: '1234567890',
		alphaNumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
		special: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$&_'
	};

	function rand(size, map) {
		var length = size || 32;
		var randomChars = '';
		var list = charMap[map || 'alphaNumeric'];

		for (var i = 0; i < length; i++) {
			randomChars += list.charAt(Math.floor(Math.random() * list.length));
		}

		return randomChars;
	}

	rand.number = function (length) {
		return rand(length, 'numeric');
	};

	rand.alphaNumeric = rand.string = function (length) {
		return rand(length, 'alphaNumeric');
	};

	rand.special = function (length) {
		return rand(length, 'special');
	};

	return rand;
}();