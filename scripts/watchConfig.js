'use strict';

var chokidar = require('chokidar');
var logger = require('./terminalLogger');
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

function createWatcher(pattern, command) {
	// default task is 'START'
	if (/ /g.test(command) === false) command = 'START ' + command;

	var task = getTask(command);

	if (!task || !taskFunctionMap[task]) return logger(invalidCommandMsg(command));

	var watcher = chokidar.watch(pattern);
	var func = taskFunctionMap[task];
	var npmScript = command.slice(task.length).trim();

	console.log('func: ', func);
	console.log('npmScript: ', npmScript);
	watcher.on('change', function (path) {
		return func(npmScript);
	});
}

function parseWatchObject(watchObj) {
	Object.keys(watchObj).forEach(function (pattern) {
		createWatcher(pattern.trim(), watchObj[pattern].trim());
	});
}

module.exports = parseWatchObject;