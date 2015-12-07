'use strict';
const fs = require('fs');
const path = require('path');
const dom = require('./dom');

const themesPath = path.resolve(__dirname, '../styles/themes');

let selectedTheme = null;

const themes = {
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

module.exports = {
	getLogo() {
		return themes[selectedTheme].logo
	},
	getPrimaryLoader() {
		return themes[selectedTheme].primaryLoader
	},
	getLoader() {
		return themes[selectedTheme].loader
	},
	set(themeName) {
		selectedTheme = themes[themeName] ? themeName : 'light' ;
		const themePath = path.join(themesPath, selectedTheme + '.css');
		fs.readFile(themePath, 'utf8', (err, data) => {
			if (err) return alert('Error. Could not load theme file.');

			document.getElementById('head').appendChild(
				dom.create('style').text(data)
			);

			document.getElementById('npm-logo')
				.setAttribute('src', 'images/' + themes[selectedTheme].logo);
		});
	}
};
