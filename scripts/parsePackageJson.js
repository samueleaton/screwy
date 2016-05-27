'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = function logger(msg) {
	return _electron.ipcRenderer.send('log', msg);
};

var packageJsonPath = _path2.default.join(process.cwd(), 'package.json');

function parsePackageJson(configObj, cb) {
	_fs2.default.readFile(packageJsonPath, 'utf8', function (err, data) {
		if (err) {
			logger('(package.json error) ' + err);
			_electron.ipcRenderer.send('error');
		}

		var jsonData = void 0;
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			logger(err);
			_electron.ipcRenderer.send('error');
		}

		// set title if not already set
		if (!configObj.name) configObj.name = jsonData.name;

		if (!jsonData.scripts) logger('\nNo scripts found in package.json\n');

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