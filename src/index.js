'use strict';

const app = require('app');
const path = require('path');
const Renderer = require('browser-window');
const Menu = require('menu');
const fs = require('fs');

const configName = '.nsgrc';
app.config = path.join(process.cwd(), configName);

const menuTemplate = [
	{
		label: 'Window',
		submenu: [
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click: function(item, focusedWindow) {
					if (focusedWindow)
						focusedWindow.reload();
				}
			},
			{
				type: 'separator'
			},
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

app.renderer = null;

app.on('ready', function(evt) {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);

	fs.readFile(app.config, 'utf8', function(err, data) {
		let configData = {};
		if (!err) {
			try {
				configData = JSON.parse(data);
			}
			catch (e) {
				configData = {};
				console.error('ERROR with ' + configName + ' parse: ', e);
			}
		}
		
		const alwaysOnTop = configData.alwaysOnTop === true;

		app.renderer = new Renderer({
			width: 520,
			height: 275,
			'title-bar-style': 'hidden-inset',
			fullscreen: false,
			resizable: false,
			alwaysOnTop
		});

		app.renderer.on('closed', () => {
			app.renderer = null;
			console.log('NSG exited');
			app.exit(0);
		});

		app.renderer.loadURL(path.join('file://',  __dirname, 'index.html'));
		// app.renderer.toggleDevTools(); // uncomment to view dev tools in renderer
	});

	
});
