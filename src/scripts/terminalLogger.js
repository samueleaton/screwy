'use strict';

import { spawn } from 'child_process';

module.exports = function (message) {
  const logSpawn = spawn('echo', [message], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  logSpawn.on('exit', function(error) {
    logSpawn.kill();
  });
};
