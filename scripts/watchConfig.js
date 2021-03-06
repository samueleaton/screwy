'use strict';

var _electron = require('electron');

var chokidar = require('chokidar');

var logger = function logger(msg) {
	return _electron.ipcRenderer.send('log', msg);
};
var regexMap = require('./regexCommandMap');

var taskFunctionMap = {
	'start': function start(cmdName) {
		window.store.emit('COMMAND_START', cmdName);
	},
	'restart': function restart(cmdName) {
		window.store.emit('COMMAND_RESTART', cmdName);
	},
	'kill': function kill(cmdName) {
		window.store.emit('COMMAND_KILL', cmdName);
	}
};

function invalidCommandMsg(x) {
	return 'ERROR: Invalid command ' + x + ' in \'watch\' in .nsgrc file';
}

function getTask(command) {

	return Object.keys(regexMap).find(function (task) {
		return regexMap[task].test(command);
	});
}

function createCmdWatcher(keyPattern, valuePattern) {
	// default task is 'START' // check for blank spaces
	if (/ /g.test(valuePattern) === false) valuePattern = 'START ' + valuePattern;

	var keyNpmScript = keyPattern.replace(/^CMD /, '');
	var valueTask = getTask(valuePattern);

	if (!valueTask || !taskFunctionMap[valueTask]) return logger(invalidCommandMsg(valuePattern));

	var func = taskFunctionMap[valueTask];
	var valueNpmScript = valuePattern.slice(valueTask.length).trim();

	window.store.on('COMMAND_END', function (cmdName) {
		if (window.store.state.windowClosing) return;
		if (cmdName === keyNpmScript) taskFunctionMap[valueTask](valueNpmScript);
	});
}

function createFileWatcher(pattern, command) {
	// default task is 'START' // check for blank spaces
	if (/ /g.test(command) === false) command = 'START ' + command;

	var task = getTask(command);

	if (!task || !taskFunctionMap[task]) return logger(invalidCommandMsg(command));

	var fileWatcher = chokidar.watch(pattern);
	var func = taskFunctionMap[task];
	var npmScript = command.slice(task.length).trim();

	fileWatcher.on('change', function (path) {
		return func(npmScript);
	});
}

function parseWatchObject(watchObj) {
	if (!watchObj) return;
	Object.keys(watchObj).forEach(function (pattern) {
		if (/^CMD ([\d\w-])+$/i.test(pattern)) createCmdWatcher(pattern.trim(), watchObj[pattern].trim());else createFileWatcher(pattern.trim(), watchObj[pattern].trim());
	});
}

module.exports = parseWatchObject;