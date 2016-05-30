<?php
// $_SERVER['SERVER_ADDR'] seems to be empty when using the built in webServer?
$serverAddress = $_GET['ws'] ?: $_SERVER['SERVER_ADDR'] ?: 'localhost'; ?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset='utf-8'>
    <title>Websocket chat using Ratchet</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- Disable tap highlight on IE -->
    <meta name="msapplication-tap-highlight" content="no">

    <!-- Material Design Lite -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.1.3/material.orange-indigo.min.css">
    <script defer src="https://code.getmdl.io/1.1.3/material.min.js"></script>
    <!-- App Styling -->
    <link rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&lang=en">
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
<div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <!-- Header section containing logo -->
    <header class="mdl-layout__header mdl-color-text--white mdl-color--light-blue-700">
        <div class="mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-grid">
            <div
                class="mdl-layout__header-row mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
                <h3><a href="https://github.com/WesleyKlop/RatchetChat" class="material-icons">chat_bubble_outline</a>
                    Ratchet Chat</h3>
            </div>
            <div id="user-container">
                <!--<div hidden id="user-pic"></div>-->
                <div hidden id="user-name"></div>
                <button hidden id="sign-out"
                        class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color-text--white">
                    Sign-out
                </button>
                <button id="sign-in" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color-text--white">
                    <i class="material-icons">account_circle</i>Sign-in
                </button>
            </div>
        </div>
    </header>

    <main class="mdl-layout__content mdl-color--grey-100">
        <div id="messages-card-container" class="mdl-cell mdl-cell--12-col mdl-grid">

            <!-- Messages container -->
            <div id="messages-card"
                 class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--6-col-tablet mdl-cell--6-col-desktop">
                <div class="mdl-card__supporting-text mdl-color-text--grey-600">
                    <div id="messages">
                        <span id="message-filler"></span>
                    </div>
                    <form id="message-form" action="javascript:void(0)" autocomplete="off">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input class="mdl-textfield__input" type="text" id="message">
                            <label class="mdl-textfield__label" for="message">Message...</label>
                        </div>
                        <button id="submit" type="submit"
                                class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">
                            Send
                        </button>
                    </form>
                </div>
            </div>

            <div id="must-signin-snackbar" class="mdl-js-snackbar mdl-snackbar">
                <div class="mdl-snackbar__text"></div>
                <button class="mdl-snackbar__action" type="button"></button>
            </div>

            <dialog class="mdl-dialog" id="form-dialog">
                <h4 class="mdl-dialog__title">Please sign in</h4>
                <div class="mdl-dialog__content">
                    <p>Please enter your username and password</p>
                    <form id="form-signin" action="javascript:void(0)">
                        <div class="mdl-textfield mdl-js-textfield">
                            <input class="mdl-textfield__input" type="text" id="form-username"/>
                            <label class="mdl-textfield__label" for="form-username">Username</label>
                        </div>
                        <div class="mdl-textfield mdl-js-textfield">
                            <input class="mdl-textfield__input" type="password" id="form-password"/>
                            <label class="mdl-textfield__label" for="form-password">Password</label>
                        </div>
                        <input type="submit" id="form-submit" value="Sign In"
                               class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
                        <button id="form-cancel" class="mdl-button mdl-js-button mdl-js-ripple-effect">cancel</button>
                    </form>
                </div>
            </dialog>

        </div>
    </main>
</div>

<script>
    var socketURL = "ws://<?php echo $serverAddress; ?>:1337",
        loginURL = "./login.php";
</script>
<script src="scripts/markdown.js"></script>
<script src="scripts/main.js"></script>

</body>
</html>