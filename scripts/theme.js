'use strict';

var theme = function () {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var scriptsDir = path.join(__dirname, 'scripts');
	var dom = require(path.join(scriptsDir, 'dom'));

	var themesPath = path.resolve(__dirname, 'styles/themes');

	var selectedTheme = null;

	var themes = {
		light: {
			logo: 'npm-scripts-black.png',
			primaryLoader: 'loader-white.png',
			loader: 'loader-red.png'
		},
		dark: {
			logo: 'npm-scripts-white.png',
			primaryLoader: 'loader-white.png',
			loader: 'loader-red.png'
		}
	};

	return {
		getLogo: function getLogo() {
			return themes[selectedTheme].logo;
		},
		getPrimaryLoader: function getPrimaryLoader() {
			return themes[selectedTheme].primaryLoader;
		},
		getLoader: function getLoader() {
			return themes[selectedTheme].loader;
		},
		set: function set(themeName) {
			selectedTheme = themes[themeName] ? themeName : 'light';
			var themePath = path.join(themesPath, selectedTheme + '.css');

			fs.readFile(themePath, 'utf8', function (err, data) {
				if (err) return alert('Error. Could not load theme file.');

				document.getElementById('head').appendChild(dom.create('style').text(data));

				document.getElementById('npm-logo').setAttribute('src', 'images/' + themes[selectedTheme].logo);
			});
		}
	};
}();