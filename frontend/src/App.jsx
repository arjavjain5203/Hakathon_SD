import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);

  // Forms state
  const [newUserName, setNewUserName] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePayer, setExpensePayer] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState([]);

  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [usersRes, expRes, balRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/expenses`),
        fetch(`${API_URL}/balances`)
      ]);

      const usersData = await usersRes.json();
      const expData = await expRes.json();
      const balData = await balRes.json();

      setUsers(usersData);
      setExpenses(expData);
      setBalances(balData);
    } catch (err) {
      console.error("Error fetching data:", err);
      // Don't spam errors on initial load if backend isn't up
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    if (!newUserName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add user');
      }

      setNewUserName('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError(null);

    if (!expenseDesc.trim() || !expenseAmount || !expensePayer || expenseParticipants.length === 0) {
      setError("Please fill all expense fields and select at least one participant.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseDesc.trim(),
          total_amount: parseFloat(expenseAmount),
          paid_by: expensePayer,
          participants: expenseParticipants
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add expense');
      }

      setExpenseDesc('');
      setExpenseAmount('');
      setExpensePayer('');
      setExpenseParticipants([]);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleParticipant = (userId) => {
    setExpenseParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getUserName = (id) => {
    const user = users.find(u => u.user_id === id);
    return user ? user.name : 'Unknown';
  };

  return (
    <div className="app-container">
      <header>
        <h1>Split It</h1>
        <p style={{ color: 'var(--text-muted)' }}>Fair and simple expense sharing</p>
      </header>

      <div className="left-column">
        <div className="panel">
          <h2>Add User</h2>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g. Alice"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
              />
            </div>
            <button type="submit">Create User</button>
          </form>
        </div>

        <div className="panel">
          <h2>Add Expense</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleAddExpense}>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="Dinner, Taxi, etc."
                value={expenseDesc}
                onChange={e => setExpenseDesc(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Total Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={expenseAmount}
                onChange={e => setExpenseAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Paid By</label>
              <select
                value={expensePayer}
                onChange={e => setExpensePayer(e.target.value)}
              >
                <option value="" disabled>Select a user</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Split Among (Participants)</label>
              {users.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No users available</div>
              ) : (
                <div className="checkbox-group">
                  {users.map(u => (
                    <label key={u.user_id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={expenseParticipants.includes(u.user_id)}
                        onChange={() => toggleParticipant(u.user_id)}
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button type="submit">Add Expense</button>
          </form>
        </div>
      </div>

      <div className="right-column">
        <div className="panel">
          <h2>Current Balances</h2>
          {balances.length === 0 ? (
            <div className="empty-state">No pending balances. Everyone is settled up!</div>
          ) : (
            balances.map((b, i) => (
              <div key={i} className="balance-item">
                <span className="person-in-debt">{b.person_in_debt_name}</span>
                <span>owes</span>
                <span className="person-owed">{b.person_owed_name}</span>
                <span className="amount">₹{b.amount.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <h2>Recent Expenses</h2>
          {expenses.length === 0 ? (
            <div className="empty-state">No expenses recorded yet.</div>
          ) : (
            expenses.map(exp => (
              <div key={exp.expense_id} className="expense-item">
                <div className="expense-header">
                  <div className="expense-title">{exp.description}</div>
                  <div className="expense-amount">₹{exp.total_amount.toFixed(2)}</div>
                </div>
                <div className="expense-details">
                  Paid by <strong>{getUserName(exp.paid_by)}</strong> • Split among {exp.participants.length}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
