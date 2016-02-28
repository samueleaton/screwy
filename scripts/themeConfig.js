'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var themesPath = _path2.default.resolve(__dirname, '../styles/themes');

var themes = {
	light: {
		logoPath: 'images/npm-scripts-black.png',
		primarySpinnerPath: 'images/loader-white.png',
		secondarySpinnerPath: 'images/loader-red.png'
	},
	dark: {
		logoPath: 'images/npm-scripts-white.png',
		primarySpinnerPath: 'images/loader-white.png',
		secondarySpinnerPath: 'images/loader-red.png'
	}
};

function setTheme(configObj) {
	var themeName = configObj.theme.name;

	var selectedTheme = themes[themeName] ? themeName : 'light';
	var themePath = _path2.default.join(themesPath, selectedTheme + '.css');

	configObj.theme.logoPath = themes[selectedTheme].logoPath;
	configObj.theme.primarySpinnerPath = themes[selectedTheme].primarySpinnerPath;
	configObj.theme.secondarySpinnerPath = themes[selectedTheme].secondarySpinnerPath;

	_fs2.default.readFile(themePath, 'utf8', function (err, data) {
		if (err) return alert('Error. Could not load theme file.');

		var styleTag = window.document.createElement('style');
		styleTag.textContent = data;

		window.document.getElementById('head').appendChild(styleTag);
	});
}

module.exports = setTheme;