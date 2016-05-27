'use strict';

var _child_process = require('child_process');

var _psTree = require('ps-tree');

var _psTree2 = _interopRequireDefault(_psTree);

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = function logger(msg) {
	return _electron.ipcRenderer.send('log', msg);
};

var queue = {};

function terminate(pid, cb) {
	(0, _psTree2.default)(pid, function (err, children) {
		(0, _child_process.spawn)('kill', ['-9'].concat(children.map(function (p) {
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

	queue[obj.id] = (0, _child_process.spawn)('npm', opts, {
		cwd: process.cwd(),
		stdio: [0, 1, 2]
	});
	return queue[obj.id];
}

function run(cmdName, isSilent) {
	var args = isSilent ? ['run', '-s', cmdName] : ['run', cmdName];
	queue[cmdName] = (0, _child_process.spawn)('npm', args, {
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

window.killApp = function () {
	window.store.modifyState(function (state) {
		state.windowClosing = true;
	});
	killAll();
};