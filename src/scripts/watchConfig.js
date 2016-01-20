'use strict';

window.watchConfig = (function() {
	const chokidar = require('chokidar');
	const logger = require.local('scripts', 'terminalLogger');
	const regexMap = require.local('scripts', 'regexCommandMap');

	const taskFunctionMap = {
		'start': buttonTrigger,
		'restart': buttonRestarter,
		'kill': buttonKiller
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
		Object.keys(watchObj).forEach(pattern => {
			createWatcher(pattern.trim(), watchObj[pattern].trim())
		});
	}
	return parseWatchObject;
})();
