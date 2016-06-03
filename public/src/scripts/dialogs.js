(() => {
  //noinspection JSUnresolvedVariable
  if (typeof HTMLDialogElement === 'function') {
    return;
  }
  let allDialogs = document.querySelectorAll('dialog');
  for (let key in allDialogs) {
    if (allDialogs.hasOwnProperty(key)) {
      let dialog = allDialogs[key];
      //noinspection ES6ModulesDependencies
      dialogPolyfill.registerDialog(dialog);
    }
  }
})();