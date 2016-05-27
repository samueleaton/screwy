'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _regexCommandMap = require('./scripts/regexCommandMap');

var _regexCommandMap2 = _interopRequireDefault(_regexCommandMap);

var _events = require('events');

var _child_process = require('child_process');

var _terminalLogger = require('./scripts/terminalLogger');

var _terminalLogger2 = _interopRequireDefault(_terminalLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV !== 'development') process.env.NODE_ENV = 'production';

var app = _electron2.default.app;


var globalShortcut = _electron2.default.globalShortcut;
var ipcMain = _electron2.default.ipcMain;

(0, _terminalLogger2.default)('this is test 1');
var configName = '.screwyrc';

var renderer = null;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Menu Bar
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var menuTemplate = [{
	label: 'Window',
	submenu: [
	// {
	// 	label: 'Npm Package Installer',
	// 	accelerator: 'Cmd+i',
	// 	click() {
	// 		renderer.webContents.executeJavaScript('npmInstaller.toggle();');
	// 	}
	// },
	// {
	// 	type: 'separator'
	// },
	{
		label: 'Minimize',
		accelerator: 'CmdOrCtrl+M',
		role: 'minimize'
	}, {
		label: 'Quit',
		accelerator: 'Cmd+Q',
		click: function click() {
			renderer.close();
		}
	}]
}];

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Events
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.on('error', function (msg) {
	console.error('\n' + require('chalk').red(msg));
	app.error = true;
	app.quit();
	process.exit(1);
});

process.on('uncaughtException', function (err) {
	console.log('exception');
	app.emit('error', err);
	app.error = true;
	app.quit();
});

ipcMain.on('error', function (evt, msg) {
	renderer.close();
});

ipcMain.on('log', function (evt, msg) {
	console.log('got event ' + evt + ' with msg: ', msg);
	(0, _terminalLogger2.default)(msg);
});

app.on('ready', function (evt) {
	var menu = _electron.Menu.buildFromTemplate(menuTemplate);
	_electron.Menu.setApplicationMenu(menu);

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Configurations
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	app.configPath = _path2.default.join(process.cwd(), configName);

	_fs2.default.readFile(app.configPath, 'utf8', function (err, configData) {
		var configObj = {};

		if (!err) // if .screwyrc exists
			configObj = parseJson(configData);

		var alwaysOnTop = configObj.alwaysOnTop === true;

		renderer = new _electron.BrowserWindow({
			width: 520,
			minWidth: 520,
			height: 275,
			minHeight: 275,
			// frame: false,
			titleBarStyle: 'hidden',
			alwaysOnTop: alwaysOnTop
		});

		renderer.on('closed', function () {
			renderer = null;
			console.log('Screwy exited');
			globalShortcut.unregisterAll();
			app.exit(0);
		});

		renderer.on('close', function (evt) {
			renderer.webContents.executeJavaScript('window.killApp();');
		});

		// Hotkeys
		if (_typeof(configObj.hotkeys) === 'object') configureHotkeys(parsePlatformHotkeys(configObj.hotkeys));

		// Init Renderer
		if (!app.error) {
			renderer.loadURL(_path2.default.join('file://', __dirname, 'index.html'));
			// if (process.env.NODE_ENV === 'development')
			renderer.toggleDevTools();
		}
	});
});

function parseJson(jsonString) {
	var jsonObj = void 0;
	try {
		jsonObj = JSON.parse(jsonString);
	} catch (e) {
		jsonObj = {};
		app.emit('error', 'ERROR with ' + configName + ' parse (Invalid JSON): ' + e);
	}
	return jsonObj;
}

function parsePlatformHotkeys(hotkeysObj) {
	var platform = process.platform;
	if (platform === 'darwin') return parseDarwinHotkeys(hotkeysObj);else if (platform === 'linux') return parseLinuxHotkeys(hotkeysObj);else return {};
}

function parseDarwinHotkeys(hotkeysObj) {
	var platformHotkeys = {};
	Object.keys(hotkeysObj).forEach(function (key) {
		if (/^(windows|linux)$/i.test(key.trim())) return;else if (/^(osx|darwin)$/i.test(key.trim())) {
			Object.keys(hotkeysObj[key]).forEach(function (k) {
				platformHotkeys[k] = hotkeysObj[key][k];
			});
		} else if (!platformHotkeys[key]) platformHotkeys[key] = hotkeysObj[key];
	});
	return platformHotkeys;
}

function parseLinuxHotkeys(hotkeysObj) {
	var platformHotkeys = {};
	Object.keys(hotkeysObj).forEach(function (key) {
		if (/^(windows|osx|darwin)$/i.test(key.trim())) return;else if (/^linux$/i.test(key.trim())) {
			Object.keys(hotkeysObj[key]).forEach(function (k) {
				platformHotkeys[k] = hotkeysObj[key][k];
			});
		} else if (!platformHotkeys[key]) platformHotkeys[key] = hotkeysObj[key];
	});
	return platformHotkeys;
}

function configureHotkeys(hotkeysObj) {
	Object.keys(hotkeysObj).forEach(function (keyCombo) {
		var cmd = hotkeysObj[keyCombo];

		// command defaults to START if none specified
		if (!/ /g.test(cmd)) cmd = 'START ' + cmd;

		var npmCommand = '';
		var event = '';

		if (_regexCommandMap2.default.start.test(cmd)) {
			npmCommand = cmd.slice(5).trim();
			event = 'COMMAND_START';
		} else if (_regexCommandMap2.default.kill.test(cmd)) {
			npmCommand = cmd.slice(4).trim();
			event = 'COMMAND_KILL';
		} else if (_regexCommandMap2.default.restart.test(cmd)) {
			npmCommand = cmd.slice(7).trim();
			event = 'COMMAND_RESTART';
		}

		try {
			globalShortcut.register(keyCombo, function () {
				renderer.webContents.executeJavaScript('store.emit(\'' + event + '\', \'' + npmCommand + '\');');
			});
		} catch (e) {
			app.emit('error', 'Error registering hotkeys "' + keyCombo + '"');
		}
	});
}

setTimeout(function () {
	(0, _terminalLogger2.default)('this is test 2');
}, 5000);

