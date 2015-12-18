'use strict';

var spawn = require('child_process').spawn;

module.exports = function (message) {
  var logSpawn = spawn('echo', [message], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  logSpawn.on('exit', function (error) {
    logSpawn.kill();
  });
};