'use strict';

window.watchConfig = function () {
	var chokidar = require('chokidar');
	var logger = require.local('scripts', 'terminalLogger');
	var regexMap = require.local('scripts', 'regexCommandMap');

	var taskFunctionMap = {
		'start': buttonTrigger,
		'restart': buttonRestarter,
		'kill': buttonKiller
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

		watcher.on('change', function (path) {
			return func(npmScript);
		});
	}

	function parseWatchObject(watchObj) {
		Object.keys(watchObj).forEach(function (pattern) {
			createWatcher(pattern.trim(), watchObj[pattern].trim());
		});
	}
	return parseWatchObject;
}();