DROP TABLE IF EXISTS jokes;

CREATE TABLE jokes(
    id SERIAL PRIMARY KEY,
    type VARCHAR ( 255 ),
    setup VARCHAR(255),
    punchline VARCHAR(255));