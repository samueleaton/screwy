const main = (function() {
	'use strict';

	const path = require('path');
	const fs = require('fs');

	const scriptsDir = path.join(__dirname, 'scripts');
	const remote = require('remote');
	const app = remote.require('app');
	const ipcRenderer = require('electron').ipcRenderer;

	const dom = require(path.join(scriptsDir, 'dom'));
	const fang = require('fangs');
	

	const projPath = process.cwd();
	const packageJsonPath = path.join(projPath, 'package.json');
	const primaryScriptsCont = dom('primaryScripts');
	const secondaryScriptsCont = dom('secondaryScripts');
	let primaryCommands = {};
	let excludedCommands = {};

	window.processQueue = require(path.join(scriptsDir, 'processQueue'));


	const logger = require(path.join(scriptsDir, 'terminalLogger'));

	fang(
		// read .nsgrc config file
		next => {
			fs.readFile(app.config, 'utf8', (err, data) => {
				if (err) {
					logger('no .nsgrc found');
					theme.set();
					return next();
				}

				let jsonData;
				try {
					jsonData = JSON.parse(data);
				}
				catch (e) {
					jsonData = {};
				}

				// set title
				if (jsonData.name) dom('title').text(jsonData.name).addClass('hasTitle');

				// get primary commands from the .nsgrc file
				if (Array.isArray(jsonData.primary)) {
					jsonData.primary.forEach(cmd => {
						primaryCommands[cmd] = true;
					});
				}

				// get commands to exclude from the .nsgrc file
				if (Array.isArray(jsonData.exclude)) {
					jsonData.exclude.forEach(cmd => {
						excludedCommands[cmd] = true;
					});
				}

				// get font-stack from the .nsgrc file
				if (Array.isArray(jsonData['font-stack'])) {
					let customCSS = "body { font-family: ";
					jsonData['font-stack'].forEach(font => {
						customCSS += "'" + font + "', "
					});
					customCSS = customCSS.slice(0, -2) + ';}';
					
					dom('user-styles').text(customCSS);
				}

				theme.set(jsonData.theme);

				return next();
			});
		},

		next => {
			// read package.json file
			fs.readFile(packageJsonPath, 'utf8', (err, data) => {
				if (err) {
					logger('(package.json error) ' + err);
					ipcRenderer.send('error');
				}

				let jsonData;
				try {
					jsonData = JSON.parse(data);
				}
				catch (e) {
					logger(err);
					ipcRenderer.send('error');
				}

				// set title if not already set
				if (!dom('title').hasClass('hasTitle'))
					dom('title').text(jsonData.name).addClass('hasTitle');;

				Object.keys(jsonData.scripts).forEach(cmdName => {
					// if this command is to be excluded, do nothing
					if (excludedCommands[cmdName]) return;

					let btn = dom.create('button').text(cmdName).attr('data-cmd', cmdName);

					// add the btn `click` handler	
					btn.listen('click', e => {
						if (btn.classList.contains('in-progress'))
							return;
						commandClick(btn);
					});

					btn.listen('dblclick', e => {
						if (btn.classList.contains('in-progress'))
							process.nextTick(
								() => processQueue.kill(btn.dataset.cmd)
							);
					});

					// does button have primary or normal status
					if (primaryCommands[cmdName])
						primaryScriptsCont.appendChild(btn.attr('data-primary', 'true'));
					else
						secondaryScriptsCont.appendChild(btn);
				});

				// if no primary commands are found, remove the container
				if (Object.keys(primaryCommands).length === 0)
					dom.remove(primaryScriptsCont);
			});
		}
	)();




	process.on('uncaughtException', function(e) {
		logger('NSG ERROR:');
		logger(e.stack);
	});




	return {
		quitApp() {
			processQueue.killAll(() => ipcRenderer.send('can-quit'));
		}
	};

})();
