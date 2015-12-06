'use strict';

var fs = require('fs');
var path = require('path');

// == Info.plist ==
var infoPlistPath = path.join(__dirname, 'node_modules', 'electron-prebuilt', 'dist', 'Electron.app', 'Contents', 'info.plist');

fs.readFile(infoPlistPath, 'utf8', function (err, data) {
  if (err) return err;
  var file = data.replace(/<key>CFBundleName<\/key>(\s)*<string>Electron<\/string>/, "<key>CFBundleName</key>\n\t<string>npm scripts</string>");
  fs.writeFile(infoPlistPath, file, function (err) {
    if (err) return err;
  });
});

// == icns ==
var icnsPath = path.join(__dirname, 'node_modules', 'electron-prebuilt', 'dist', 'Electron.app', 'Contents', 'Resources', 'atom.icns');

fs.readFile('images/n.icns', function (err, data) {
  if (err) return err;
  fs.writeFile(icnsPath, data, function (err) {
    if (err) return err;
  });
});

