'use strict';

var commandClick = (function () {
  var path = require('path');
  var EventEmitter = require('events').EventEmitter;

  require.local = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args.unshift(__dirname);
    return require(require('path').join.apply(null, args));
  };

  var dom = require.local('scripts', 'dom');
  var logger = require.local('scripts', 'terminalLogger');

  function createSpinnerImg(btn) {
    if (btn.dataset.primary === 'true') var spinnerImgFile = path.join('images', theme.getPrimaryLoader());else var spinnerImgFile = path.join('images', theme.getLoader());

    return dom.create('img').addClass('in-progress').attr('src', spinnerImgFile);
  }

  return function (btn) {
    if (btn.classList.contains('in-progress')) return;

    var event = new EventEmitter();

    var spinnerImg = createSpinnerImg(btn);

    function addSpinner() {
      btn.classList.add('in-progress');
      btn.append(spinnerImg);
    }

    function removeSpinner() {
      btn.classList.remove('in-progress');
      dom.remove(spinnerImg);
    }

    function runCommand() {
      var cmdName = btn.dataset.cmd;
      logger('\n[Running "' + cmdName + '" command...]\n');

      var cmd = processQueue.run(cmdName);

      cmd.on('exit', function (code, signal) {
        logger('\n["' + cmdName + '" command ended]\n');
        event.emit('commandEnd');
      });
    }

    event.on('commandInit', function () {
      addSpinner();
      runCommand();
    });

    event.on('commandEnd', function () {
      removeSpinner();
    });

    event.emit('commandInit');
  };
})();