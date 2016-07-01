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
        msgBox = document.querySelector('#message'),
        signOutButton = document.querySelector('#sign-out'),
        snackbar = document.querySelector('#snackbar');

    let user = {
        signedIn: false,
        username: '',
        common_name: ''
    };

    let expectJwt = false,
        focused = true,
        unreadCount = 0;

    let app = new AppController(conn);

    conn.onopen = () => {
        console.info("Connection with", socketURL, "is established!");

        // Try automatically signing in using the JWT
        console.info('Sending a silent authentication message to the server!');
        if (localStorage.getItem('UserKey')) {
            let packet = new Message;
            packet.type = Message.TYPE_VERIFICATION;
            packet.addFlag('silent');
            packet.payload = localStorage.getItem('UserKey');

            conn.send(packet.toJson());
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
                UiController.showSnackbar(message.payload, message.flags.timeout);
                break;
            default:
                console.error("Message is an unkown type!", message.type);
        }
    };

    let processMessage = (message) => {
        // First we check if the message is OK
        if (message.status !== Message.STATUS_SUCCESS)
            return console.warn('Message was invalid!');

        // Add the message to the messages container
        UiController.appendMessage(message);

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
    };

    let sendMessage = (e) => {
        e.preventDefault();

        // Intercept commands
        if (msgBox.value.startsWith('/')) {
            let params = msgBox.value.substr(1).split(' '),
                command = params.shift(),
                packet = CommandProcessor.Process(command, params);

            if (packet)
                conn.send(packet.toJson());

            return;
        }

        // Else send message
        let message = Message.Build({
            type: Message.TYPE_MESSAGE,
            // Replace \n not preceded by 2 spaces with "  \n" for markdown
            payload: msgBox.value.replace(/[^ ]{2}\n/g, "  \n"),
            username: user.username,
            common_name: user.common_name,
            timestamp: Date.getTimestamp()
        });

        if (conn.readyState != 1
            || message.payload.length <= 0)
            return;

        if (!user.signedIn) {
            UiController.showSnackbar({
                message: 'You must sign in first',
                timeout: 2000,
                actionText: 'Sign in',
                actionHandler: () => signIn.dialog.showModal()
            });
            return;
        }

        conn.send(message.toJson());

        // Clear messageBox
        UiController.clearMessageBox();
        // Focus on the messagebox
        msgBox.focus();
    };

    sendBtn.addEventListener('click', sendMessage);

    signIn.button.addEventListener('click', () => {
        signIn.dialog.showModal();
    });

    let processAuth = (response) => {
        user.common_name = response.common_name;
        user.username = response.username;
        user.signedIn = true;

        // If the silent flag exists the auth wasn't called from a dialog so we can't close it...
        if (!response.hasFlag('silent') && signIn.dialog.open) {
            signIn.dialog.close();

            UiController.showSnackbar('Successfully signed in as ' + user.common_name, 2500);
        }

        // Save the JWT if we're expecting one
        if (expectJwt && response.payload) {
            localStorage.setItem('UserKey', response.payload);
            expectJwt = false;
        }

        UiController.setAccountHeader(user);
    };

    signOutButton.addEventListener('click', () => {
        user.signedIn = false;
        user.username = '';
        user.common_name = '';

        // Remove the JWT token because you don't expect to sign in after a refresh after logging out
        localStorage.removeItem('UserKey');

        UiController.setAccountHeader(user);
        UiController.showSnackbar('Successfully signed out.', 2000);
    });

    signIn.form.addEventListener('submit', (e) => {
        e.preventDefault();

        let packet = AppController.loginUser(signIn.username.value, signIn.password.value);

        // If we want to be remembered, add that flag
        if (signIn.remember.checked === true)
            packet.addFlag('remember');

        // So we know if we have to store the received JWT
        expectJwt = packet.hasFlag('remember');

        conn.send(packet.toJson());
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

    // Let the document title change when the user is not focused on the tab
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            focused = false;
        } else {
            focused = true;
            document.title = "RatchetChat";
            unreadCount = 0;
            // Refocus on messagebox
            msgBox.focus();
        }
    });

    app.registerSW();

    // Add event listeners for connection events
    window.addEventListener('offline', () => UiController.showSnackbar("Showing cached messages as you are offline.", 2500));
})(socketURL);
