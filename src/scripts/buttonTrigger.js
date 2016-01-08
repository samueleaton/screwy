function buttonTrigger(commandName) {
  const btn = document.querySelector('[data-cmd="' + commandName + '"]');

  if (btn instanceof HTMLElement)
    btn.click();
}
