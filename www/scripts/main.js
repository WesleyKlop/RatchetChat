/**
 * Created by wesley on 5/19/16.
 */
let conn = new WebSocket('ws://localhost:1337'),
    sendBtn = document.querySelector('#submit'),
    chatBox = document.querySelector('#messages'),
    msgBox = document.querySelector('#message');

function writeMessage(name, message, picUrl) {
    let container = document.createElement('div');
    container.innerHTML = '<div class="message-container">' +
        '<div class="spacing"><div class="pic"></div></div>' +
        '<div class="message"></div>' +
        '<div class="name"></div>' +
        '</div>';

    let messageBox = container.firstChild;

    messageBox.querySelector('.message').innerText = message;
    // TODO: messageBox.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
    messageBox.querySelector('.name').textContent = name;

    chatBox.appendChild(messageBox);

    setTimeout(function () {
        messageBox.classList.add('visible')
    }, 1);
    chatBox.scrollTop = chatBox.scrollHeight;
    msgBox.focus();
}

conn.onopen = function (e) {
    console.log("Connection established!");
};

conn.onmessage = function (e) {
    writeMessage('Anon', e.data);
};


sendBtn.addEventListener('click', function sendMessage(e) {
    let message = msgBox.value.trim();

    if (conn.readyState != 1
        || message.length <= 0)
        return;

    conn.send(message);
    writeMessage('Anon', message);

    // Clear messageBox
    msgBox.value = '';
});