'use strict';

var buttonTrigger = (function () {
  return function (commandName) {
    var btn = document.querySelector('[data-cmd="' + commandName + '"]');

    if (btn instanceof HTMLElement) btn.click();
  };
})();