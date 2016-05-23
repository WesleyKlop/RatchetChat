-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
-- Contains all tables needed for everything --
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
CREATE TABLE banned_users
(
  user_id INT(11) PRIMARY KEY NOT NULL,
  reason  TEXT
);

CREATE TABLE banned_words
(
  id   INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  word VARCHAR(255) UNIQUE                NOT NULL
);

CREATE TABLE chat_log
(
  id       INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  datetime TIMESTAMP                          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id  INT(11)                            NOT NULL,
  message  TEXT                               NOT NULL
)