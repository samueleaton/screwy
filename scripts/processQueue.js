'use strict';

var spawn = require('child_process').spawn;
var psTree = require('ps-tree');
require.local = function () {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	args.unshift(__dirname);
	return require(require('path').join.apply(null, args));
};
var logger = require.local('terminalLogger');

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
	} else if (typeof cb === 'function') cb();
}

function install(obj) {
	var opts = ['install'];

	if (obj.package.length) opts.push(obj.package);
	if (obj.depType) opts.push(obj.depType);

	queue[obj.id] = spawn('npm', opts, {
		cwd: process.cwd(),
		stdio: [0, 1, 2]
	});
	return queue[obj.id];
}

function run(cmdName) {
	queue[cmdName] = spawn('npm', ['run', cmdName], {
		cwd: process.cwd(),
		stdio: [0, 1, 2]
	});
	return queue[cmdName];
}

module.exports = {
	kill: kill,
	killAll: killAll,
	run: run,
	install: install
};