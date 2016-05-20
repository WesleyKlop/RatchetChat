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
    username: '',
    common_name: ''
  };


  function writeMessage(name, message, picUrl) {
    let container = document.createElement('div');
    container.innerHTML = '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
      '</div>';

    let messageBox = container.firstChild;

    messageBox.querySelector('.message').innerText = message;
    if (picUrl && picUrl.length > 0)
      messageBox.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
    messageBox.querySelector('.name').textContent = name;

    chatBox.appendChild(messageBox);

    setTimeout(function() {
      messageBox.classList.add('visible')
    }, 1);
    chatBox.scrollTop = chatBox.scrollHeight;
    msgBox.focus();
  }

  conn.onopen = () => {
    console.log("Connection with", socketURL, "is established!");
  };

  conn.onmessage = (e) => {
    writeMessage(user.common_name, e.data, null);
  };

  sendBtn.addEventListener('click', function sendMessage() {
    let message = msgBox.value.trim();

    if (conn.readyState != 1
      || message.length <= 0)
      return;

    conn.send(message);
    writeMessage(user.common_name, message);

    // Clear messageBox
    msgBox.value = '';
  });

  signInDialogButton.addEventListener('click', () => {
    signInDialog.show();
  });

  function processResponse(response) {
    if (response.status != "success") alert(response.response);

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