-- Banned users
CREATE TABLE banned_users
(
  user_id INT(11) PRIMARY KEY NOT NULL,
  reason  TEXT
);

-- Banned words
CREATE TABLE banned_words
(
  id          INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
  bad_word    VARCHAR(255)        NOT NULL,
  replacement VARCHAR(255)                 DEFAULT 'bobba'
);
CREATE UNIQUE INDEX word ON banned_words (bad_word);

-- Chat log
CREATE TABLE chat_log
(
  id       INT(11) PRIMARY KEY                   NOT NULL AUTO_INCREMENT,
  datetime TIMESTAMP DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
  user_id  INT(11)                               NOT NULL,
  message  TEXT                                  NOT NULL
);

-- Users table
CREATE TABLE users
(
  user_id     INT(11) PRIMARY KEY NOT NULL,
  common_name VARCHAR(255)        NOT NULL
);

-- Only run this when using the database authenticator
ALTER TABLE users
    ADD password_hash VARCHAR(255);
