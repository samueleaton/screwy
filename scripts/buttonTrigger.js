'use strict';

function buttonTrigger(commandName) {
  var btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement) btn.click();
}