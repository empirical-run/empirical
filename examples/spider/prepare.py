import os
import sqlite3


def create_and_load_database():
    sqlite_file_name = "concert_singer.db"

    if os.path.isfile(sqlite_file_name):
        os.remove(sqlite_file_name)
    
    con = sqlite3.connect(sqlite_file_name)
    cur = con.cursor()
    # First create tables
    cur.executescript(schema)
    # Then load data
    cur.executescript(data)
    con.close()


schema = """CREATE TABLE stadium (
    stadium_id NUMERIC PRIMARY KEY,
    location TEXT,
    name TEXT,
    capacity NUMERIC,
    highest NUMERIC,
    lowest NUMERIC,
    average NUMERIC
);

CREATE TABLE singer (
    singer_id NUMERIC PRIMARY KEY,
    name TEXT,
    country TEXT,
    song_name TEXT,
    song_release_year TEXT,
    age NUMERIC,
    is_male TIMESTAMP
);

CREATE TABLE concert (
    concert_id NUMERIC PRIMARY KEY,
    concert_name TEXT,
    theme TEXT,
    stadium_id TEXT,
    year TEXT,
    FOREIGN KEY (stadium_id) REFERENCES stadium(stadium_id)
);

CREATE TABLE singer_in_concert (
    concert_id NUMERIC PRIMARY KEY,
    singer_id TEXT,
    FOREIGN KEY (singer_id) REFERENCES singer(singer_id),
    FOREIGN KEY (concert_id) REFERENCES concert(concert_id)
);"""


data = """-- INSERT INTO stadium
INSERT INTO stadium (stadium_id, location, name, capacity, highest, lowest, average) VALUES
(1, 'New York, USA', 'Madison Square Garden', 20789, 85, 70, 78),
(2, 'London, UK', 'Wembley Stadium', 90000, 92, 65, 80),
(3, 'Sydney, Australia', 'Sydney Opera House', 5738, 88, 68, 75),
(4, 'Paris, France', 'Stade de France', 81338, 90, 72, 82),
(5, 'Tokyo, Japan', 'Tokyo Dome', 55000, 87, 70, 78);

-- INSERT INTO singer
INSERT INTO singer (singer_id, name, country, song_name, song_release_year, age, is_male) VALUES
(1, 'Taylor Swift', 'USA', 'Shake It Off', '2014', 33, 0),
(2, 'Ed Sheeran', 'UK', 'Shape of You', '2017', 32, 1),
(3, 'Adele', 'UK', 'Hello', '2015', 34, 0),
(4, 'BTS', 'South Korea', 'Butter', '2021', 29, 0),
(5, 'Drake', 'Canada', "God's Plan", '2018', 36, 1);

-- INSERT INTO concert
INSERT INTO concert (concert_id, concert_name, theme, stadium_id, year) VALUES
(1, 'Reputation Tour', 'Pop', '1', '2018'),
(2, 'Divide Tour', 'Pop', '2', '2019'),
(3, '25 Tour', 'Pop', '3', '2016'),
(4, 'Love Yourself Tour', 'K-Pop', '4', '2018'),
(5, 'Scorpion Tour', 'Hip-Hop', '5', '2019');

-- INSERT INTO singer_in_concert
INSERT INTO singer_in_concert (concert_id, singer_id) VALUES
(1, '1'),
(2, '2'),
(3, '3'),
(4, '4'),
(5, '5');"""


if __name__ == "__main__":
    create_and_load_database()
