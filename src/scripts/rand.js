module.exports = (function() {

	const charMap = {
		numeric: '1234567890',
		alphaNumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
		special: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$&_'
	};

	function rand(_length, map) {
		const length = _length || 32;
		let randomChars = '';
		const list = charMap[ map || 'alphaNumeric' ] ;

		for (let i = 0; i < length; i++) {
			randomChars += list.charAt(Math.floor(Math.random() * list.length));
		}
			
		return randomChars;
	}

	rand.number = function(length) {
		return rand(length, 'numeric');
	};

	rand.alphaNumeric = rand.string = function(length) {
		return rand(length, 'alphaNumeric');
	};

	rand.special = function(length) {
		return rand(length, 'special');
	};
	
	return rand;
})();
