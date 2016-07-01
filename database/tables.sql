CREATE TABLE banned_users
(
    user_id INT(11) PRIMARY KEY NOT NULL,
    reason  TEXT
);
CREATE TABLE banned_words
(
    id          INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    bad_word    VARCHAR(255)        NOT NULL,
    replacement VARCHAR(255)                 DEFAULT 'bobba'
);
CREATE UNIQUE INDEX word ON banned_words (bad_word);
CREATE TABLE chat_log
(
    id       INT(11) PRIMARY KEY                   NOT NULL AUTO_INCREMENT,
    datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP   NOT NULL,
    user_id  INT(11)                               NOT NULL,
    message  TEXT                                  NOT NULL
);
CREATE TABLE users
(
    user_id       INT(11) PRIMARY KEY NOT NULL,
    common_name   VARCHAR(255)        NOT NULL,
    password_hash VARCHAR(255)
);
