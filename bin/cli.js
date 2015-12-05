#!/usr/bin/env node
'use strict';

var electron = require('electron-prebuilt');
var proc = require('child_process');
var path = require('path');

var indexJsPath = path.normalize(__dirname + '/../index.js');
// // spawn electron
var child = proc.spawn(electron, [indexJsPath], { stdio: 'inherit' });
child.on('close', function (code) {
  process.exit(code);
});

