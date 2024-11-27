![image](https://github.com/user-attachments/assets/e1c04020-5a03-4229-97a7-02cc8352323c)

# Matchmaking System Database Design

## Overview
**Matchmaking** is a critical component of online games, significantly impacting the player experience. Our system is designed to create fair and enjoyable matches by considering factors such as **skill levels**, **game mode preferences**, and **geographic locations**. 

The goal of this project is to develop a comprehensive and efficient **database system** to manage:
- Player profiles
- Matchmaking processes
- Game sessions
- Player statistics

The database schema includes core entities like players, game modes, servers, and matchmaking queues, ensuring effective organization and seamless operation.

---

## Design Decisions
The following design decisions were made to optimize functionality and performance:

1. **Entity Separation**: Each major entity (e.g., players, servers, game modes) is stored in a separate table to ensure clear organization and easy management.
2. **Relational Integrity**: Strong foreign key relationships enforce data consistency across tables.
3. **Scalability**: The schema supports large-scale operations and can handle increased player and game session data efficiently.

---

## Database Schema
### 1. **PLAYER**
Stores player information and statistics.
- **Columns**:
  - `PlayerID (PK)`: Unique identifier for each player.
  - `Username`: Player's in-game username.
  - `SkillRating`: Player's skill level, calculated as:
    ```
    SkillRating = (Total Points Earned / Games Played) * 10
    ```
  - `GamesPlayed`: Total number of games played.
  - `WinRate`: Player's win rate (performance measure).
  - `ServerIP (FK)`: Foreign key linking to the `SERVER` table.

- **Notes**:
  - Tracks player profiles, performance metrics, and associated server information.
  - Statistics aid in matchmaking algorithms.

---

### 2. **REGION**
Defines regions where servers are located.
- **Columns**:
  - `RegionID (PK)`: Unique identifier for each region.
  - `RegionName`: Name of the region.

---

### 3. **SERVER**
Stores server information and statuses.
- **Columns**:
  - `ServerIP (PK)`: Unique server identifier.
  - `Status`: Server status (e.g., Active, Maintenance).
  - `RegionID (FK)`: Foreign key linking to the `REGION` table.

- **Notes**:
  - Tracks server health and availability for matchmaking.

---

### 4. **GAMEMODE**
Defines various game modes.
- **Columns**:
  - `GameModeID (PK)`: Unique identifier for the game mode.
  - `ModeName`: Name of the game mode (e.g., Solo, Team).
  - `MaxPlayers`: Maximum players allowed in the mode.

---

### 5. **GAMESESSION**
Tracks details of each game session.
- **Columns**:
  - `GameSessionID (PK)`: Unique identifier for the session.
  - `StartTime`: Start time of the game session.
  - `EndTime`: End time of the game session.
  - `GameModeID (FK)`: Foreign key linking to the `GAMEMODE` table.
  - `RegionID (FK)`: Foreign key linking to the `REGION` table.
  - `SessionStatus`: Current status of the session.

- **Notes**:
  - Stores up to the last **10 game sessions** per player. When a new session starts, the oldest record is deleted.

---

### 6. **SESSIONPARTICIPANT**
Links players to game sessions.
- **Columns**:
  - `SessionID (PK)`: Unique identifier for the session.
  - `MatchID`: Match identifier.
  - `PlayerID (FK)`: Foreign key linking to the `PLAYER` table.

- **Notes**:
  - Acts as a junction table connecting `PLAYER` and `GAMESESSION`.
  - Tracks session-specific player details.

---

### 7. **MATCHMAKINGQUEUE**
Manages matchmaking queues.
- **Columns**:
  - `QueueID (PK)`: Unique queue identifier.
  - `PlayerID (FK)`: Foreign key linking to the `PLAYER` table.
  - `PreferredGameModeID (FK)`: Foreign key linking to the `GAMEMODE` table.
  - `JoinTime`: Time when the player joined the queue.
  - `Status`: Current status of the queue.

---

### 8. **RANKING**
Tracks player ranks and points.
- **Columns**:
  - `RankingID (PK)`: Unique ranking identifier.
  - `PlayerID (FK)`: Foreign key linking to the `PLAYER` table.
  - `RankLevel`: Player's rank (e.g., Bronze, Gold).
  - `Points`: Points earned by the player.
  - `LastUpdated`: Last updated timestamp.

- **Notes**:
  - Rank levels:
    - Bronze: 500–750 points
    - Gold: 750–1000 points

---

### 9. **BLACKLIST**
Tracks reported and flagged players.
- **Columns**:
  - `BlacklistID (PK)`: Unique blacklist identifier.
  - `PlayerID (FK)`: Foreign key linking to the `PLAYER` table.
  - `ReportCount`: Number of reports against the player.
  - `LastReportDate`: Date of the most recent report.
  - `SuspiciousActivityScore`: Score indicating suspicious activity.

- **Notes**:
  - Blacklist checks occur every **5 matches** to optimize performance.
  - Players with a `SuspiciousActivityScore` ≥ 100 are permanently removed from the database.

---

## Entity Relationships
- **PLAYER → SERVER**: A player is connected to a server (1:1).
- **SERVER → REGION**: A server belongs to one region, but a region can host multiple servers (1:N).
- **PLAYER → MATCHMAKINGQUEUE**: Players enter a matchmaking queue to join a game (1:1).
- **GAMEMODE → MATCHMAKINGQUEUE**: Multiple players can queue for the same game mode (1:N).
- **PLAYER → RANKING**: Each player has one rank record (1:1).
- **PLAYER → BLACKLIST**: Each player has a blacklist record, even if they are not flagged (1:1).
- **SESSIONPARTICIPANT → GAMESESSION**: Connects players to game sessions (N:1).

---

## Performance Optimization
1. **Blacklist Checks**: Conducted every **5 matches** to reduce system load while maintaining security.
2. **Session Limits**: Stores only the **last 10 sessions** per player to manage data efficiently.
3. **Skill Rating Formula**: Simplified calculation to ensure real-time updates during matchmaking.

---

## Deletion Policy
- Players with `SuspiciousActivityScore` ≥ 100:
  - All records linked to their `PlayerID` are deleted across all tables.

---

This schema ensures a scalable, efficient, and fair matchmaking system that enhances the overall player experience.

