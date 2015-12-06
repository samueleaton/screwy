'use strict';

var path = require('path');
var fs = require('fs');

var scriptsDir = path.join(__dirname, 'scripts');
var remote = require('remote');
var app = remote.require('app');
var renderer = app.renderer;

var dom = require(path.join(scriptsDir, 'dom'));
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fang = require('fangs');

var projPath = process.cwd();
var packageJsonPath = path.join(projPath, 'package.json');
var primaryScriptsCont = dom('primaryScripts');
var secondaryScriptsCont = dom('secondaryScripts');
var primaryCommands = {};
var excludedCommands = {};

var processQueue = require(path.join(scriptsDir, 'processQueue'));

fang(function (next) {
	fs.readFile(app.config, 'utf8', function (err, data) {
		if (err) {
			logger('no .nsgrc found');
			return next();
		}

		var jsonData = undefined;
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			jsonData = {};
		}

		// set title
		if (jsonData.name) dom('title').text(jsonData.name).addClass('hasTitle');

		// get primary commands from the .nsgrc file
		if (Array.isArray(jsonData.primary)) {
			jsonData.primary.forEach(function (cmd) {
				primaryCommands[cmd] = true;
			});
		}

		// get commands to exclude from the .nsgrc file
		if (Array.isArray(jsonData.exclude)) {
			jsonData.exclude.forEach(function (cmd) {
				excludedCommands[cmd] = true;
			});
		}

		// get font-stack from the .nsgrc file
		if (Array.isArray(jsonData['font-stack'])) {
			var customCSS = "body { font-family: ";
			jsonData['font-stack'].forEach(function (font) {
				customCSS += "'" + font + "', ";
			});
			customCSS = customCSS.slice(0, -2) + ';}';

			dom('user-styles').text(customCSS);
		}

		return next();
	});
}, function (next) {
	fs.readFile(packageJsonPath, 'utf8', function (err, data) {
		if (err) {
			logger('(package.json error) ' + err);
			renderer.close();
		}

		var jsonData = undefined;
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			logger(err);
			renderer.close();
		}

		// set title if not already set
		if (!dom('title').hasClass('hasTitle')) dom('title').text(jsonData.name).addClass('hasTitle');;

		Object.keys(jsonData.scripts).forEach(function (cmdName) {
			// if this command is to be excluded, do nothing
			if (excludedCommands[cmdName]) return;

			var btn = dom.create('button').text(cmdName).attr('data-cmd', cmdName);

			// add the btn `click` handler	
			btn.listen('click', function (e) {
				if (btn.classList.contains('in-progress')) return;
				runCommand(btn, btn.dataset.cmd);
			});

			btn.listen('dblclick', function (e) {
				if (btn.classList.contains('in-progress')) processQueue.kill(btn.dataset.cmd);
			});

			// does button have primary or secondary status
			if (primaryCommands[cmdName]) primaryScriptsCont.appendChild(btn);else secondaryScriptsCont.appendChild(btn);
		});

		// if no primary commands are found, remove the container
		if (Object.keys(primaryCommands).length === 0) dom.remove(primaryScriptsCont);
	});
})();

function logger(message) {
	var logSpawn = spawn('echo', [message], {
		cwd: projPath,
		stdio: 'inherit'
	});

	logSpawn.on('exit', function (error) {
		logSpawn.kill();
	});
}

process.on('uncaughtException', function (e) {
	logger(e);
});

function runCommand(btn, cmdName) {
	btn.classList.add('in-progress');
	logger('\n[Running "' + cmdName + '" command...]\n');

	var spinnerImg = dom.create('img').addClass('in-progress').attr('src', 'images/loader.png');

	btn.append(spinnerImg);

	var cmd = processQueue.run(cmdName);

	cmd.on('exit', function () {
		btn.classList.remove('in-progress');
		logger('\n["' + cmdName + '" command ended]\n');
		dom.remove(spinnerImg);
		processQueue.kill(cmdName);
	});
}

renderer.on('close', function (evt) {
	processQueue.killAll();
});