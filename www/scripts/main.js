/**
 * Created by wesley on 5/19/16.
 */
((socketURL, loginURL) => {
  let conn = new WebSocket(socketURL),
    sendBtn = document.querySelector('#submit'),
    chatBox = document.querySelector('#messages'),
    msgBox = document.querySelector('#message'),
    signInDialog = document.querySelector('#form-dialog'),
    signInDialogButton = document.querySelector('#sign-in'),
    signInForm = document.querySelector('#form-signin'),
    signInUsername = document.querySelector('#form-username'),
    signInPassword = document.querySelector('#form-password');

  var user = {
    username: 'anon',
    common_name: 'Wesley'
  };


  function writeMessage(message) {
    message = JSON.parse(message);
    let container = document.createElement('div');
    container.innerHTML = '<div class="message-container">' +
      '<div class="spacing"></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
      '<div class="time">13:37</div>' +
      '</div>';

    let messageBox = container.firstChild;

    messageBox.querySelector('.message').innerText = message.message;
    messageBox.querySelector('.name').textContent = message.common_name;
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
      common_name: user.common_name
    };

    if (conn.readyState != 1
      || message.message.length <= 0)
      return;

    message = JSON.stringify(message);
    conn.send(message);
    writeMessage(message);

    // Clear messageBox
    msgBox.value = '';
  });

  signInDialogButton.addEventListener('click', () => {
    signInDialog.show();
  });

  function processResponse(response) {
    if (response.status != "success") {
      alert(response.response);
      console.error(response);
      return;
    }

    console.info("user", response.response);
    user = response.response;
    signInDialog.close();
  }

  signInForm.addEventListener('submit', () => {
    let username = signInUsername.value,
      password = signInPassword.value,
      queryString = 'username=' + username + '&password=' + password,
      xhr = new XMLHttpRequest();

    xhr.addEventListener('load', () => {
      let json = JSON.parse(xhr.responseText);
      processResponse(json);
    });
    xhr.open('post', loginURL, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(queryString);
  });

})(socketURL, loginURL);