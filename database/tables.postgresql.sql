-- Banned users
CREATE TABLE banned_users
(
  user_id INT PRIMARY KEY NOT NULL,
  reason  TEXT
);

-- Banned words
CREATE SEQUENCE banned_words_seq;

CREATE TABLE banned_words
(
  id          INT PRIMARY KEY NOT NULL DEFAULT NEXTVAL('banned_words_seq'),
  bad_word    VARCHAR(255)    NOT NULL,
  replacement VARCHAR(255)             DEFAULT 'bobba'
);
CREATE UNIQUE INDEX word ON banned_words (bad_word);

-- Chat log
CREATE SEQUENCE chat_log_seq;

CREATE TABLE chat_log
(
  id       INT PRIMARY KEY                          NOT NULL DEFAULT NEXTVAL('chat_log_seq'),
  datetime TIMESTAMP(0) DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
  user_id  INT                                      NOT NULL,
  message  TEXT                                     NOT NULL
);

-- Users table
CREATE TABLE users
(
  user_id     INT PRIMARY KEY NOT NULL,
  common_name VARCHAR(255)    NOT NULL
);