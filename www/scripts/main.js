/**
 * Created by wesley on 5/19/16.
 */
// Timestamp shim
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  }
}

((socketURL, loginURL) => {
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

  var user = {
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

    // Replace html tag thingies to prevent raw html placement
    message.message = message.message.replace('<', '&lt;').replace('>', '&gt;');

    // Parse markdown
    let messageBody = markdown.toHTML(message.message);
    console.log(messageBody);

    messageBox.querySelector('.message').innerHTML = messageBody;
    messageBox.querySelector('.name').textContent = message.common_name;
    messageBox.querySelector('.time').textContent = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    messageBox.dataset.username = message.username;

    chatBox.appendChild(messageBox);

    setTimeout(function() {
      messageBox.classList.add('visible')
    }, 100);
    chatBox.scrollTop = chatBox.scrollHeight;
    msgBox.focus();
  }

  conn.onopen = () => {
    console.log("Connection with", socketURL, "is established!");
  };

  conn.onmessage = (e) => {
    writeMessage(e.data);
  };

  sendBtn.addEventListener('click', function sendMessage() {
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
          signInDialog.show();
        }
      });
      return;
    }

    message = JSON.stringify(message);
    conn.send(message);
    writeMessage(message);

    // Clear messageBox
    msgBox.value = '';
  });

  signInButton.addEventListener('click', () => {
    signInDialog.show();
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
      console.error(response);
      let data = {
        message: response.response,
        timeout: 5000
      };
      showSnackbar(data);
      return;
    }

    console.info("user", response.response);
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

  signInForm.addEventListener('submit', () => {
    let username = signInUsername.value,
      password = signInPassword.value,
      queryString = 'username=' + username + '&password=' + password,
      xhr = new XMLHttpRequest();

    xhr.addEventListener('load', () => {
      console.log(xhr.responseText);
      let json = JSON.parse(xhr.responseText);
      processResponse(json);
    });
    xhr.open('post', loginURL, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(queryString);
  });

  signInCancel.addEventListener('click', (e) => {
    e.preventDefault();
    signInDialog.close();
  });

})(socketURL, loginURL);