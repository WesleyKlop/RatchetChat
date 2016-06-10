// Timestamp shim
if (!Date.now) {
  Date.now = () => new Date().getTime();
}
