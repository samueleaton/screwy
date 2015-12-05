'use strict';

var childProcess = require('child_process');
var spawn = childProcess.spawn;

var queue = {};

function killAll() {
	Object.keys(queue).forEach(function (c) {
		kill(c);
	});
	console.log('killed all!');
};

function kill(cmdName) {
	if (queue[cmdName] && typeof queue[cmdName].kill === 'function') queue[cmdName].kill();
};

function run(cmdName) {
	queue[cmdName] = spawn('npm', ['run', cmdName], {
		cwd: projPath,
		stdio: [0, 1, 2]
	});
	console.log('running ' + cmdName);
	return queue[cmdName];
};

module.exports = {
	kill: kill,
	killAll: killAll,
	run: run
};