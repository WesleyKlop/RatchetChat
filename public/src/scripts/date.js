// Timestamp shim
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  }
}