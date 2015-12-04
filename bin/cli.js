#!/usr/bin/env node
'use strict';
const electron = require('electron-prebuilt')
const proc = require('child_process')
const path = require('path');

const indexJsPath = path.normalize(__dirname + '/../index.js');
// // spawn electron
const child = proc.spawn(electron, [indexJsPath], {stdio: 'inherit'});
child.on('close', function (code) {
  process.exit(code)
});
