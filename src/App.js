import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Trash2, Edit2, LogOut, DollarSign, TrendingDown, TrendingUp, 
  Calendar, Filter, X, Check, CheckCircle, AlertCircle, Info, XCircle,
  Wallet, PiggyBank, Target, Search, Download, Eye, EyeOff, BarChart3,
  ArrowUpCircle, ArrowDownCircle, Coffee, Car, Gamepad2, Home, Heart,
  ShoppingCart, MoreHorizontal, Briefcase, Gift, Coins, CreditCard,
  TrendingUp as TrendIcon, FileText, Moon, Sun
} from 'lucide-react';

const ExpenseTracker = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState('login');
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [budgets, setBudgets] = useState({});
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(0);
  
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [transactionForm, setTransactionForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    tags: ''
  });

  const expenseCategories = ['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'other'];
  const incomeCategories = ['salary', 'freelance', 'business', 'investment', 'gift', 'refund', 'other'];
  
  const categoryIcons = {
    food: <Coffee className="w-5 h-5" />,
    transport: <Car className="w-5 h-5" />,
    entertainment: <Gamepad2 className="w-5 h-5" />,
    utilities: <Home className="w-5 h-5" />,
    healthcare: <Heart className="w-5 h-5" />,
    shopping: <ShoppingCart className="w-5 h-5" />,
    salary: <Briefcase className="w-5 h-5" />,
    freelance: <FileText className="w-5 h-5" />,
    business: <TrendIcon className="w-5 h-5" />,
    investment: <Coins className="w-5 h-5" />,
    gift: <Gift className="w-5 h-5" />,
    refund: <CreditCard className="w-5 h-5" />,
    other: <MoreHorizontal className="w-5 h-5" />
  };
  
  const categoryColors = {
    // Expense colors
    food: 'from-orange-500 to-red-500',
    transport: 'from-blue-500 to-cyan-500',
    entertainment: 'from-purple-500 to-pink-500',
    utilities: 'from-yellow-500 to-orange-500',
    healthcare: 'from-green-500 to-emerald-500',
    shopping: 'from-pink-500 to-rose-500',
    // Income colors
    salary: 'from-green-500 to-emerald-600',
    freelance: 'from-blue-500 to-indigo-600',
    business: 'from-purple-500 to-violet-600',
    investment: 'from-yellow-500 to-amber-600',
    gift: 'from-pink-500 to-rose-600',
    refund: 'from-cyan-500 to-teal-600',
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
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
      loadTransactions(JSON.parse(user).email);
      loadBudgets(JSON.parse(user).email);
      loadSavingsGoal(JSON.parse(user).email);
    }
  }, []);

  const loadTransactions = (email) => {
    const userTransactions = localStorage.getItem(`transactions_${email}`);
    if (userTransactions) {
      setTransactions(JSON.parse(userTransactions));
    }
  };

  const saveTransactions = (email, transactionsData) => {
    localStorage.setItem(`transactions_${email}`, JSON.stringify(transactionsData));
  };

  const loadBudgets = (email) => {
    const userBudgets = localStorage.getItem(`budgets_${email}`);
    if (userBudgets) {
      setBudgets(JSON.parse(userBudgets));
    }
  };

  const saveBudgets = (email, budgetsData) => {
    localStorage.setItem(`budgets_${email}`, JSON.stringify(budgetsData));
  };

  const loadSavingsGoal = (email) => {
    const goal = localStorage.getItem(`savingsGoal_${email}`);
    if (goal) {
      setSavingsGoal(parseFloat(goal));
    }
  };

  const saveSavingsGoal = (email, goal) => {
    localStorage.setItem(`savingsGoal_${email}`, goal.toString());
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
      
      const newUser = { 
        name: authForm.name, 
        email: authForm.email, 
        password: authForm.password,
        joinDate: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setTransactions([]);
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
        loadTransactions(user.email);
        loadBudgets(user.email);
        loadSavingsGoal(user.email);
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
    setTransactions([]);
    setBudgets({});
    setSavingsGoal(0);
    showToast('Logged out successfully! See you soon! 👋', 'info');
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    
    if (!transactionForm.title || !transactionForm.amount) {
      showToast('Please fill in title and amount!', 'error');
      return;
    }

    if (transactionForm.title.trim().length < 3) {
      showToast('Title must be at least 3 characters!', 'error');
      return;
    }

    if (parseFloat(transactionForm.amount) <= 0) {
      showToast('Amount must be greater than zero!', 'error');
      return;
    }

    if (parseFloat(transactionForm.amount) > 10000000) {
      showToast('Amount seems too large! Please check.', 'warning');
      return;
    }

    if (editingId) {
      const updatedTransactions = transactions.map(trans =>
        trans.id === editingId ? { ...transactionForm, id: editingId } : trans
      );
      setTransactions(updatedTransactions);
      saveTransactions(currentUser.email, updatedTransactions);
      setEditingId(null);
      showToast('Transaction updated successfully! ✨', 'success');
    } else {
      const newTransaction = { 
        ...transactionForm, 
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      saveTransactions(currentUser.email, updatedTransactions);
      
      const emoji = transactionForm.type === 'income' ? '💰' : '💸';
      showToast(`Added ${transactionForm.title} - $${parseFloat(transactionForm.amount).toFixed(2)} ${emoji}`, 'success');
      
      // Check budget warning
      if (transactionForm.type === 'expense' && budgets[transactionForm.category]) {
        const categoryExpenses = updatedTransactions
          .filter(t => t.type === 'expense' && t.category === transactionForm.category)
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const budget = parseFloat(budgets[transactionForm.category]);
        if (categoryExpenses > budget) {
          showToast(`⚠️ Budget exceeded for ${transactionForm.category}! Over by $${(categoryExpenses - budget).toFixed(2)}`, 'warning');
        } else if (categoryExpenses > budget * 0.8) {
          showToast(`📊 You've used ${Math.round((categoryExpenses / budget) * 100)}% of your ${transactionForm.category} budget`, 'info');
        }
      }
    }
    
    setTransactionForm({
      title: '',
      amount: '',
      type: 'expense',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      tags: ''
    });
  };

  const handleEdit = (transaction) => {
    setTransactionForm(transaction);
    setEditingId(transaction.id);
    showToast('Editing transaction. Make your changes! ✏️', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const transaction = transactions.find(trans => trans.id === id);
    const updatedTransactions = transactions.filter(trans => trans.id !== id);
    setTransactions(updatedTransactions);
    saveTransactions(currentUser.email, updatedTransactions);
    showToast(`Deleted: ${transaction.title} 🗑️`, 'success');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTransactionForm({
      title: '',
      amount: '',
      type: 'expense',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      tags: ''
    });
    showToast('Edit cancelled!', 'info');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    showToast(newMode ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'info');
  };

  const exportData = () => {
    const dataStr = JSON.stringify({
      transactions,
      budgets,
      savingsGoal,
      exportDate: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `expense_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Data exported successfully! 📥', 'success');
  };

  const setBudgetForCategory = (category, amount) => {
    const newBudgets = { ...budgets, [category]: amount };
    setBudgets(newBudgets);
    saveBudgets(currentUser.email, newBudgets);
    showToast(`Budget set for ${category}: $${amount}`, 'success');
  };

  const updateSavingsGoal = (goal) => {
    setSavingsGoal(goal);
    saveSavingsGoal(currentUser.email, goal);
    showToast(`Savings goal updated: $${goal}`, 'success');
  };

  // Filter transactions based on search, type, category, and period
  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(trans => 
        trans.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trans.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trans.tags?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(trans => trans.type === filterType);
    }
    
    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(trans => trans.category === filterCategory);
    }
    
    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      
      filtered = filtered.filter(trans => {
        const transDate = new Date(trans.date);
        
        switch(filterPeriod) {
          case 'today':
            return transDate >= startOfDay;
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return transDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return transDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            return transDate >= yearAgo;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const netBalance = totalIncome - totalExpenses;
  const savingsProgress = savingsGoal > 0 ? (netBalance / savingsGoal) * 100 : 0;
  
  const categoryExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, trans) => {
      acc[trans.category] = (acc[trans.category] || 0) + parseFloat(trans.amount);
      return acc;
    }, {});

  const categoryIncomes = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, trans) => {
      acc[trans.category] = (acc[trans.category] || 0) + parseFloat(trans.amount);
      return acc;
    }, {});

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4">
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
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .animate-slideIn {
              animation: slideIn 0.3s ease-out;
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
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
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-2xl animate-float">
                <Wallet className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                MoneyMaster Pro
              </h1>
              <p className="text-purple-200">Complete Financial Management Solution</p>
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

              <form onSubmit={handleAuth} className="space-y-4">
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
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {showAuthForm === 'login' ? 'Login to Your Account' : 'Create Your Account'}
                </button>
              </form>

              <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-white border-opacity-20">
                <div className="text-center">
                  <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-xs text-purple-200">Track Income</p>
                </div>
                <div className="text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-purple-200">Set Goals</p>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs text-purple-200">Analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'}`}>
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 max-w-md w-full">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Set Category Budgets</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenseCategories.map(category => (
                <div key={category} className="flex items-center gap-3">
                  <span className="flex items-center gap-2 flex-1 capitalize dark:text-gray-300">
                    {categoryIcons[category]}
                    {category}
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={budgets[category] || ''}
                    onChange={(e) => setBudgetForCategory(category, e.target.value)}
                    className="w-32 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Savings Goal</label>
              <input
                type="number"
                placeholder="Enter your savings goal"
                value={savingsGoal || ''}
                onChange={(e) => updateSavingsGoal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowBudgetModal(false)}
              className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border border-white border-opacity-20 dark:bg-gray-800 dark:bg-opacity-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                Welcome back, {currentUser?.name}! 
                <span className="text-2xl">👋</span>
              </h1>
              <p className="text-purple-200 dark:text-gray-300">
                Member since {new Date(currentUser?.joinDate || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                {showStats ? 'Hide' : 'Show'} Stats
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowBudgetModal(true)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <Target className="w-4 h-4" />
                Budget
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm">Total Income</span>
                <ArrowUpCircle className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
              <p className="text-xs text-green-100 mt-2">
                {transactions.filter(t => t.type === 'income').length} transactions
              </p>
            </div>
            
            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-100 text-sm">Total Expenses</span>
                <ArrowDownCircle className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-red-100 mt-2">
                {transactions.filter(t => t.type === 'expense').length} transactions
              </p>
            </div>
            
            {/* Net Balance */}
            <div className={`bg-gradient-to-br ${netBalance >= 0 ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-red-600'} rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm">Net Balance</span>
                <Wallet className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-3xl font-bold">
                {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
              </p>
              <p className="text-xs text-blue-100 mt-2">
                {netBalance >= 0 ? 'Profit' : 'Loss'}
              </p>
            </div>
            
            {/* Savings Goal */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm">Savings Goal</span>
                <PiggyBank className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-3xl font-bold">${savingsGoal.toFixed(2)}</p>
              {savingsGoal > 0 && (
                <div className="mt-2">
                  <div className="bg-purple-300 bg-opacity-30 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-500"
                      style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-purple-100 mt-1">
                    {savingsProgress.toFixed(0)}% achieved
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budget Overview */}
        {Object.keys(budgets).length > 0 && showStats && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border border-white border-opacity-20 dark:bg-gray-800 dark:bg-opacity-50">
            <h3 className="text-xl font-bold text-white mb-4">Budget Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(budgets).map(([category, budget]) => {
                const spent = categoryExpenses[category] || 0;
                const percentage = (spent / parseFloat(budget)) * 100;
                const isOverBudget = percentage > 100;
                const isNearLimit = percentage > 80 && percentage <= 100;
                
                return (
                  <div key={category} className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-white capitalize">
                        {categoryIcons[category]}
                        {category}
                      </span>
                      <span className={`text-sm font-semibold ${
                        isOverBudget ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        ${spent.toFixed(0)} / ${budget}
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {percentage.toFixed(0)}% used
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Transaction Form */}
          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-20 sticky top-8 dark:bg-gray-800 dark:bg-opacity-50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit2 className="w-6 h-6" />
                    Edit Transaction
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-6 h-6" />
                    New Transaction
                  </>
                )}
              </h2>
              
              <form onSubmit={handleAddTransaction} className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-purple-200 mb-2 text-sm dark:text-gray-300">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransactionForm({
                        ...transactionForm, 
                        type: 'income',
                        category: 'salary'
                      })}
                      className={`py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        transactionForm.type === 'income'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                    >
                      <ArrowUpCircle className="w-5 h-5" />
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionForm({
                        ...transactionForm, 
                        type: 'expense',
                        category: 'food'
                      })}
                      className={`py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        transactionForm.type === 'expense'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                    >
                      <ArrowDownCircle className="w-5 h-5" />
                      Expense
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    value={transactionForm.title}
                    onChange={(e) => setTransactionForm({...transactionForm, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={transactionForm.type === 'income' ? 'e.g., Monthly salary' : 'e.g., Lunch at restaurant'}
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm dark:text-gray-300">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm dark:text-gray-300">Category</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {(transactionForm.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                      <option key={cat} value={cat} className="bg-purple-900 dark:bg-gray-800">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm dark:text-gray-300">Date</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm dark:text-gray-300">Notes (optional)</label>
                  <textarea
                    value={transactionForm.notes}
                    onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Add any notes..."
                    rows="2"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 mb-2 text-sm dark:text-gray-300">Tags (optional)</label>
                  <input
                    type="text"
                    value={transactionForm.tags}
                    onChange={(e) => setTransactionForm({...transactionForm, tags: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="e.g., vacation, business"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`flex-1 ${
                      transactionForm.type === 'income' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                    } text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2`}
                  >
                    {editingId ? <Check className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    {editingId ? 'Update' : 'Add'} {transactionForm.type === 'income' ? 'Income' : 'Expense'}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-20 dark:bg-gray-800 dark:bg-opacity-50">
              <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all" className="bg-purple-900 dark:bg-gray-800">All Types</option>
                    <option value="income" className="bg-purple-900 dark:bg-gray-800">Income Only</option>
                    <option value="expense" className="bg-purple-900 dark:bg-gray-800">Expenses Only</option>
                  </select>
                  
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all" className="bg-purple-900 dark:bg-gray-800">All Categories</option>
                    {[...expenseCategories, ...incomeCategories].map(cat => (
                      <option key={cat} value={cat} className="bg-purple-900 dark:bg-gray-800">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all" className="bg-purple-900 dark:bg-gray-800">All Time</option>
                    <option value="today" className="bg-purple-900 dark:bg-gray-800">Today</option>
                    <option value="week" className="bg-purple-900 dark:bg-gray-800">This Week</option>
                    <option value="month" className="bg-purple-900 dark:bg-gray-800">This Month</option>
                    <option value="year" className="bg-purple-900 dark:bg-gray-800">This Year</option>
                  </select>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">
                Transactions ({filteredTransactions.length})
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
                    <p className="text-purple-200 text-lg">
                      No transactions found
                    </p>
                    <p className="text-purple-300 text-sm mt-2">
                      {searchQuery ? 'Try different search terms' : 'Start by adding your first transaction'}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className={`bg-gradient-to-r ${categoryColors[transaction.category]} bg-opacity-90 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle className="w-5 h-5 text-white" />
                            ) : (
                              <ArrowDownCircle className="w-5 h-5 text-white" />
                            )}
                            <h3 className="text-white font-bold text-lg">{transaction.title}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-white text-opacity-90">
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center gap-1">
                              {categoryIcons[transaction.category]}
                              {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                            </span>
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </div>
                          {transaction.notes && (
                            <p className="text-white text-opacity-80 text-sm mt-2">{transaction.notes}</p>
                          )}
                          {transaction.tags && (
                            <div className="flex gap-1 mt-2">
                              {transaction.tags.split(',').map((tag, index) => (
                                <span key={index} className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full text-white">
                                  #{tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-3xl font-bold text-white ${transaction.type === 'income' ? '' : ''}`}>
                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
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