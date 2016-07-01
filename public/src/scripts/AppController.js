/**
 * Created by wesley on 6/18/16.
 */
class AppController {
    construct(conn) {
        this.conn = conn;
    }

    registerSW() {
        // Register the service-worker if it's available
        if ('serviceWorker' in navigator) {
            //noinspection JSUnresolvedVariable
            navigator.serviceWorker
                .register('/service-worker.js')
                .then(() => console.log('[Service Worker] Registered'))
                .catch((e) => console.log('[Service Worker] Failed to register!\n', e));
        }
    }

    static registerUser(username, password) {
        let packet = new Message;
        packet.type = Message.TYPE_VERIFICATION;
        packet.username = username;
        packet.payload = password;
        packet.status = Message.STATUS_SUCCESS;

        packet.addFlag('register');

        return packet;
    }

    static loginUser(username, password) {
        let packet = new Message;
        packet.type = Message.TYPE_VERIFICATION;
        packet.username = username;
        packet.payload = password;
        packet.status = Message.STATUS_SUCCESS;

        return packet;
    }
}
