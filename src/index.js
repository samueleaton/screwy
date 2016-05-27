'use strict';
if (process.env.NODE_ENV !== 'development')
	process.env.NODE_ENV = 'production';

import electron, { BrowserWindow, Menu } from 'electron';
const app = electron.app;
import path from 'path';
import fs from 'fs';
import regexMap from './scripts/regexCommandMap';

const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;
import { EventEmitter } from 'events';
import { exec } from 'child_process';
import terminalLogger from './scripts/terminalLogger';
terminalLogger('this is test 1');
const configName = '.screwyrc';

let renderer = null;

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
			},
			{
				label: 'Quit',
				accelerator: 'Cmd+Q',
				click() {
					renderer.close();
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
	renderer.close();
});

ipcMain.on('log', (evt, msg) => {
	console.log('got event ' + evt + ' with msg: ', msg);
	terminalLogger(msg);
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

		renderer = new BrowserWindow({
			width: 520,
			minWidth: 520,
			height: 275,
			minHeight: 275,
			// frame: false,
			titleBarStyle: 'hidden',
			alwaysOnTop
		});

		renderer.on('closed', () => {
			renderer = null;
			console.log('Screwy exited');
			globalShortcut.unregisterAll();
			app.exit(0);
		});

		renderer.on('close', evt => {
			renderer.webContents.executeJavaScript('window.killApp();');
		});

		// Hotkeys
		if (typeof configObj.hotkeys === 'object')
			configureHotkeys(parsePlatformHotkeys(configObj.hotkeys));

		// Init Renderer
		if (!app.error) {
			renderer.loadURL(path.join('file://',  __dirname, 'index.html'));
			// if (process.env.NODE_ENV === 'development')
			renderer.toggleDevTools(); 
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
				renderer.webContents.executeJavaScript(`store.emit('${event}', '${npmCommand}');`);
			});
		}
		catch (e) {
			app.emit('error', 'Error registering hotkeys "' + keyCombo + '"');
		}
	});
}

setTimeout(() => {
	terminalLogger('this is test 2');
}, 5000);
