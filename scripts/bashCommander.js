'use strict';

var bashCommander = (function () {
  var active = false;

  require.local = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args.unshift(__dirname);
    return require(require('path').join.apply(null, args));
  };

  var toArr = require.local('scripts', 'toArray');
  var rand = require.local('scripts', 'rand');
  var logger = require.local('scripts', 'terminalLogger');

  var section = document.getElementById('bash-commander');
  var form = document.getElementById('bash-commander-form');
  var bashCommandInput = document.getElementById('bash-commander-input');
  var cover = document.getElementById('cover');

  function toggle() {
    active ? hide() : show();
  }

  function hide() {
    if (active === false) return;
    active = false;
    section.classList.add('hide');
    cover.classList.add('hide');
    bashCommandInput.value = '';
    bashCommandInput.blur();
  }

  function show() {
    if (active === true) return;
    active = true;
    section.classList.remove('hide');
    cover.classList.remove('hide');
    setTimeout(function () {
      return bashCommandInput.focus();
    }, 300);
  }

  function getCommandValue() {
    return bashCommandInput.value.trim();
  }

  function executionError() {
    section.classList.add('error');
    setTimeout(function () {
      section.classList.remove('error');
    }, 400);
  }

  function executionSuccess() {
    section.classList.add('success');
    setTimeout(function () {
      section.classList.remove('success');
    }, 400);
  }

  function run() {
    var commandString = getCommandValue().split(' ');
    var commandName = commandString.shift();

    logger('\n[Running "' + commandName + ' ' + commandString.join(' ') + '"...]\n');

    var cmd = processQueue.runBash({
      id: rand(12),
      command: commandName,
      arguments: commandString
    });

    cmd.on('exit', function (code, signal) {
      logger('\n["' + commandName + ' ' + commandString.join(' ') + '" ended]\n');
      if (code === 0) executionSuccess();else executionError();
    });
  }

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    run();
  });

  return { toggle: toggle };
})();