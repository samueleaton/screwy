'use strict';

function buttonTrigger(commandName) {
  var btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement) btn.click();
}

function buttonKiller(commandName) {
  var btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement && btn.classList.contains('in-progress')) btn.dispatchEvent(new Event("dblclick"));
}

function buttonRestarter(commandName) {
  var btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement) {
    if (btn.classList.contains('in-progress')) {
      global.evt.once(commandName + '-commandEnd', function (cmdName) {
        process.nextTick(function () {
          return buttonTrigger(cmdName);
        });
      });
      btn.dispatchEvent(new Event("dblclick"));
    } else {
      buttonTrigger(commandName);
    }
  }
}