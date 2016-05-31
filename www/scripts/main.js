/**
 * Created by wesley on 5/19/16.
 */
// Timestamp shim
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  }
}

((socketURL) => {
  let conn = new WebSocket(socketURL),
    sendBtn = document.querySelector('#submit'),
    chatBox = document.querySelector('#messages'),
    msgBox = document.querySelector('#message'),
    signInDialog = document.querySelector('#form-dialog'),
    signInButton = document.querySelector('#sign-in'),
    signOutButton = document.querySelector('#sign-out'),
    signInForm = document.querySelector('#form-signin'),
    signInUsername = document.querySelector('#form-username'),
    signInPassword = document.querySelector('#form-password'),
    signInCancel = document.querySelector('#form-cancel'),
    snackbar = document.querySelector('#must-signin-snackbar'),
    accountHeader = document.querySelector('#user-name');

  let user = {
    signedIn: false,
    username: '',
    common_name: ''
  };

  function writeMessage(message) {
    message = JSON.parse(message);
    let container = document.createElement('div');
    container.innerHTML = '<div class="message-container">' +
      '<div class="spacing"></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
      '<div class="time"></div>' +
      '</div>';

    let messageBox = container.firstChild,
      date = new Date(message.time * 1000),
      hours = date.getHours(),
      minutes = "0" + date.getMinutes(),
      seconds = "0" + date.getSeconds();

    // Parse markdown
    messageBox.querySelector('.message').innerHTML = markdown.toHTML(message.message);
    messageBox.querySelector('.name').textContent = message.common_name;
    messageBox.querySelector('.time').textContent = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    messageBox.dataset.username = message.username;

    // Send a notification if the message is not send by the user
    if (message.username !== user.username && !message.flags) {
      if (!('Notification' in window)) {
        console.log("Client does not support nofications, fuck (s)he's old");
      } else if (Notification.permission === 'granted') {
        new Notification("New message!", {
          body: message.common_name + ": " + message.message,
          tag: "Ratchet Chat"
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
          if (permission === 'granted') {
            new Notification("New message!", {
              body: message.common_name + ": " + message.message,
              tag: "Ratchet Chat"
            });
          }
        });
      }
    }

    chatBox.appendChild(messageBox);

    setTimeout(function() {
      messageBox.classList.add('visible')
    }, 100);
    chatBox.scrollTop = chatBox.scrollHeight;
    msgBox.focus();
  }

  conn.onopen = () => {
    console.info("Connection with", socketURL, "is established!");
  };

  conn.onmessage = (e) => {
    let message = JSON.parse(e.data);
    if (message.type == 'verification') {
      processResponse(message);
    } else {
      writeMessage(e.data);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let message = {
      message: msgBox.value.trim(),
      username: user.username,
      common_name: user.common_name,
      time: Math.floor(Date.now() / 1000)
    };

    if (conn.readyState != 1
      || message.message.length <= 0)
      return;

    if (!user.signedIn) {
      showSnackbar({
        message: 'You must sign in first',
        timeout: 2000,
        actionText: 'Sign in',
        actionHandler: () => {
          signInDialog.showModal();
        }
      });
      return;
    }

    message = JSON.stringify(message);
    //noinspection JSCheckFunctionSignatures
    conn.send(message);

    // Clear messageBox
    msgBox.value = '';
  });

  signInButton.addEventListener('click', () => {
    signInDialog.showModal();
  });

  function showSnackbar(data) {
    snackbar.MaterialSnackbar.showSnackbar(data);
  }

  function setAccountHeader() {
    if (user.signedIn) {
      accountHeader.textContent = user.common_name;
      accountHeader.removeAttribute('hidden');

      signInButton.setAttribute('hidden', 'true');
      signOutButton.removeAttribute('hidden');
    } else {
      accountHeader.setAttribute('hidden', 'true');
      accountHeader.textContent = '';

      signOutButton.setAttribute('hidden', 'true');
      signInButton.removeAttribute('hidden');
    }
  }

  function processResponse(response) {
    if (response.status != "success") {
      let data = {
        message: response.response,
        timeout: 5000
      };
      showSnackbar(data);
      return;
    }

    user = response.response;
    user.signedIn = true;
    signInDialog.close();

    showSnackbar({
      message: 'Successfully signed in as ' + user.common_name,
      timeout: 2500
    });

    setAccountHeader();
  }

  signOutButton.addEventListener('click', () => {
    user.signedIn = false;
    user.username = '';
    user.common_name = '';

    setAccountHeader();
    showSnackbar({
      message: 'Successfully signed out.',
      timeout: 2000
    });
  });

  signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let username = signInUsername.value,
      password = signInPassword.value;
    let packet = {
      type: 'verification',
      username: username,
      password: password
    };

    conn.send(JSON.stringify(packet));
  });

  signInCancel.addEventListener('click', (e) => {
    e.preventDefault();
    signInDialog.close();
  });

})(socketURL);

(() => {
  //noinspection JSUnresolvedVariable
  if (typeof HTMLDialogElement === 'function') {
    return;
  }
  let allDialogs = document.querySelectorAll('dialog');
  for (let key in allDialogs) {
    if (allDialogs.hasOwnProperty(key)) {
      let dialog = allDialogs[key];
      dialogPolyfill.registerDialog(dialog);
    }
  }
})();