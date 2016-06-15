/**
 * Created by wesley on 5/19/16.
 * Main application script.
 */
((socketURL) => {
    const MSG_TYPE_MESSAGE = 'message',
        MSG_TYPE_VERIFICATION = 'verify',
        MSG_TYPE_SNACKBAR = 'snackbar';

    const MSG_STATUS_SUCCESS = 0,
        MSG_STATUS_FAILURE = 1,
        MSG_STATUS_ERROR = 2;


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
        // The message is JSON so we start by parsing that
        let message = JSON.parse(e.data);
        console.log(message);
        // Now let's see what kind of message we received
        switch (message.type) {
            case MSG_TYPE_MESSAGE:
                // We should write the message to the screen
                processMessage(message);
                break;
            case MSG_TYPE_VERIFICATION:
                processAuth(message);
                break;
            case MSG_TYPE_SNACKBAR:
                showSnackbar({
                    message: message.payload,
                    timeout: message.flags.timeout
                });
        }
    };

    let processMessage = (message) => {
        // First we check if the message is OK
        if (message.status !== MSG_STATUS_SUCCESS)
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
        let message = {
            type: MSG_TYPE_MESSAGE,
            // Replace \n with "  \n" for markdown
            payload: msgBox.value.replace(/\n/g, "  \n"),
            username: user.username,
            common_name: user.common_name,
            time: Math.floor(Date.now() / 1000)
        };

        if (conn.readyState != 1
            || message.payload.length <= 0)
            return;

        if (!user.signedIn) {
            //noinspection JSUnusedGlobalSymbols
            showSnackbar({
                message: 'You must sign in first',
                timeout: 2000,
                actionText: 'Sign in',
                actionHandler: () => signIn.dialog.showModal()
            });
            return;
        }

        message = JSON.stringify(message);
        //noinspection JSCheckFunctionSignatures
        conn.send(message);

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
        if (!response.flags.includes('silent')) {
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
        let packet = {
            type: MSG_TYPE_VERIFICATION,
            username: username,
            payload: password,
            flags: []
        };

        // If we want to be rememberd, add that flag
        if (signIn.remember.checked === true)
            packet.flags.push('remember');

        // So we know if we have to store the received JWT
        expectJwt = packet.flags.includes('remember');

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
    document.addEventListener('visibilitychange', (e) => {
        if (document.hidden) {
            focused = false;
        } else {
            focused = true;
            document.title = "RatchetChat";
            unreadCount = 0;
        }
    });
})(socketURL);
