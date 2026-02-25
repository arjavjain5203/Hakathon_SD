from typing import List, Dict

class ExpenseSplitter:
    def __init__(self):
        # In-memory data structures
        self.users: Dict[str, dict] = {}
        self.expenses: List[dict] = []
        self.balances: Dict[str, Dict[str, float]] = {}

    def get_users(self) -> List[dict]:
        return list(self.users.values())

    def get_expenses(self) -> List[dict]:
        return self.expenses

    def add_user(self, user_id: str, name: str) -> dict:
        if user_id in self.users:
            raise ValueError("User ID already exists")
            
        self.users[user_id] = {
            "user_id": user_id,
            "name": name
        }
        
        # Initialize balances for the new user
        if user_id not in self.balances:
            self.balances[user_id] = {}
            for existing_user in self.users:
                if existing_user != user_id:
                    self.balances[user_id][existing_user] = 0.0
                    self.balances[existing_user][user_id] = 0.0
                    
        return self.users[user_id]

    def delete_user(self, user_id: str) -> None:
        if user_id not in self.users:
            raise ValueError("User not found")
            
        del self.users[user_id]
        
        if user_id in self.balances:
            del self.balances[user_id]
            
        for other_id in self.balances:
            if user_id in self.balances[other_id]:
                del self.balances[other_id][user_id]

    def _net_balances(self, person1: str, person2: str) -> None:
        """Nets the balances between two users."""
        owes_2 = self.balances[person1].get(person2, 0.0)
        owes_1 = self.balances[person2].get(person1, 0.0)
        
        if owes_2 > owes_1:
            self.balances[person1][person2] = round(owes_2 - owes_1, 2)
            self.balances[person2][person1] = 0.0
        elif owes_1 > owes_2:
            self.balances[person2][person1] = round(owes_1 - owes_2, 2)
            self.balances[person1][person2] = 0.0
        else:
            self.balances[person1][person2] = 0.0
            self.balances[person2][person1] = 0.0

    def add_expense(self, expense_id: str, description: str, total_amount: float, paid_by: str, participants: List[str]) -> dict:
        if paid_by not in self.users:
            raise ValueError(f"Payer {paid_by} not found")
            
        if not participants:
            raise ValueError("Participants list cannot be empty")
            
        unique_participants = list(set(participants))
        
        for p in unique_participants:
            if p not in self.users:
                raise ValueError(f"Participant {p} not found")
                
        expense = {
            "expense_id": expense_id,
            "description": description,
            "total_amount": round(total_amount, 2),
            "paid_by": paid_by,
            "participants": unique_participants
        }
        
        self.expenses.append(expense)
        
        # Calculate split
        split_amount = round(total_amount / len(unique_participants), 2)
        
        for participant in unique_participants:
            if participant != paid_by:
                self.balances[participant][paid_by] += split_amount
                self._net_balances(participant, paid_by)
                
        return expense

    def get_balances(self) -> List[dict]:
        user_balances = []
        for user_id, user_info in self.users.items():
            net = 0.0
            
            # Calculate what others owe to this user
            for other_id in self.balances:
                net += self.balances[other_id].get(user_id, 0.0)
                
            # Calculate what this user owes to others
            for other_id, amount in self.balances[user_id].items():
                net -= amount
                
            user_balances.append({
                "user_id": user_id,
                "name": user_info['name'],
                "net_balance": round(net, 2)
            })
            
        return user_balances

# Global instance
splitter = ExpenseSplitter()
