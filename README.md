# Split It - Simple Expense Splitter Application

Split It is a full-stack, minimalistic, and modern MVP for splitting expenses among friends. Built using React mapping against a pure Python and Flask backend utilizing in-memory dictionaries. No external database or authentication required.

## Features Requirements Fulfilled
* **Create Users:** Add users with a `name` via the beautifully designed UI.
* **Add Expense:** Easily track expenses specifying the `description`, `total_amount`, the *payer*, and *participants*.
* **Smart Equal Splitting:** Expenses split uniformly among participants with balances rounded to 2 decimal places.
* **Intelligent Netting:** Reduces multi-directional debts dynamically (e.g. if A owes B ₹100 and B owes A ₹50, it simplifies to A owes B ₹50).
* **View Expenses & Balances:** All historical expenses listed nicely. Real-time net balances displayed in `Alice owes Bob ₹250` format with colored emphasis.
* **Stunning Yet Simple UI:** Vanilla CSS powered user interface without external component libraries like Tailwind or Bootstrap. Elegant animations and dark-mode glassmorphism.

---

## Installation & Setup instructions

### Prerequisites
- Node.js & npm (for the frontend)
- Python 3.8+ (for the backend)
- Virtual Environment tool (like `venv`)

### 1. Setting Up the Backend
We recommend using a Python Virtual Environment to keep dependencies isolated structure.

```bash
# Navigate to backend directory
cd backend

# Create and activate a Virtual Environment
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run the Flask API Server (it runs on http://localhost:5000)
python app.py
```

### 2. Setting Up the Frontend
Open a new terminal window / session.

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server (usually runs on http://localhost:5173)
npm run dev
```

Navigate to `http://localhost:5173/` in your browser.

---

## Testing & Correctness Verification (Sample Scenario)

The system works by computing debts accurately according to participant inclusion. You can test correctness directly from the UI or via HTTP API calls. Here is an expected testing payload flow using cURL to prove correctness of the core logic processing:

### 1. Adding Users
```bash
curl -X POST http://localhost:5000/users -H "Content-Type: application/json" -d '{"name": "Alice"}'
curl -X POST http://localhost:5000/users -H "Content-Type: application/json" -d '{"name": "Bob"}'
curl -X POST http://localhost:5000/users -H "Content-Type: application/json" -d '{"name": "Charlie"}'
```
*Take note of the `user_id`s given in the responses, let us call them `$ALICE_ID`, `$BOB_ID`, `$CHARLIE_ID`.*

### 2. Add an Expense (Paid by Alice, split equally between Alice, Bob, and Charlie)
```bash
curl -X POST http://localhost:5000/expenses -H "Content-Type: application/json" -d '{
  "description": "Lunch",
  "total_amount": 300,
  "paid_by": "'$ALICE_ID'",
  "participants": ["'$ALICE_ID'", "'$BOB_ID'", "'$CHARLIE_ID'"]
}'
```
**Expected Balances (`GET /balances`):**
Bob owes Alice ₹100.00
Charlie owes Alice ₹100.00

### 3. Add reverse/netting expense (Paid by Bob, split among all 3)
```bash
curl -X POST http://localhost:5000/expenses -H "Content-Type: application/json" -d '{
  "description": "Cab Ride",
  "total_amount": 150,
  "paid_by": "'$BOB_ID'",
  "participants": ["'$ALICE_ID'", "'$BOB_ID'", "'$CHARLIE_ID'"]
}'
```
**Explanation:** 
* Total is 150. Splitting 3 ways = 50 each. 
* Alice owes Bob 50. Charlie owes Bob 50.
* Previously Bob owed Alice 100. So we net 50 against Bob -> Alice. Bob's debt to Alice drops to 50. Alice no longer owes Bob.
* Charlie owed Alice 100 before, and now Charlie also owes Bob 50.
**Expected Net Balances (`GET /balances`):**
- Bob owes Alice ₹50.00
- Charlie owes Alice ₹100.00
- Charlie owes Bob ₹50.00

Everything operates directly over dictionaries utilizing O(1) references seamlessly.
