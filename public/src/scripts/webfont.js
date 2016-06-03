let WebFontConfig = {
  google: {families: ['Roboto:regular,bold,italic,thin,light,bolditalic,black,medium', 'Material+Icons']}
};
(() => {
  let wf = document.createElement('script');
  wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  let s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
})(); 