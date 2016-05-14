'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _terminalLogger = require('./terminalLogger');

var _terminalLogger2 = _interopRequireDefault(_terminalLogger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _remote = require('remote');

var _remote2 = _interopRequireDefault(_remote);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var packageJsonPath = _path2.default.join(process.cwd(), 'package.json');
var ipcRenderer = _electron2.default.ipcRenderer;

function parsePackageJson(configObj, cb) {
	_fs2.default.readFile(packageJsonPath, 'utf8', function (err, data) {
		if (err) {
			(0, _terminalLogger2.default)('(package.json error) ' + err);
			ipcRenderer.send('error');
		}

		var jsonData = void 0;
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			(0, _terminalLogger2.default)(err);
			ipcRenderer.send('error');
		}

		// set title if not already set
		if (!configObj.name) configObj.name = jsonData.name;

		if (!jsonData.scripts) (0, _terminalLogger2.default)('\nNo scripts found in package.json\n');

		configObj.scripts = jsonData.scripts;

		_lodash2.default.keys(configObj.scripts).forEach(function (key) {
			if (!_lodash2.default.includes(configObj.primaryScripts, key) && !_lodash2.default.includes(configObj.excludeScripts, key)) {
				configObj.secondaryScripts.push(key);
			}
		});

		cb(configObj);
	});
}

module.exports = parsePackageJson;