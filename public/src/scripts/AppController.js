/**
 * Created by wesley on 6/18/16.
 */
class AppController {
    construct() {

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
}
