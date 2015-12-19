const bashCommander = (function() {
	let active = false;

  require.local = function(...args) {
  	args.unshift(__dirname);
		return require(require('path').join.apply(null, args));
	}

  const toArr = require.local('scripts', 'toArray');
  const rand = require.local('scripts', 'rand');
  const logger = require.local('scripts', 'terminalLogger');

  const section = document.getElementById('bash-commander');
  const form = document.getElementById('bash-commander-form');
  const bashCommandInput = document.getElementById('bash-commander-input');
  const cover = document.getElementById('cover');

  function toggle() {
    active ? hide() : show() ;
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
    setTimeout(() => bashCommandInput.focus(), 300);
  }

  function getCommandValue() {
    return bashCommandInput.value.trim();
  }

  function executionError() {
    section.classList.add('error');
    setTimeout(() => {section.classList.remove('error')}, 400);
  }

  function executionSuccess() {
    section.classList.add('success');
    setTimeout(() => {section.classList.remove('success')}, 400);
  }

  function run() {
    const commandString = getCommandValue().split(' ');
    const commandName = commandString.shift();

    logger('\n[Running "' + commandName + ' ' + commandString.join(' ') + '"...]\n');

    let cmd = processQueue.runBash({
      id: rand(12),
      command: commandName,
      arguments: commandString
    });

    cmd.on('exit', function(code, signal) {
      logger('\n["' + commandName + ' ' + commandString.join(' ') + '" ended]\n');
      if (code === 0) executionSuccess();
      else executionError();
    });
  }

  form.addEventListener('submit', evt => {
    evt.preventDefault();
    run();
  });

  return {toggle};
})();
