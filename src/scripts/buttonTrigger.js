function buttonTrigger(commandName) {
  const btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement)
    btn.click();
}

function buttonKiller(commandName) {
  const btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement && btn.classList.contains('in-progress'))
    btn.dispatchEvent(new Event("dblclick"));
}

function buttonRestarter(commandName) {
  const btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement && btn.classList.contains('in-progress')) {
    window.globalEvent.once(commandName + '-commandEnd', cmdName => {
      process.nextTick(() => buttonTrigger(cmdName));
    });
    btn.dispatchEvent(new Event("dblclick"));
  }
}
