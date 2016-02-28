'use strict';

const chokidar = require('chokidar');
const logger = require('./terminalLogger');
const regexMap = require('./regexCommandMap');

const taskFunctionMap = {
	'start': cmdName => {
		window.store.emit('COMMAND_START', cmdName);
	},
	'restart': cmdName => {
		window.store.emit('COMMAND_RESTART', cmdName);
	},
	'kill': cmdName => {
		window.store.emit('COMMAND_KILL', cmdName);
	}
}

function invalidCommandMsg(x) {
	return `ERROR: Invalid command ${x} in 'watch' in .nsgrc file`;
}

function getTask(command) {
	return Object.keys(regexMap).find(task => {
		return regexMap[task].test(command)
	});
}

function createWatcher(pattern, command) {
	// default task is 'START'
	if ((/ /g).test(command) === false) command = 'START ' + command;

	const task = getTask(command);

	if (!task || !taskFunctionMap[task])
		return logger(invalidCommandMsg(command));

	const watcher = chokidar.watch(pattern);
	const func = taskFunctionMap[task];
	const npmScript = command.slice(task.length).trim();
	
	watcher.on('change', path => func(npmScript));
}

function parseWatchObject(watchObj) {
	if (!watchObj) return;
	Object.keys(watchObj).forEach(pattern => {
		createWatcher(pattern.trim(), watchObj[pattern].trim())
	});
}

module.exports = parseWatchObject;
