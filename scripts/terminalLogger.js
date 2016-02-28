'use strict';

var _child_process = require('child_process');

module.exports = function (message) {
  var logSpawn = (0, _child_process.spawn)('echo', [message], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  logSpawn.on('exit', function (error) {
    logSpawn.kill();
  });
};