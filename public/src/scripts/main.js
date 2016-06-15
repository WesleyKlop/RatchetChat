/**
 * Created by wesley on 5/19/16.
 * Main application script.
 */
((socketURL) => {
    let signIn = {
        dialog: document.querySelector('#form-dialog'),
        button: document.querySelector('#sign-in'),
        form: document.querySelector('#form-signin'),
        username: document.querySelector('#form-username'),
        password: document.querySelector('#form-password'),
        cancel: document.querySelector('#form-cancel'),
        remember: document.querySelector('#form-remember')
    };

    let conn = new WebSocket(socketURL),
        sendBtn = document.querySelector('#submit'),
        chatBox = document.querySelector('#messages'),
        msgBox = document.querySelector('#message'),
        signOutButton = document.querySelector('#sign-out'),
        snackbar = document.querySelector('#must-signin-snackbar'),
        accountHeader = document.querySelector('#user-name');

    let user = {
        signedIn: false,
        username: '',
        common_name: ''
    };

    let expectJwt = false,
        focused = true,
        unreadCount = 0;

    conn.onopen = () => {
        console.info("Connection with", socketURL, "is established!");

        // Try automatically signing in using the JWT
        console.info('Sending a silent authentication message to the server!');
        if (localStorage.getItem('UserKey')) {
            conn.send(JSON.stringify({
                type: 'verify',
                flags: ['silent'],
                payload: localStorage.getItem('UserKey')
            }));
        }
    };

    conn.onmessage = (e) => {
        let message = Message.Build(e.data);

        // Now let's see what kind of message we received
        switch (message.type) {
            case Message.TYPE_MESSAGE:
                // We should write the message to the screen
                processMessage(message);
                break;
            case Message.TYPE_VERIFICATION:
                processAuth(message);
                break;
            case Message.TYPE_SNACKBAR:
                showSnackbar({
                    message: message.payload,
                    timeout: message.flags.timeout
                });
                break;
            default:
                console.error("Message is an unkown type! ", message.type);
        }
    };

    let processMessage = (message) => {
        // First we check if the message is OK
        if (message.status !== Message.STATUS_SUCCESS)
            return console.warn('Message was invalid!');

        // Create a container to hold the message
        let container = document.createElement('div');
        container.innerHTML = '<div class="message-container">' +
            '<div class="spacing"></div>' +
            '<div class="message"></div>' +
            '<div class="name"></div>' +
            '<div class="time"></div>' +
            '</div>';

        // Fill the actual messagebox
        let messageBox = container.firstChild,
            date = new Date(message.timestamp * 1000),
            hours = date.getHours(),
            minutes = "0" + date.getMinutes(),
            seconds = "0" + date.getSeconds();

        // Parse markdown
        messageBox.querySelector('.message').innerHTML = markdown.toHTML(message.payload);

        messageBox.querySelector('.name').textContent = message.common_name;
        messageBox.querySelector('.time').textContent = `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
        //messageBox.dataset.username = message.username;

        // Send a notification if the message is not send by the user
        if (message.username !== user.username && !message.flags.includes('silent')) {
            if (!('Notification' in window)) {
                console.log("Client does not support nofications, fuck (s)he's old");
            } else if (Notification.permission === 'granted') {
                new Notification("New message!", {
                    body: message.common_name + ": " + message.payload,
                    tag: "Ratchet Chat"
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission((permission) => {
                    if (permission === 'granted') {
                        new Notification("New message!", {
                            body: message.common_name + ": " + message.payload,
                            tag: "Ratchet Chat"
                        });
                    }
                });
            }
            // Change the document title to show unread messages if not focussed
            if (!focused) {
                unreadCount++;
                document.title = "(" + unreadCount + ") RatchetChat";
            }
        }

        // Add the message to the chatbox and make it visible, then scroll to the bottom of the container
        chatBox.appendChild(messageBox);
        setTimeout(() => {
            messageBox.classList.add('visible');
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);

        // Focus on the messagebox
        msgBox.focus();
    };

    let sendMessage = (e) => {
        e.preventDefault();
        console.log('sendMessage');
        let message = Message.Build({
            type: Message.TYPE_MESSAGE,
            // Replace \n not preceded by 2 spaces with "  \n" for markdown
            payload: msgBox.value.replace(/[^ ]{2}\n/g, "  \n"),
            username: user.username,
            common_name: user.common_name,
            timestamp: Math.floor(Date.now() / 1000),
        });

        if (conn.readyState != 1
            || message.payload.length <= 0)
            return;

        if (!user.signedIn) {
            showSnackbar({
                message: 'You must sign in first',
                timeout: 2000,
                actionText: 'Sign in',
                actionHandler: () => signIn.dialog.showModal()
            });
            return;
        }

        conn.send(message.toJson());

        // Clear messageBox
        msgBox.value = '';
    };

    sendBtn.addEventListener('click', sendMessage);

    signIn.button.addEventListener('click', () => {
        signIn.dialog.showModal();
    });

    let showSnackbar = (data) => {
        //noinspection JSUnresolvedFunction
        snackbar.MaterialSnackbar.showSnackbar(data);
    };

    let setAccountHeader = () => {
        console.log("setting account header", user);
        if (user.signedIn) {
            accountHeader.textContent = user.common_name;
            accountHeader.removeAttribute('hidden');

            signIn.button.setAttribute('hidden', 'true');
            signOutButton.removeAttribute('hidden');
        } else {
            accountHeader.setAttribute('hidden', 'true');
            accountHeader.textContent = '';

            signOutButton.setAttribute('hidden', 'true');
            signIn.button.removeAttribute('hidden');
        }
    };

    let processAuth = (response) => {
        user.common_name = response.common_name;
        user.username = response.username;
        user.signedIn = true;

        // If the silent flag exists the auth wasn't called from a dialog so we can't close it...
        if (!response.hasFlag('silent')) {
            signIn.dialog.close();

            showSnackbar({
                message: 'Successfully signed in as ' + user.common_name,
                timeout: 2500
            });
        }

        // Save the JWT if we're expecting one
        if (expectJwt && response.payload) {
            localStorage.setItem('UserKey', response.payload);
            expectJwt = false;
        }

        setAccountHeader();
    };

    signOutButton.addEventListener('click', () => {
        user.signedIn = false;
        user.username = '';
        user.common_name = '';

        // Remove the JWT token because you don't expect to sign in after a refresh after logging out
        localStorage.removeItem('UserKey');

        setAccountHeader();
        showSnackbar({
            message: 'Successfully signed out.',
            timeout: 2000
        });
    });

    signIn.form.addEventListener('submit', (e) => {
        e.preventDefault();
        let username = signIn.username.value,
            password = signIn.password.value;
        let packet = new Message();
        packet.type = Message.TYPE_VERIFICATION;
        packet.username = username;
        packet.payload = password;

        // If we want to be rememberd, add that flag
        if (signIn.remember.checked === true)
            packet.addFlag('remember');

        // So we know if we have to store the received JWT
        expectJwt = packet.hasFlag('remember');

        conn.send(JSON.stringify(packet));
    });

    signIn.cancel.addEventListener('click', (e) => {
        e.preventDefault();
        signIn.dialog.close();
    });

    // Send message on enter in chatbox but newline on shift+enter
    msgBox.addEventListener('keypress', (e) => {
        // if the user presses enter without holding shift call the sendmessage function
        if (e.keyCode === 13 && e.shiftKey !== true) {
            sendMessage(e);
        }
    });

    // Let the document title change when the user is not focussed on the tab
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            focused = false;
        } else {
            focused = true;
            document.title = "RatchetChat";
            unreadCount = 0;
        }
    });
})(socketURL);
