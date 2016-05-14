'use strict';
if (process.env.NODE_ENV !== 'development')
	process.env.NODE_ENV = 'production';

const electron = require('electron');
const app = electron.app;
const path = require('path');
const Renderer = require('browser-window');
const Menu = require('menu');
const fs = require('fs');
const regexMap = require('./scripts/regexCommandMap');
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;
const EventEmitter = require('events').EventEmitter;
const exec = require('child_process').exec;
app.renderer = null;

const configName = '.screwyrc';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Menu Bar
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const menuTemplate = [
	{
		label: 'Window',
		submenu: [
			// {
			// 	label: 'Npm Package Installer',
			// 	accelerator: 'Cmd+i',
			// 	click() {
			// 		app.renderer.webContents.executeJavaScript('npmInstaller.toggle();');
			// 	}
			// },
			// {
			// 	type: 'separator'
			// },
			{
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				label: 'Quit',
				accelerator: 'Cmd+Q',
				click() {
					app.renderer.close();
				}
			}
		]
	}
];

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Events
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.on('error', msg => {
	console.error(
		'\n' + require('chalk').red(msg)
	);
	app.error = true;
	app.quit();
	process.exit(1);
});

process.on('uncaughtException', err => {
	console.log('exception');
	app.emit('error', err);
	app.error = true;
	app.quit();
});


ipcMain.on('error', (evt, msg) => {
	app.renderer.close();
});

app.on('ready', function(evt) {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Configurations
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	app.configPath = path.join(process.cwd(), configName);

	fs.readFile(app.configPath, 'utf8', function(err, configData) {
		let configObj = {};

		if (!err) // if .screwyrc exists
			configObj = parseJson(configData);
		
		const alwaysOnTop = configObj.alwaysOnTop === true;

		app.renderer = new Renderer({
			width: 520,
			minWidth: 520,
			height: 275,
			minHeight: 275,
			'title-bar-style': 'hidden-inset',
			fullscreen: false,
			alwaysOnTop
		});

		app.renderer.on('closed', () => {
			app.renderer = null;
			console.log('Screwy exited');
			globalShortcut.unregisterAll();
			app.exit(0);
		});

		app.renderer.on('close', evt => {
			app.renderer.webContents.executeJavaScript('window.killApp();');
		});

		// Hotkeys
		if (typeof configObj.hotkeys === 'object')
			configureHotkeys(parsePlatformHotkeys(configObj.hotkeys));

		// Init Renderer
		if (!app.error) {
			app.renderer.loadURL(path.join('file://',  __dirname, 'index.html'));
			if (process.env.NODE_ENV === 'development')
				app.renderer.toggleDevTools(); // uncomment to view dev tools in renderer
		}
	});
});

function parseJson(jsonString) {
	let jsonObj;
	try {
		jsonObj = JSON.parse(jsonString);
	}
	catch (e) {
		jsonObj = {};
		app.emit('error', 'ERROR with ' + configName + ' parse (Invalid JSON): ' + e);
	}
	return jsonObj;
}

function parsePlatformHotkeys(hotkeysObj) {
	const platform = process.platform;
	if (platform === 'darwin')
		return parseDarwinHotkeys(hotkeysObj);
	else if (platform === 'linux')
		return parseLinuxHotkeys(hotkeysObj);
	else
		return {};
}

function parseDarwinHotkeys(hotkeysObj) {
	const platformHotkeys = {};
	Object.keys(hotkeysObj).forEach(key => {
		if (/^(windows|linux)$/i.test(key.trim()))
			return;
		else if (/^(osx|darwin)$/i.test(key.trim())) {
			Object.keys(hotkeysObj[key]).forEach(k => {
				platformHotkeys[k] = hotkeysObj[key][k]
			});
		}
		else if (!platformHotkeys[key])
			platformHotkeys[key] = hotkeysObj[key];
	});
	return platformHotkeys;
}

function parseLinuxHotkeys(hotkeysObj) {
	const platformHotkeys = {};
	Object.keys(hotkeysObj).forEach(key => {
		if (/^(windows|osx|darwin)$/i.test(key.trim()))
			return;
		else if (/^linux$/i.test(key.trim())) {
			Object.keys(hotkeysObj[key]).forEach(k => {
				platformHotkeys[k] = hotkeysObj[key][k]
			});
		}
		else if (!platformHotkeys[key])
			platformHotkeys[key] = hotkeysObj[key];
	});
	return platformHotkeys;
}

function configureHotkeys(hotkeysObj) {
	Object.keys(hotkeysObj).forEach(keyCombo => {
		let cmd = hotkeysObj[keyCombo];

		// command defaults to START if none specified
		if (!(/ /g).test(cmd))
			cmd = 'START ' + cmd;

		let npmCommand = '';
		let event = '';
		
		if (regexMap.start.test(cmd)) {
			npmCommand = cmd.slice(5).trim();
			event = 'COMMAND_START';
		}
		else if (regexMap.kill.test(cmd)) {
			npmCommand = cmd.slice(4).trim();
			event = 'COMMAND_KILL';
		}
		else if (regexMap.restart.test(cmd)) {
			npmCommand = cmd.slice(7).trim();
			event = 'COMMAND_RESTART';
		}

		try {
			globalShortcut.register(keyCombo, () => {
				app.renderer.webContents.executeJavaScript(`store.emit('${event}', '${npmCommand}');`);
			});
		}
		catch (e) {
			app.emit('error', 'Error registering hotkeys "' + keyCombo + '"');
		}
	});
}
