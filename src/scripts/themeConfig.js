'use strict';

import fs from 'fs';
import path from 'path';

const themesPath = path.resolve(__dirname, '../styles/themes');

const themes = {
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
	const themeName = configObj.theme.name;

	const selectedTheme = themes[themeName] ? themeName : 'light' ;
	const themePath = path.join(themesPath, selectedTheme + '.css');

	configObj.theme.logoPath = themes[selectedTheme].logoPath;
	configObj.theme.primarySpinnerPath = themes[selectedTheme].primarySpinnerPath;
	configObj.theme.secondarySpinnerPath = themes[selectedTheme].secondarySpinnerPath;

	fs.readFile(themePath, 'utf8', (err, data) => {
		if (err) return alert('Error. Could not load theme file.');

		const styleTag = window.document.createElement('style');
		styleTag.textContent = data;

		window.document.getElementById('head').appendChild(
			styleTag
		);
	});
}

module.exports = setTheme;
