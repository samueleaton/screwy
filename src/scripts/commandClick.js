const commandClick = (function() {
  const path = require('path');
  const scriptsDir = path.join(__dirname, 'scripts');
  const dom = require(path.join(scriptsDir, 'dom'));
  const logger = require(path.join(scriptsDir, 'terminalLogger'));
  const EventEmitter = require('events').EventEmitter;
  
  function createSpinnerImg(btn) {
    if (btn.dataset.primary === 'true')
      var spinnerImgFile = path.join('images', theme.getPrimaryLoader());
    else
      var spinnerImgFile = path.join('images', theme.getLoader());

    return dom.create('img').addClass('in-progress')
      .attr('src', spinnerImgFile);
  }


  return function(btn) {
    if (btn.classList.contains('in-progress')) return;

    const event = new EventEmitter();

    const spinnerImg = createSpinnerImg(btn);
    
    function addSpinner() {
      btn.classList.add('in-progress');
      btn.append(spinnerImg);
    }

    function removeSpinner() {
      btn.classList.remove('in-progress');
      dom.remove(spinnerImg);
    }

    function runCommand() {
      const cmdName = btn.dataset.cmd;
      logger('\n[Running "' + cmdName + '" command...]\n');

      let cmd = processQueue.run(cmdName);

      cmd.on('exit', function(code, signal) {
        logger('\n["' + cmdName + '" command ended]\n');
        event.emit('commandEnd');
      });
    }

    event.on('commandInit', () => {
      addSpinner();
      runCommand();
    });

    event.on('commandEnd', () => {
      removeSpinner();
    });

    event.emit('commandInit');

  };
})();

