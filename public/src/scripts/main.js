/**
 * Created by wesley on 5/19/16.
 * Main application script.
 */
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

  let writeMessage = (message) => {
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
    //noinspection JSUnresolvedVariable
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
      messageBox.classList.add('visible');
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);

    msgBox.focus();
  };

  conn.onopen = () => {
    console.info("Connection with", socketURL, "is established!");

    /*
     * Try automagically signing in using localstorage
     * TODO: This is not secure! the password should be hashed in the local storage but I don't know how I would do that
     */
    if (conn.readyState == 1
      && localStorage.getItem('username')
      && localStorage.getItem('password')) {
      conn.send(JSON.stringify({
        type: 'verification',
        flags: 'silent',
        username: localStorage.getItem('username'),
        password: localStorage.getItem('password')
      }));
    }
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
      //noinspection JSUnusedGlobalSymbols
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

  let showSnackbar = (data) => {
    snackbar.MaterialSnackbar.showSnackbar(data);
  };

  let setAccountHeader = () => {
    console.log("setting account header", user);
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
  };

  let processResponse = (response) => {
    console.log(response);
    if (response.status != "success") {
      if (response.flags != 'silent')
        showSnackbar({
          message: response.response,
          timeout: 5000
        });
      return;
    }

    user = response.response;
    user.signedIn = true;

    // If the silent flag exists the auth wasn't called from a dialog so we can't close it...
    if (response.flags != 'silent') {
      signInDialog.close();

      showSnackbar({
        message: 'Successfully signed in as ' + user.common_name,
        timeout: 2500
      });
    }

    setAccountHeader();
  };

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