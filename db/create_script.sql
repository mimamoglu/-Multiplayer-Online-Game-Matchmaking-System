-- CREATE DB TABLES
CREATE EXTENSION IF NOT EXISTS plpgsql;
-- Create Region table
CREATE TABLE Region (
    RegionID VARCHAR(10) PRIMARY KEY,
    RegionName VARCHAR(50) NOT NULL
);

-- Create Gamemode table
CREATE TABLE Gamemode (
    GameModelID VARCHAR(10) PRIMARY KEY,
    ModeName VARCHAR(50) NOT NULL,
    MaxPlayers INTEGER NOT NULL
);

-- Create Server table
CREATE TABLE Server (
    ServerIP VARCHAR(15) PRIMARY KEY,
    Status VARCHAR(50),
    RegionID VARCHAR(10)
);

-- Create Player table
CREATE TABLE Player (
    PlayerID VARCHAR(10) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL,
    SkillRating INTEGER NOT NULL,
    GamesPlayed INTEGER NOT NULL,
    WinRate FLOAT NOT NULL,
    ServerIP VARCHAR(15)
);

-- Create MatchmakingQueue table
CREATE TABLE MatchmakingQueue (
    QueueID VARCHAR(10) PRIMARY KEY,
    PlayerID VARCHAR(10),
    PreferredGameModelID VARCHAR(10),
    JoinTime TIMESTAMP NOT NULL,
    Status VARCHAR(50)
);

-- Create Blacklist table
CREATE TABLE Blacklist (
    BlacklistID VARCHAR(10) PRIMARY KEY,
    PlayerID VARCHAR(10),
    ReportCount INTEGER DEFAULT 0,
    LastReportDate TIMESTAMP,
    SuspiciousActivityScore INTEGER DEFAULT 0
);

-- Create Ranking table
CREATE TABLE Ranking (
    RankingID VARCHAR(10) PRIMARY KEY,
    PlayerID VARCHAR(10),
    RankLevel VARCHAR(50),
    WinCount INTEGER,
    LoseCount INTEGER,
    Points INTEGER,
    LastUpdated TIMESTAMP
);
-- Create GameSession table
CREATE TABLE GameSession (
    GameSessionID VARCHAR(10) PRIMARY KEY,
    StartTime TIMESTAMP,
    EndTime TIMESTAMP,
    GameModelID VARCHAR(10),
    RegionID VARCHAR(10),
    SessionStatus VARCHAR(50)
);

-- Create SessionParticipant table
CREATE TABLE SessionParticipant (
    SessionID VARCHAR(10) PRIMARY KEY,
    PlayerID VARCHAR(10),
    MatchID VARCHAR(10)
);

-- Add foreign key constraints

-- Server references Region
ALTER TABLE Server
ADD CONSTRAINT fk_server_region FOREIGN KEY (RegionID) REFERENCES Region(RegionID);

-- Player references Server
ALTER TABLE Player
ADD CONSTRAINT fk_player_server FOREIGN KEY (ServerIP) REFERENCES Server(ServerIP);

-- MatchmakingQueue references Player and Gamemode
ALTER TABLE MatchmakingQueue
ADD CONSTRAINT fk_queue_player FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
ADD CONSTRAINT fk_queue_gamemode FOREIGN KEY (PreferredGameModelID) REFERENCES Gamemode(GameModelID);

-- Blacklist references Player
ALTER TABLE Blacklist
ADD CONSTRAINT fk_blacklist_player FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID);

-- Ranking references Player
ALTER TABLE Ranking
ADD CONSTRAINT fk_ranking_player FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID);

-- GameSession references Gamemode and Region
ALTER TABLE GameSession
ADD CONSTRAINT fk_gamesession_gamemode FOREIGN KEY (GameModelID) REFERENCES Gamemode(GameModelID),
ADD CONSTRAINT fk_gamesession_region FOREIGN KEY (RegionID) REFERENCES Region(RegionID);

-- SessionParticipant references Player and GameSession
ALTER TABLE SessionParticipant
ADD CONSTRAINT fk_sessionparticipant_player FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
ADD CONSTRAINT fk_sessionparticipant_session FOREIGN KEY (SessionID) REFERENCES GameSession(GameSessionID);

-- POPULATE DB

-- Populate Region with more entries
INSERT INTO Region (RegionID, RegionName)
VALUES
    ('R001', 'North America'),
    ('R002', 'Europe'),
    ('R003', 'Asia'),
    ('R004', 'South America'),
    ('R005', 'Australia'),
    ('R006', 'Africa'),
    ('R007', 'Middle East'),
    ('R008', 'Antarctica'),
    ('R009', 'Central America'),
    ('R010', 'Caribbean'),
    ('R011', 'Eastern Europe'),
    ('R012', 'Western Europe'),
    ('R013', 'Northern Europe'),
    ('R014', 'Southern Europe'),
    ('R015', 'East Asia'),
    ('R016', 'Southeast Asia'),
    ('R017', 'South Asia'),
    ('R018', 'Central Asia'),
    ('R019', 'North Africa'),
    ('R020', 'Sub-Saharan Africa'),
    ('R021', 'Oceania'),
    ('R022', 'Polynesia'),
    ('R023', 'Micronesia'),
    ('R024', 'Melanesia'),
    ('R025', 'Arctic Region');

-- Populate Gamemode
INSERT INTO Gamemode (GameModelID, ModeName, MaxPlayers)
VALUES
    ('GM001', 'Solo', 1),
    ('GM002', 'Team', 6),
    ('GM003', 'Battle Royale', 20),
    ('GM004', 'Co-op', 4),
    ('GM005', 'Deathmatch', 10);

-- Populate Server
DO $$
DECLARE
    server_ip_base TEXT := '192.168.';
    region_ids TEXT[] := ARRAY['R001', 'R002', 'R003', 'R004', 'R005'];
    new_ip TEXT;
BEGIN
    FOR i IN 1..1000 LOOP
        -- Generate unique ServerIP
        LOOP
            new_ip := CONCAT(server_ip_base, FLOOR(RANDOM() * 100)::TEXT, '.', FLOOR(RANDOM() * 255)::TEXT);
            EXIT WHEN NOT EXISTS (SELECT 1 FROM Server WHERE ServerIP = new_ip); -- Ensure uniqueness
        END LOOP;

        -- Insert unique ServerIP
        INSERT INTO Server (ServerIP, Status, RegionID)
        VALUES (
            new_ip,
            CASE
                WHEN RANDOM() < 0.6 THEN 'Active'
                WHEN RANDOM() < 0.8 THEN 'Maintenance'
                ELSE 'Inactive'
            END,
            region_ids[FLOOR(RANDOM() * array_length(region_ids, 1) + 1)]
        );
    END LOOP;
END $$;

-- Populate Player
BEGIN
    FOR i IN 1..10000 LOOP
        IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID = CONCAT('P', LPAD(i::TEXT, 4, '0'))) THEN
            INSERT INTO Player (PlayerID, Username, SkillRating, GamesPlayed, WinRate, ServerIP)
            VALUES (
                CONCAT('P', LPAD(i::TEXT, 4, '0')),  -- PlayerID: 'P0001', etc.
                CONCAT('Player', i),                 -- Username: 'Player1', etc.
                0,                                   -- SkillRating will be updated later
                FLOOR(RANDOM() * 1000 + 1),          -- GamesPlayed: 1-1000
                ROUND(RANDOM() * 100 * 100) / 100.0, -- WinRate: Rounded to 2 decimal places
                (SELECT ServerIP FROM Server WHERE Status IN ('Active', 'Inactive') ORDER BY RANDOM() LIMIT 1) -- Random ServerIP, excluding Maintenance
            );
        END IF;
    END LOOP;
END $$;

-- Populate Ranking
DO $$
BEGIN
    FOR i IN 1..10000 LOOP  -- Assign rankings to all players
        IF NOT EXISTS (SELECT 1 FROM Ranking WHERE RankingID = CONCAT('RANK', LPAD(i::TEXT, 4, '0'))) THEN
            INSERT INTO Ranking (RankingID, PlayerID, RankLevel, Points, LastUpdated)
            VALUES (
                CONCAT('RANK', LPAD(i::TEXT, 4, '0')),  -- RankingID: 'RANK0001', etc.
                CONCAT('P', LPAD(i::TEXT, 4, '0')),     -- Matches PlayerID in Player table
                CASE                                    -- Assign random rank levels
                    WHEN RANDOM() < 0.2 THEN 'Bronze'
                    WHEN RANDOM() < 0.4 THEN 'Silver'
                    WHEN RANDOM() < 0.6 THEN 'Gold'
                    WHEN RANDOM() < 0.8 THEN 'Platinum'
                    ELSE 'Diamond'
                END,
                FLOOR(RANDOM() * 5000 + 1),            -- Points: 1-5000
                NOW() - INTERVAL '1 DAY' * FLOOR(RANDOM() * 30) -- Random LastUpdated within 30 days
            );
        END IF;
    END LOOP;
END $$;

-- Set Skill Rating
UPDATE Player
SET SkillRating = ROUND(
    (SELECT Points FROM Ranking WHERE Ranking.PlayerID = Player.PlayerID) / NULLIF(GamesPlayed, 0) * 10, 2
)
WHERE PlayerID IN (SELECT PlayerID FROM Ranking);


-- Populate MatchmakingQueue
DO $$
DECLARE
    player_id TEXT;         -- Variable to hold a random PlayerID
    new_queue_id TEXT;      -- Variable to generate a unique QueueID
BEGIN
    FOR i IN 1..5000 LOOP  -- Generate up to 5000 unique entries
        -- Select a random PlayerID
        SELECT PlayerID INTO player_id
        FROM Player
        ORDER BY RANDOM()
        LIMIT 1;

        -- Generate a new unique QueueID
        new_queue_id := CONCAT('Q', LPAD(i::TEXT, 4, '0'));

        -- Ensure the PlayerID is not already in the queue and QueueID is unique
        IF NOT EXISTS (SELECT 1 FROM MatchmakingQueue WHERE PlayerID = player_id)
           AND NOT EXISTS (SELECT 1 FROM MatchmakingQueue WHERE QueueID = new_queue_id) THEN
            INSERT INTO MatchmakingQueue (QueueID, PlayerID, PreferredGameModelID, JoinTime, Status)
            VALUES (
                new_queue_id,                         -- Unique QueueID
                player_id,                            -- Random PlayerID
                (SELECT GameModelID FROM Gamemode ORDER BY RANDOM() LIMIT 1), -- Random GameModelID
                NOW() - INTERVAL '1 MINUTE' * FLOOR(RANDOM() * 1440),         -- Random JoinTime
                CASE
                    WHEN RANDOM() < 0.5 THEN 'Waiting'
                    ELSE 'Matched'
                END
            );
        END IF;
    END LOOP;
END $$;

-- Populate Blacklist
DO $$
BEGIN
    FOR i IN 1..2000 LOOP  -- Populate blacklist for 2000 random players
        IF NOT EXISTS (SELECT 1 FROM Blacklist WHERE BlacklistID = CONCAT('B', LPAD(i::TEXT, 4, '0'))) THEN
            INSERT INTO Blacklist (BlacklistID, PlayerID, ReportCount, LastReportDate, SuspiciousActivityScore)
            VALUES (
                CONCAT('B', LPAD(i::TEXT, 4, '0')),  -- BlacklistID: 'B0001', etc.
                (SELECT PlayerID FROM Player ORDER BY RANDOM() LIMIT 1), -- Random PlayerID
                FLOOR(RANDOM() * 20),                  -- ReportCount: 0-20
                NOW() - INTERVAL '1 DAY' * FLOOR(RANDOM() * 30), -- Random LastReportDate
                FLOOR(RANDOM() * 100)                  -- SuspiciousActivityScore: 0-100
            );
        END IF;
    END LOOP;
END $$;