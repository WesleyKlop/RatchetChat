/**
 * Created by wesley on 6/18/16.
 */
class CommandProcessor {
    /**
     * @var {Array} validCommands
     * @private
     */
    static get validCommands() {
        return [
            'clear'//,
            //'logout',
            //'login'
        ];
    }

    /**
     * Processes a command with the parameters
     * @param {string} command
     * @param {Array} params
     * @constructor
     */
    static Process(command, params = []) {
        if (!this.validCommands.includes(command))
            return;

        switch (command) {
            case 'clear':
                UiController.clearMessages();
                break;
        }

        UiController.clearMessageBox();
    }
}
