/**
 * Created by wesley on 6/18/16.
 */
class CommandProcessor {
    /**
     * Processes a command with the parameters
     * @param {string} command
     * @param {Array} params
     * @constructor
     */
    static Process(command, params = []) {
        UiController.clearMessageBox();

        switch (command) {
            case 'clear':
                UiController.clearMessages();
                break;
            case 'register':
                return AppController.registerUser(params[0], params[1]);
            case 'login':
                return AppController.loginUser(params[0], params[1]);
        }
    }
}
