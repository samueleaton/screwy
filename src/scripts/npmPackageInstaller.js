import _ from 'lodash';
import rand from './scripts/rand';
import { ipcRenderer } from 'electron';
const logger = (msg) => ipcRenderer.send('log', msg);

const npmInstaller = (function() {
  
  let active = false;

  const section = document.getElementById('npm-installer');
  const form = document.getElementById('npm-installer-form');
  const packageNameField = document.getElementById('package-name');
  const radios = _.toArray(section.querySelectorAll('input[type=radio]'));
  const cover = document.getElementById('cover');
  const loader = document.getElementById('npm-installer-loader');

  function toggle() {
    active ? hide() : show() ;
  }

  function hide() {
    if (active === false) return;
    active = false;
    section.classList.add('hide');
    cover.classList.add('hide');
    radios.forEach(r => {
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
    setTimeout(() => packageNameField.focus(), 300);
  }

  function getPackageName() {
    return packageNameField.value.trim();
  }

  function getCheckedRadio() {
    const checkedRadio = radios.find(r => r.checked);
    // returns 'undefined', '--save' or '--save-dev'
    return checkedRadio && (checkedRadio.value === 'save' ? '--save' : '-save-dev' );
  }

  function installerError() {
    section.classList.add('error');
    setTimeout(() => {section.classList.remove('error')}, 400);
  }

  function installerSuccess() {
    section.classList.add('success');
    setTimeout(() => {
      section.classList.remove('success');
      setTimeout(function() {
        hide();
      }, 200);
    }, 400);
  }

  function run() {
    const packName = getPackageName();
    const checkedRadio = getCheckedRadio();

    let commandString = 'npm install';
    if (packName.length) commandString += ' ' + packName;
    if (checkedRadio) commandString += ' ' + checkedRadio;

    logger('\n[Running "' + commandString + '"...]\n');

    let cmd = processQueue.install({
      id: rand(12),
      package: packName,
      depType: checkedRadio
    });

    loader.classList.add('active');

    cmd.on('exit', function(code, signal) {
      logger('\n["' + commandString + '" ended]\n');
      loader.classList.remove('active');
      if (code === 0) installerSuccess();
      else installerError();
    });
  }

  form.addEventListener('submit', evt => {
    evt.preventDefault();
    run();
  });

  return { toggle };
})();
