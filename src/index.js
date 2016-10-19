'use strict';

import electron, { BrowserWindow, Menu, ipcMain, globalShortcut } from 'electron';
const app = electron.app;
import path from 'path';
import fs from 'fs';
import regexMap from './scripts/regexCommandMap';

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import terminalLogger from './scripts/terminalLogger';
import processQueue from './scripts/processQueue';
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
	app.emit('error', err);
	app.error = true;
	processQueue && processQueue.killAll();
	app.quit();
});

app.on('before-quit', () => console.log('Screwy Quitting...'));

app.on('quit', evt => {
	processQueue.killAll();
});

ipcMain.on('log', (evt, msg) => {
  terminalLogger(msg);
});

ipcMain.on('run', (evt, cmdObj) => {
  const cmdProcess = processQueue.run(cmdObj.cmdName, cmdObj.isSilent);
  cmdProcess.on('exit', (code, signal) => {
    evt.sender.send('killed', cmdObj.cmdName);
  });
});

ipcMain.on('kill', (evt, cmdObj) => {
  processQueue.kill(cmdObj.cmdName);
});

ipcMain.on('restart', (evt, cmdObj) => {
  process.nextTick(() => {
    processQueue.kill(cmdObj.cmdName, () => {
      setTimeout(() => {
        evt.sender.send('can-restart', cmdObj.cmdName);
      }, 250);
    });
  });
});


ipcMain.on('error', (evt, msg) => {
	renderer.close();
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
			title: 'screwy',
			width: 480,
			minWidth: 250,
			height: 270,
			minHeight: 180,
			titleBarStyle: 'hidden-inset',
			alwaysOnTop
		});


		// Hotkeys
		if (typeof configObj.hotkeys === 'object')
			configureHotkeys(parsePlatformHotkeys(configObj.hotkeys));

		// Init Renderer
		if (!app.error) {
			renderer.loadURL(path.join('file://',  __dirname, 'index.html'));
			if (process.env.NODE_ENV === 'development')
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
