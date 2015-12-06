'use strict';
const fs = require('fs');
const path = require('path');

// == Info.plist ==
const infoPlistPath = path.join(
	__dirname, 'node_modules', 'electron-prebuilt', 
	'dist', 'Electron.app', 'Contents', 'info.plist'
);

fs.readFile(infoPlistPath, 'utf8', (err, data) => {
	if (err) return err;
	const file = data.replace(/<key>CFBundleName<\/key>(\s)*<string>Electron<\/string>/g, "<key>CFBundleName</key>\n\t<string>Window</string>");
	fs.writeFile(infoPlistPath, file, err => {
		if (err) return err;
	});
});

// == icns ==
const icnsPath = path.join(
  __dirname, 'node_modules', 'electron-prebuilt', 
  'dist', 'Electron.app', 'Contents', 'Resources', 'atom.icns'
);

fs.readFile('images/n.icns', (err, data) => {
  if (err) return err;
  fs.writeFile(icnsPath, data, err => {
    if (err) return err;
  });
});
