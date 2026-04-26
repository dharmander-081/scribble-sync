# Product Requirements Document: Skribbl.io Clone (Multiplayer Drawing & Guessing Game)

## 1. Executive Summary
**Product Name:** ScribbleSync (Working Title)
**Product Vision:** A highly engaging, real-time multiplayer drawing and guessing game where players compete to draw words and guess others' drawings as fast as possible. 
**Target Audience:** Casual gamers, remote teams, streamers, and friends looking for a quick, interactive party game accessible via web and mobile browsers.
**Objective:** Deliver a seamless, low-latency multiplayer experience that supports real-time canvas synchronization, chat-based guessing, and dynamic scoring across devices.

## 2. User Stories
- **As a Player**, I want to easily join a room using a simple code or link, so I can play with my friends quickly.
- **As a Host**, I want to create a private room and configure game settings (rounds, draw time, custom words), so I can tailor the experience for my group.
- **As a Drawer**, I want to choose from multiple word options and use various drawing tools (colors, brush sizes, fill, undo, clear), so I can accurately depict my word.
- **As a Guesser**, I want to type my guesses into a chat box and receive immediate feedback, so I can compete for the highest score.
- **As a Player**, I want to see progressive hints (like blank spaces and slowly revealed letters) when I am guessing, so I don't get permanently stuck on hard words.

## 3. Functional Requirements

### 3.1 Room & Lobby System
- **Room Creation:** 
  - Users can create Public or Private rooms.
  - Private rooms generate a unique 6-8 character alphanumeric code and a shareable invite link.
- **Joining/Leaving Logic:**
  - Players enter a username and optionally an avatar to join.
  - The system must broadcast join/leave events to update the room's player list in real-time.
  - Maximum player limit per room (e.g., 10-12 players, configurable by host).
- **Lobby State:**
  - Before the game starts, players wait in the lobby.
  - Host has the "Start Game" button.
  - Non-hosts see a "Waiting for host to start..." message.

### 3.2 Game Settings
- **Rounds:** Configurable number of rounds (e.g., 2, 3, 4, 5, 10). One round equals every player taking one turn to draw.
- **Draw Time:** Configurable timer per turn (e.g., 30s, 45s, 60s, 80s, 120s).
- **Word Packs/Language:** Support for standard English word packs, with the ability to add custom words (comma-separated list).

### 3.3 Turn Rotation & Word Selection
- **Turn Rotation:** 
  - The server manages a queue of players. Turns iterate sequentially.
  - A "Round" increments when the queue completes one full cycle.
- **Word Selection Phase:**
  - The selected Drawer receives 5 random word options of varying difficulty.
  - Drawer has 15 seconds to pick a word. If no selection is made, the server auto-selects a word.
  - Guessers see "Player X is choosing a word...".

### 3.4 Real-Time Drawing Canvas
- **Tools:** Pen, Eraser, Fill bucket, Clear Canvas, Undo.
- **Attributes:** Color palette (standard ~16 colors), Brush size (small, medium, large, extra-large).
- **Sync:** 
  - Canvas coordinates and tool actions must stream continuously via WebSockets to all clients.
  - New joiners must receive the current state of the canvas upon entry.

### 3.5 Chat & Guess Validation System
- **Chat Feed:** 
  - Displays system messages (joins, leaves, turn changes) and player chat messages.
- **Validation Engine:**
  - Every message sent by a "Guesser" is intercepted and checked against the current target word (case-insensitive, ignoring trailing/leading whitespace).
  - **Fuzzy Matching / Close Guesses:** If a guess has an edit distance (Levenshtein distance) of 1 or 2 from the target word, display a private system message to the guesser: *"X is close!"* (Does not award points).
- **Correct Guess Flow:**
  - If a guess matches exactly:
    - Message is **NOT** broadcasted to the general chat.
    - System broadcasts: *"[Player] guessed the word!"*
    - The player's state is updated to `hasGuessedCorrectly = true`.
    - Player receives points.

### 3.6 Scoring System
- **Guessers:** Points are inversely proportional to the time taken to guess. 
  - Base formula: `(Remaining Time / Total Draw Time) * Max Guesser Points`.
- **Drawer:** Earns points based on how many players guessed the word correctly. 
  - If 0 players guess, Drawer gets 0 points.
  - If 100% of players guess, Drawer gets maximum points.
- **Streak/Bonus:** Bonus points for being the very first person to guess correctly.

### 3.7 Timer & Word Hint System
- **Round Timer:** Server authoritative countdown synchronized to clients.
- **Hints:** 
  - Show the number of characters as underscores (e.g., `_ _ _ _ _` for "APPLE").
  - Reveal random letters at specific time intervals (e.g., at 50% time remaining, reveal one letter; at 25%, reveal another).

## 4. Non-Functional Requirements

### 4.1 Multiplayer & Real-Time Architecture
- **Protocol:** WebSockets (via Socket.io or native WebSockets) for low-latency bidirectional communication.
- **Server Authority:** The backend must be the source of truth for the game state, timer, scoring, and turn management to prevent client-side manipulation.
- **State Synchronization:**
  - Clients should render drawing lines using interpolation/smoothing to handle minor network jitter.
  - Delta updates for canvas (send coordinates of strokes, not the entire image every frame).

### 4.2 Scalability
- **Room Distribution:** Architecture must support scaling horizontally. Utilize a Pub/Sub system (e.g., Redis Pub/Sub) if multi-server instances are required so WebSocket servers can route room events properly.
- **Memory Management:** Canvas history for active rounds should be stored in memory (or Redis) and purged immediately when the turn ends to prevent memory leaks.

### 4.3 UI/UX Requirements
- **Layout Structure:**
  - Desktop: Left/Top (Player List & Scores), Center (Canvas & Tools), Right/Bottom (Chat & Guesses).
  - Mobile: Stacked layout (Header with Timer/Word info -> Canvas -> Chat -> Tools in a toggleable drawer).
- **Visual Feedback:**
  - Green highlights in the player list for those who guessed correctly.
  - Audio cues for turn start, tick-down timer (last 5 seconds), and correct guesses.

### 4.4 Anti-Cheat & Moderation
- **Rate Limiting:** Throttle chat messages (e.g., max 3 messages per second per user) to prevent spam-guessing bots.
- **Profanity Filter:** Optional togglable profanity filter for usernames and chat (excluding the actual word guesses).

## 5. System Flow (Gameplay Loop)
1. **Init:** Host creates room -> Players join -> Host starts game.
2. **Round Start:** Server announces Round 1.
3. **Turn Init:** Server selects Drawer -> Sends 5 words to Drawer -> Guessers see waiting screen.
4. **Drawing Phase:** Drawer selects word -> Server starts timer -> Drawer draws -> Clients receive drawing events.
5. **Guessing Phase:** Guessers submit text -> Server validates -> Server updates scores/chat.
6. **Turn End:** Triggered when time runs out OR everyone guesses correctly -> Server reveals word -> Shows turn standings.
7. **Next Turn:** Loop back to Step 3 for the next player.
8. **Game Over:** Max rounds reached -> Show podium/final leaderboard -> Option to play again (returns to lobby).

## 6. Edge Cases & Error Handling
- **Drawer Disconnects:** 
  - *Action:* Immediately end the current turn, reveal the word, award points to those who already guessed, and move to the next player's turn.
- **Guesser Disconnects:**
  - *Action:* Remove from player list. If their removal means all remaining guessers have guessed correctly, end the turn early.
- **Reconnection:**
  - *Action:* If a player drops and returns within a short window (e.g., using a session token in local storage), restore their score and state. If they reconnect during a round, fetch the current canvas state and timer.
- **No One Guesses Correctly:**
  - *Action:* Turn ends, word is revealed. Drawer gets 0 points.
- **Empty Rooms:**
  - *Action:* If all players leave, immediately destroy the room instance in memory.
- **Late Joiners:**
  - *Action:* Added as spectators for the current turn with 0 score. They can participate in the next turn.

## 7. Success Metrics
- **Performance:** WebSocket latency < 100ms for 95% of users. 
- **Engagement:** Average game completion rate > 80% (rooms that start a game finish all rounds).
- **Reliability:** Server uptime 99.9%, zero state-desync issues reported.
- **Growth:** Peak Concurrent Users (CCU) handling capacity tested to at least 10,000 users.
