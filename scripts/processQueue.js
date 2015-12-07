'use strict';

var spawn = require('child_process').spawn;
var psTree = require('ps-tree');

var queue = {};

function terminate(pid, cb) {
	psTree(pid, function (err, children) {
		spawn('kill', ['-9'].concat(children.map(function (p) {
			return p.PID;
		})));
		if (typeof cb === 'function') return cb(err);
	});
}

function killAll(cb) {
	var cmds = Object.keys(queue);
	var total = cmds.length;
	var completedCount = 0;

	if (total === 0) return cb();

	cmds.forEach(function (cmd) {
		kill(cmd, function () {
			completedCount++;
			console.log('killed: ', cmd);
			if (completedCount === total) cb();
		});
	});
}

function kill(cmdName, cb) {
	if (queue[cmdName] && queue[cmdName].pid) {
		terminate(queue[cmdName].pid, function (err) {
			if (err) return alert('ERROR ' + err);
			if (typeof cb === 'function') cb();
		});
	}
}

function run(cmdName) {
	queue[cmdName] = spawn('npm', ['run', cmdName], {
		cwd: projPath,
		stdio: [0, 1, 2]
	});
	return queue[cmdName];
}

module.exports = {
	kill: kill,
	killAll: killAll,
	run: run
};