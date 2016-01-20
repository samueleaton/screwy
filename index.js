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

app.canQuit = false;

ipcMain.on('can-quit', function () {
	app.canQuit = true;
	app.renderer.close();
});

ipcMain.on('error', function (evt, msg) {
	app.canQuit = true;
	app.renderer.close();
});

var configName = '.nsgrc';
app.config = path.join(process.cwd(), configName);

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

app.renderer = null;

app.on('ready', function (evt) {
	var menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);

	fs.readFile(app.config, 'utf8', function (err, data) {
		var configData = {};
		if (!err) {
			try {
				configData = JSON.parse(data);
			} catch (e) {
				configData = {};
				console.error('ERROR with ' + configName + ' parse: ', e);
			}
		}

		var alwaysOnTop = configData.alwaysOnTop === true;

		app.renderer = new Renderer({
			width: 520,
			maxWidth: 520,
			minWidth: 520,
			height: 275,
			minHeight: 275,
			maxHeight: 400,
			'title-bar-style': 'hidden-inset',
			fullscreen: false,
			// resizable: false,
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

		if (_typeof(configData.hotkeys) === 'object') {

			Object.keys(configData.hotkeys).forEach(function (cmd) {
				var hotkey = configData.hotkeys[cmd];

				// defaults to START if none specified
				if (!/ /g.test(cmd)) cmd = 'START ' + cmd;

				var command = '';
				var func = '';

				if (regexMap.start.test(cmd)) {
					command = cmd.slice(5).trim();
					func = 'buttonTrigger';
				}
				if (regexMap.kill.test(cmd)) {
					command = cmd.slice(4).trim();
					func = 'buttonKiller';
				} else if (regexMap.restart.test(cmd)) {
					command = cmd.slice(7).trim();
					func = 'buttonRestarter';
				}

				globalShortcut.register(hotkey, function () {
					app.renderer.webContents.executeJavaScript(func + '("' + command + '");');
				});
			});
		}

		app.renderer.loadURL(path.join('file://', __dirname, 'index.html'));
		// app.renderer.toggleDevTools(); // uncomment to view dev tools in renderer
	});
});

app.on('before-quit', function (evt) {
	if (app.canQuit) return;
	evt.preventDefault();
});

