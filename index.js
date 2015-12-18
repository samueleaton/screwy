'use strict';

var app = require('app');
var path = require('path');
var Renderer = require('browser-window');
var Menu = require('menu');
var fs = require('fs');

var ipcMain = require('electron').ipcMain;

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
			height: 275,
			'title-bar-style': 'hidden-inset',
			fullscreen: false,
			resizable: false,
			alwaysOnTop: alwaysOnTop
		});

		app.renderer.on('closed', function () {
			app.renderer = null;
			console.log('NSG exited');
			app.exit(0);
		});

		app.renderer.on('close', function (evt) {
			if (app.canQuit) return;
			evt.preventDefault();
			app.renderer.webContents.executeJavaScript('main.quitApp();');
		});

		app.renderer.loadURL(path.join('file://', __dirname, 'index.html'));
		app.renderer.toggleDevTools(); // uncomment to view dev tools in renderer
	});
});

app.on('before-quit', function (evt) {
	if (app.canQuit) return;
	evt.preventDefault();
});

