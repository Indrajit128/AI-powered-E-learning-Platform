# TODO

- Backend seeds expanded: appended 11 DSA/algorithm challenges to server/db/seeds/coding_questions.json covering:
  - Linked List: Reverse Linked List, Detect Cycle in Linked List
  - Graph: Number of Islands, Course Schedule (Topological Sort)
  - Queue/Deque: Sliding Window Maximum
  - Searching/Sorting: Binary Search, Kth Largest Element
  - Hashing: Longest Consecutive Sequence
  - Greedy: Jump Game
  - Others: Reverse Linked List (array-style), etc.

- Next actions:
  1. Reseed DB: cd server && node db/apply_schema.js
  2. Start server: npm install && npm start (in server folder)
  3. Start frontend: npm install && npm run dev (in frontend folder)
  4. Test UI filters and challenge execution on /coding-challenges
  5. Record results here and mark completed items.

Current progress: 4/5 complete (UI updated, DSA seeds created as coding_questions_dsa.json, backend seeds appended).