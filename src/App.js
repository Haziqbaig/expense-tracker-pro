import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, LogOut, DollarSign, TrendingDown, TrendingUp, Calendar, Filter, X, Check, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

const ExpenseTracker = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState('login');
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [toasts, setToasts] = useState([]);
  
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'other'];
  
  const categoryColors = {
    food: 'from-orange-500 to-red-500',
    transport: 'from-blue-500 to-cyan-500',
    entertainment: 'from-purple-500 to-pink-500',
    utilities: 'from-yellow-500 to-orange-500',
    healthcare: 'from-green-500 to-emerald-500',
    shopping: 'from-pink-500 to-rose-500',
    other: 'from-gray-500 to-slate-500'
  };

  // Toast notification system
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const Toast = ({ id, message, type }) => {
    const styles = {
      success: {
        gradient: 'from-green-500 to-emerald-600',
        icon: <CheckCircle className="w-6 h-6" />,
        border: 'border-green-400'
      },
      error: {
        gradient: 'from-red-500 to-rose-600',
        icon: <XCircle className="w-6 h-6" />,
        border: 'border-red-400'
      },
      warning: {
        gradient: 'from-yellow-500 to-orange-600',
        icon: <AlertCircle className="w-6 h-6" />,
        border: 'border-yellow-400'
      },
      info: {
        gradient: 'from-blue-500 to-cyan-600',
        icon: <Info className="w-6 h-6" />,
        border: 'border-blue-400'
      }
    };

    const style = styles[type];

    return (
      <div className={`bg-gradient-to-r ${style.gradient} rounded-lg shadow-2xl p-4 mb-3 border-2 ${style.border} transform transition-all duration-300 animate-slideIn flex items-center gap-3`}>
        <div className="text-white">
          {style.icon}
        </div>
        <p className="text-white font-semibold flex-1">{message}</p>
        <button
          onClick={() => removeToast(id)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
      loadExpenses(JSON.parse(user).email);
    }
  }, []);

  const loadExpenses = (email) => {
    const userExpenses = localStorage.getItem(`expenses_${email}`);
    if (userExpenses) {
      setExpenses(JSON.parse(userExpenses));
    }
  };

  const saveExpenses = (email, expensesData) => {
    localStorage.setItem(`expenses_${email}`, JSON.stringify(expensesData));
  };

  const handleAuth = (e) => {
    e.preventDefault();
    
    if (showAuthForm === 'signup') {
      if (!authForm.name || !authForm.email || !authForm.password) {
        showToast('Please fill in all fields!', 'error');
        return;
      }
      
      if (authForm.password.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.email === authForm.email)) {
        showToast('Email already registered! Please login.', 'warning');
        return;
      }
      
      const newUser = { name: authForm.name, email: authForm.email, password: authForm.password };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setExpenses([]);
      showToast(`Welcome aboard, ${authForm.name}! 🎉`, 'success');
    } else {
      if (!authForm.email || !authForm.password) {
        showToast('Please enter email and password!', 'error');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === authForm.email && u.password === authForm.password);
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
        loadExpenses(user.email);
        showToast(`Welcome back, ${user.name}! 👋`, 'success');
      } else {
        showToast('Invalid email or password!', 'error');
      }
    }
    
    setAuthForm({ email: '', password: '', name: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setExpenses([]);
    showToast('Logged out successfully! See you soon! 👋', 'info');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    
    if (!expenseForm.title || !expenseForm.amount) {
      showToast('Please fill in title and amount!', 'error');
      return;
    }

    if (expenseForm.title.trim().length < 3) {
      showToast('Title must be at least 3 characters!', 'error');
      return;
    }

    if (parseFloat(expenseForm.amount) <= 0) {
      showToast('Amount must be greater than zero!', 'error');
      return;
    }

    if (parseFloat(expenseForm.amount) > 1000000) {
      showToast('Amount seems too large! Please check.', 'warning');
      return;
    }

    if (editingId) {
      const updatedExpenses = expenses.map(exp =>
        exp.id === editingId ? { ...expenseForm, id: editingId } : exp
      );
      setExpenses(updatedExpenses);
      saveExpenses(currentUser.email, updatedExpenses);
      setEditingId(null);
      showToast('Expense updated successfully! ✨', 'success');
    } else {
      const newExpense = { ...expenseForm, id: Date.now() };
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      saveExpenses(currentUser.email, updatedExpenses);
      showToast(`Added ${expenseForm.title} - $${parseFloat(expenseForm.amount).toFixed(2)} 💰`, 'success');
    }
    
    setExpenseForm({
      title: '',
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (expense) => {
    setExpenseForm(expense);
    setEditingId(expense.id);
    showToast('Editing expense. Make your changes! ✏️', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const expense = expenses.find(exp => exp.id === id);
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(updatedExpenses);
    saveExpenses(currentUser.email, updatedExpenses);
    showToast(`Deleted: ${expense.title} 🗑️`, 'success');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setExpenseForm({
      title: '',
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0]
    });
    showToast('Edit cancelled!', 'info');
  };

  const filteredExpenses = filterCategory === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.category === filterCategory);

  const totalExpense = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
    return acc;
  }, {});

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 max-w-md w-full">
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>

        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-2xl">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Expense Tracker Pro</h1>
            <p className="text-purple-200">Manage your finances with ease</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
            <div className="flex mb-6 gap-2">
              <button
                onClick={() => setShowAuthForm('login')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  showAuthForm === 'login'
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setShowAuthForm('signup')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  showAuthForm === 'signup'
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4">
              {showAuthForm === 'signup' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              )}
              
              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              
              <button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {showAuthForm === 'login' ? 'Login' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 max-w-md w-full">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>

      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border border-white border-opacity-20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Welcome, {currentUser?.name}!</h1>
              <p className="text-purple-200">Track your expenses efficiently</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Total Expenses</span>
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-4xl font-bold">${totalExpense.toFixed(2)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">Total Entries</span>
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-4xl font-bold">{expenses.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100">Categories</span>
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-4xl font-bold">{Object.keys(categoryTotals).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Expense Form */}
          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-20 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="w-6 h-6" />
                {editingId ? 'Edit Expense' : 'Add Expense'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 mb-2 text-sm">Title</label>
                  <input
                    type="text"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Lunch at restaurant"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-purple-900">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddExpense}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {editingId ? <Check className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  
                  {editingId && (
                    <button
                      onClick={cancelEdit}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Expenses</h2>
                
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    if (e.target.value !== 'all') {
                      showToast(`Filtered by ${e.target.value}`, 'info');
                    }
                  }}
                  className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all" className="bg-purple-900">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-purple-900">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingDown className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
                    <p className="text-purple-200 text-lg">
                      {filterCategory === 'all' 
                        ? 'No expenses yet. Start tracking!' 
                        : `No ${filterCategory} expenses found.`}
                    </p>
                  </div>
                ) : (
                  filteredExpenses.map(expense => (
                    <div
                      key={expense.id}
                      className={`bg-gradient-to-r ${categoryColors[expense.category]} bg-opacity-90 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">{expense.title}</h3>
                          <div className="flex gap-4 text-sm text-white text-opacity-90">
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                              {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                            </span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">${parseFloat(expense.amount).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="flex-1 bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;