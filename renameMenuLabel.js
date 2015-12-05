// runs after install
'use strict';
const fs = require('fs');
const path = require('path');

const infoPlistPath = path.join(
	__dirname, 'node_modules', 'electron-prebuilt', 
	'dist', 'Electron.app', 'Contents', 'info.plist'
);

fs.readFile(infoPlistPath, 'utf8', (err, data) => {
	if (err) return err;
	const file = data.replace(/>Electron</g, ">Window<");
	fs.writeFile(infoPlistPath, file, err => {
		if (err) return err;
	});
});
