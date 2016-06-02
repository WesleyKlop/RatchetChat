-- Banned users
CREATE TABLE banned_users
(
  user_id INTEGER PRIMARY KEY NOT NULL,
  reason  TEXT
);

-- Banned words
CREATE TABLE banned_words
(
  id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  bad_word    TEXT                              NOT NULL,
  replacement TEXT DEFAULT 'bobba'
);
CREATE UNIQUE INDEX word ON banned_words (bad_word);

-- Chat log
CREATE TABLE chat_log
(
  id       INTEGER PRIMARY KEY  AUTOINCREMENT NOT NULL,
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id  INTEGER                            NOT NULL,
  message  TEXT                               NOT NULL
);

-- Users table
CREATE TABLE users
(
  user_id     INTEGER PRIMARY KEY NOT NULL,
  common_name TEXT                NOT NULL
);