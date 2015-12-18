'use strict';

// will run in global scope in renderer
var npmInstaller = (function () {

  var active = false;
  var path = require('path');
  var scriptsDir = path.join(__dirname, 'scripts');
  var toArr = require(path.join(scriptsDir, 'toArray'));
  var rand = require(path.join(scriptsDir, 'rand'));

  var section = document.getElementById('npm-installer');
  var form = document.getElementById('npm-installer-form');
  var packageNameField = document.getElementById('package-name');
  var radios = toArr(document.querySelectorAll('input[type=radio]'));
  var cover = document.getElementById('cover');

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

    cmd.on('exit', function (code, signal) {
      logger('\n["' + commandString + '" ended]\n');
      if (code === 0) hide();else installerError();
    });
  }

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    run();
  });

  return { toggle: toggle };
})();