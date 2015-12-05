'use strict'

// process.on('uncaughtException', function(e) {
// 	logger(e);
// });
;
const path = require('path');
const fs = require('fs');

const scriptsDir = path.join(__dirname, 'scripts');
const remote = require('remote');
const app = remote.require('app');
const renderer = app.renderer;

const dom = require(path.join(scriptsDir, 'dom'));
const childProcess = require('child_process');
const spawn = childProcess.spawn;
const fang = require('fangs');

const projPath = process.cwd();
const packageJsonPath = path.join(projPath, 'package.json');
const primaryScriptsCont = dom('primaryScripts');
const secondaryScriptsCont = dom('secondaryScripts');
let primaryCommands = {};
let excludedCommands = {};

const processQueue = require(path.join(scriptsDir, 'processQueue'));

fang(next => {
	fs.readFile(app.config, 'utf8', (err, data) => {
		if (err) {
			logger('no .nsgrc found');
			return next();
		}

		let jsonData;
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			jsonData = {};
		}

		// set title
		if (jsonData.name) dom('title').text(jsonData.name).addClass('hasTitle');

		// get primary commands from the .rc file
		if (Array.isArray(jsonData.primary)) {
			jsonData.primary.forEach(cmd => {
				primaryCommands[cmd] = true;
			});
		}

		// get commands to exclude from the .rc file
		if (Array.isArray(jsonData.exclude)) {
			jsonData.exclude.forEach(cmd => {
				excludedCommands[cmd] = true;
			});
		}

		return next();
	});
}, next => {
	fs.readFile(packageJsonPath, 'utf8', (err, data) => {
		if (err) {
			logger('(package.json error) ' + err);
			renderer.close();
		}

		let jsonData;
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			logger(err);
			renderer.close();
		}

		// set title if not already set
		if (!dom('title').hasClass('hasTitle')) dom('title').text(jsonData.name).addClass('hasTitle');;

		Object.keys(jsonData.scripts).forEach(cmdName => {
			// if this command is to be excluded, do nothing
			if (excludedCommands[cmdName]) return;

			let btn = dom.create('button').text(cmdName).attr('data-cmd', cmdName);

			// add the btn `click` handler	
			btn.listen('click', e => {
				if (btn.classList.contains('in-progress')) return;
				runCommand(btn, btn.dataset.cmd);
			});

			// does button have primary or secondary status
			if (primaryCommands[cmdName]) primaryScriptsCont.appendChild(btn);else secondaryScriptsCont.appendChild(btn);
		});

		// if no primary commands are found, remove the container
		if (Object.keys(primaryCommands).length === 0) dom.remove(primaryScriptsCont);
	});
})();

function logger(message) {
	const logSpawn = spawn('echo', [message], {
		cwd: projPath,
		stdio: 'inherit'
	});

	logSpawn.on('exit', function (error) {
		logSpawn.kill();
	});
}

function runCommand(btn, cmdName) {
	btn.classList.add('in-progress');
	logger('\n[Running "' + cmdName + '" command...]\n');

	const spinnerImg = dom.create('img').addClass('in-progress').attr('src', 'images/loader.png');

	btn.append(spinnerImg);

	const cmd = processQueue.run(cmdName);

	cmd.on('exit', function () {
		btn.classList.remove('in-progress');
		logger('\n["' + cmdName + '" command ended]\n');
		dom.remove(spinnerImg);
		processQueue.kill(cmdName);
	});
}

renderer.on('close', evt => {
	processQueue.killAll();
});