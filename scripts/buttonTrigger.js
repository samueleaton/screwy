// function buttonTrigger(commandName) {
//   console.log('trigger start: ', commandName);
//   const btn = window.document.querySelector('[data-cmd="' + commandName + '"]');

//   console.log('btn: ', btn);

//   if (btn instanceof HTMLElement)
//     btn.click();
// }

// function buttonKiller(commandName) {
//   console.log('trigger kill: ', commandName);
//   const btn = window.document.querySelector('[data-cmd="' + commandName + '"]');

//   console.log('btn: ', btn);
//   console.log('btn instanceof HTMLElement: ', btn instanceof HTMLElement);
//   window.myBtn = btn;

//   if (btn instanceof HTMLElement)
//     btn.dispatchEvent(new Event("dblclick"));
// }

// function buttonRestarter(commandName) {
//   console.log('trigger restart: ', commandName);
//   const btn = window.document.querySelector('[data-cmd="' + commandName + '"]');

//   if (btn instanceof HTMLElement) {
//     btn.dispatchEvent(new Event("dblclick"));
//     process.nextTick(() => { btn.dispatchEvent(new Event("click")); });
//   }
// }

// window.buttonTrigger = buttonTrigger;
// window.buttonKiller = buttonKiller;
// window.buttonRestarter = buttonRestarter;
"use strict";