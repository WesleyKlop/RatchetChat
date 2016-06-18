/**
 * Created by wesley on 6/18/16.
 */
class UiController {
    /**
     * Appends a message to the messagesbox
     * @param {Message} message
     */
    static appendMessage(message) {
        let messageBox = UiController.getMessagebox(),
            date = new Date(message.timestamp * 1000),
            hours = date.getHours(),
            minutes = "0" + date.getMinutes(),
            seconds = "0" + date.getSeconds(),
            chatBox = document.querySelector('#messages');

        // Parse markdown
        messageBox.querySelector('.message').innerHTML = markdown.toHTML(message.payload);

        messageBox.querySelector('.name').textContent = message.common_name;
        messageBox.querySelector('.time').textContent = `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
        //messageBox.dataset.username = message.username;

        // Add the message to the chatbox and make it visible, then scroll to the bottom of the container
        chatBox.appendChild(messageBox);
        setTimeout(() => {
            messageBox.classList.add('visible');
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
    }

    /** Clears the messagebox of any messages */
    static clearMessages() {
        let messagesToRemove = document.querySelectorAll('#messages > :not(#message-filler)'),
            counter = 0;

        for (let message of messagesToRemove) {
            message.remove();
            counter++;
        }
        console.info(`Cleared ${counter} messages`);
    }

    /** Clears the messagebox of the user's message */
    static clearMessageBox() {
        document.querySelector('#message').value = '';
    }

    /**
     * Returns a messagebox to create a message element
     * @returns {Node}
     * @private
     */
    static getMessagebox() {
        let container = document.createElement('div');
        container.innerHTML = '<div class="message-container">' +
            '<div class="spacing"></div>' +
            '<div class="message"></div>' +
            '<div class="name"></div>' +
            '<div class="time"></div>' +
            '</div>';
        return container.firstChild;
    }

    /**
     * Shows a snackbar with param message and timeout
     * @param {string|object} message
     * @param {number} timeout
     */
    static showSnackbar(message, timeout = 2000) {
        let data;

        if (typeof message === 'object')
            data = message;
        else
            data = {
                message: message,
                timeout: timeout
            };

        document.querySelector('#snackbar').MaterialSnackbar.showSnackbar(data)
    }

    static setAccountHeader(user) {
        let accountHeader = document.querySelector('#user-name'),
            signInButton = document.querySelector('#sign-in'),
            signOutButton = document.querySelector('#sign-out');

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
}
