'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var electron = require('electron');
var app = electron.app;
var path = require('path');
var Renderer = require('browser-window');
var Menu = require('menu');
var fs = require('fs');
var regexMap = require('./scripts/regexCommandMap');
var globalShortcut = electron.globalShortcut;
var ipcMain = electron.ipcMain;
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
app.canQuit = true; // set to false once gui opens
app.renderer = null;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Menu Bar
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var menuTemplate = [{
	label: 'Window',
	submenu: [{
		label: 'Npm Package Installer',
		accelerator: 'Cmd+i',
		click: function click() {
			app.renderer.webContents.executeJavaScript('npmInstaller.toggle();');
		}
	}, {
		type: 'separator'
	}, {
		label: 'Minimize',
		accelerator: 'CmdOrCtrl+M',
		role: 'minimize'
	}, {
		label: 'Quit',
		accelerator: 'Cmd+Q',
		click: function click() {
			app.renderer.close();
		}
	}]
}];

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Events
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.on('error', function (msg) {
	console.error('\n' + require('chalk').red(msg));
	app.error = true;
	app.canQuit = true;
	app.quit();
	process.exit(1);
});

process.on('uncaughtException', function (err) {
	console.log('exception');
	app.emit('error', err);
	app.canQuit = true;
	app.error = true;
	app.quit();
});

ipcMain.on('can-quit', function () {
	app.canQuit = true;
	app.renderer.close();
});

ipcMain.on('error', function (evt, msg) {
	app.canQuit = true;
	app.renderer.close();
});

app.on('before-quit', function (evt) {
	if (app.canQuit) return;
	evt.preventDefault();
});

app.on('ready', function (evt) {
	var menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Configurations
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	var configName = '.nsgrc';
	app.config = path.join(process.cwd(), configName);

	fs.readFile(app.config, 'utf8', function (err, configData) {
		var configObj = {};

		if (!err) // if .nsgrc exists
			configObj = parseJson(configData);

		var alwaysOnTop = configObj.alwaysOnTop === true;

		app.renderer = new Renderer({
			width: 520,
			maxWidth: 520,
			minWidth: 520,
			height: 275,
			minHeight: 275,
			maxHeight: 400,
			'title-bar-style': 'hidden-inset',
			fullscreen: false,
			alwaysOnTop: alwaysOnTop
		});

		app.renderer.on('closed', function () {
			app.renderer = null;
			console.log('NSG exited');
			globalShortcut.unregisterAll();
			app.exit(0);
		});

		app.renderer.on('close', function (evt) {
			if (app.canQuit) return;
			evt.preventDefault();
			app.renderer.webContents.executeJavaScript('main.quitApp();');
		});

		// Hotkeys
		if (_typeof(configObj.hotkeys) === 'object') configureHotkeys(parsePlatformHotkeys(configObj.hotkeys));

		// Init Renderer
		if (!app.error) {
			app.renderer.loadURL(path.join('file://', __dirname, 'index.html'));
			app.canQuit = false;
			// app.renderer.toggleDevTools(); // uncomment to view dev tools in renderer
		}
	});
});

function parseJson(jsonString) {
	var jsonObj = undefined;
	try {
		jsonObj = JSON.parse(jsonString);
	} catch (e) {
		jsonObj = {};
		app.emit('error', 'ERROR with ' + configName + ' parse: ' + e);
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
		var func = '';

		if (regexMap.start.test(cmd)) {
			npmCommand = cmd.slice(5).trim();
			func = 'buttonTrigger';
		} else if (regexMap.kill.test(cmd)) {
			npmCommand = cmd.slice(4).trim();
			func = 'buttonKiller';
		} else if (regexMap.restart.test(cmd)) {
			npmCommand = cmd.slice(7).trim();
			func = 'buttonRestarter';
		}

		try {
			globalShortcut.register(keyCombo, function () {
				app.renderer.webContents.executeJavaScript(func + '("' + npmCommand + '");');
			});
		} catch (e) {
			app.emit('error', 'Error registering hotkeys "' + keyCombo + '"');
		}
	});
}

