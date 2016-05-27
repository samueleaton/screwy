'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rand = require('./scripts/rand');

var _rand2 = _interopRequireDefault(_rand);

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = function logger(msg) {
  return _electron.ipcRenderer.send('log', msg);
};

var npmInstaller = function () {

  var active = false;

  var section = document.getElementById('npm-installer');
  var form = document.getElementById('npm-installer-form');
  var packageNameField = document.getElementById('package-name');
  var radios = _lodash2.default.toArray(section.querySelectorAll('input[type=radio]'));
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
      id: (0, _rand2.default)(12),
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
}();