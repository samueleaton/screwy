'use strict';

// will run in global scope in renderer
var npmInstaller = (function () {

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

  var section = document.getElementById('npm-installer');
  var form = document.getElementById('npm-installer-form');
  var packageNameField = document.getElementById('package-name');
  var radios = toArr(section.querySelectorAll('input[type=radio]'));
  var cover = document.getElementById('cover');
  var loader = document.getElementById('npm-installer-loader');

  function toggle() {
    active ? hide() : show();
  }

  function hide() {
    if (active === false) return;
    active = false;
    section.classList.add('hide');
    cover.classList.add('hide');
    radios.forEach(function (r) {
      r.checked = false;
      r.blur();
    });
    packageNameField.value = '';
    packageNameField.blur();
  }

  function show() {
    if (active === true) return;
    active = true;
    section.classList.remove('hide');
    cover.classList.remove('hide');
    setTimeout(function () {
      return packageNameField.focus();
    }, 300);
  }

  function getPackageName() {
    return packageNameField.value.trim();
  }

  function getCheckedRadio() {
    var checkedRadio = radios.find(function (r) {
      return r.checked;
    });
    // returns 'undefined', '--save' or '--save-dev'
    return checkedRadio && (checkedRadio.value === 'save' ? '--save' : '-save-dev');
  }

  function installerError() {
    section.classList.add('error');
    setTimeout(function () {
      section.classList.remove('error');
    }, 400);
  }

  function installerSuccess() {
    section.classList.add('success');
    setTimeout(function () {
      section.classList.remove('success');
      setTimeout(function () {
        hide();
      }, 200);
    }, 400);
  }

  function run() {
    var packName = getPackageName();
    var checkedRadio = getCheckedRadio();

    var commandString = 'npm install';
    if (packName.length) commandString += ' ' + packName;
    if (checkedRadio) commandString += ' ' + checkedRadio;

    logger('\n[Running "' + commandString + '"...]\n');

    var cmd = processQueue.install({
      id: rand(12),
      package: packName,
      depType: checkedRadio
    });

    loader.classList.add('active');

    cmd.on('exit', function (code, signal) {
      logger('\n["' + commandString + '" ended]\n');
      loader.classList.remove('active');
      if (code === 0) installerSuccess();else installerError();
    });
  }

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    run();
  });

  return { toggle: toggle };
})();