// app.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load habits from storage
    loadHabits();
    
    // Update UI
    updateUI();
});

// Global variables
let habits = [];
let editingHabitId = null;
let selectedIcon = 'fas fa-running';
let selectedWeekdays = [0, 1, 2, 3, 4, 5, 6];
let chart = null;

// Initialize the app
function initApp() {
    // Update current date display
    updateCurrentDate();
    
    // Set notification time default from storage
    const savedNotificationTime = localStorage.getItem('notificationTime');
    if (savedNotificationTime) {
        document.getElementById('notification-time').value = savedNotificationTime;
    }
}

// Update current date display
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('id-ID', options);
}

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
            
            // Update page title
            updatePageTitle(tabName);
            
            if (tabName === 'analytics') {
                updateAnalytics();
            }
        });
    });
    
    // Add habit buttons
    document.getElementById('add-habit-btn').addEventListener('click', showAddHabitModal);
    document.getElementById('mobile-add-btn').addEventListener('click', showAddHabitModal);
    
    // Content tabs (filters)
    const contentTabs = document.querySelectorAll('.content-tab');
    contentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            contentTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterHabits(this.dataset.filter);
        });
    });
    
    // Close modal
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    
    // Submit habit form
    document.getElementById('habit-form').addEventListener('submit', saveHabit);
    
    // Icon selection
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectIcon(this.dataset.icon);
        });
    });
    
    // Weekday selection
    const weekdayButtons = document.querySelectorAll('.weekday-btn');
    weekdayButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleWeekday(parseInt(this.dataset.day));
        });
    });
    
    // Analytics controls
    document.getElementById('analytics-type').addEventListener('change', updateAnalytics);
    document.getElementById('analytics-habit').addEventListener('change', updateAnalytics);
    
    // Notification time
    document.getElementById('notification-time').addEventListener('change', function() {
        localStorage.setItem('notificationTime', this.value);
    });
    
    // Clear data
    document.getElementById('clear-data').addEventListener('click', clearData);
}

// Switch tabs
function switchTab(tabName) {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });
    
    tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === tabName);
    });
}

// Update page title
function updatePageTitle(tabName) {
    const pageTitle = document.getElementById('page-title');
    
    switch (tabName) {
        case 'habits':
            pageTitle.textContent = 'Habit Saya';
            break;
        case 'analytics':
            pageTitle.textContent = 'Analitik';
            break;
        case 'settings':
            pageTitle.textContent = 'Pengaturan';
            break;
    }
}

// Show add habit modal
function showAddHabitModal() {
    const modal = document.getElementById('habit-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('habit-form');
    
    modalTitle.textContent = 'Habit Baru';
    form.reset();
    
    editingHabitId = null;
    selectedIcon = 'fas fa-running';
    selectedWeekdays = [0, 1, 2, 3, 4, 5, 6];
    
    // Reset icon selection
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.icon === selectedIcon);
    });
    
    // Reset weekday selection
    document.querySelectorAll('.weekday-btn').forEach(button => {
        button.classList.add('selected');
    });
    
    modal.classList.add('active');
}

// Show edit habit modal
function showEditHabitModal(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const modal = document.getElementById('habit-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('habit-form');
    
    modalTitle.textContent = 'Edit Habit';
    
    document.getElementById('habit-name').value = habit.name;
    document.getElementById('habit-description').value = habit.description || '';
    document.getElementById('habit-goal').value = habit.goal.amount;
    document.getElementById('habit-goal-type').value = habit.goal.type;
    document.getElementById('habit-reminder').value = habit.reminder || '';
    
    editingHabitId = habitId;
    selectedIcon = habit.icon;
    selectedWeekdays = habit.weekdays;
    
    // Update icon selection
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.icon === selectedIcon);
    });
    
    // Update weekday selection
    document.querySelectorAll('.weekday-btn').forEach(button => {
        const day = parseInt(button.dataset.day);
        button.classList.toggle('selected', selectedWeekdays.includes(day));
    });
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('habit-modal');
    modal.classList.remove('active');
}

// Select icon
function selectIcon(icon) {
    selectedIcon = icon;
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.icon === icon);
    });
}

// Toggle weekday
function toggleWeekday(day) {
    const index = selectedWeekdays.indexOf(day);
    if (index === -1) {
        selectedWeekdays.push(day);
    } else {
        selectedWeekdays.splice(index, 1);
    }
    
    document.querySelectorAll('.weekday-btn').forEach(button => {
        const buttonDay = parseInt(button.dataset.day);
        button.classList.toggle('selected', selectedWeekdays.includes(buttonDay));
    });
}

// Save habit
function saveHabit(event) {
    event.preventDefault();
    
    const name = document.getElementById('habit-name').value;
    const description = document.getElementById('habit-description').value;
    const goalAmount = parseInt(document.getElementById('habit-goal').value);
    const goalType = document.getElementById('habit-goal-type').value;
    const reminder = document.getElementById('habit-reminder').value;
    
    if (editingHabitId) {
        // Update existing habit
        const habitIndex = habits.findIndex(h => h.id === editingHabitId);
        if (habitIndex !== -1) {
            habits[habitIndex].name = name;
            habits[habitIndex].description = description;
            habits[habitIndex].icon = selectedIcon;
            habits[habitIndex].goal = {
                amount: goalAmount,
                type: goalType
            };
            habits[habitIndex].weekdays = [...selectedWeekdays];
            habits[habitIndex].reminder = reminder;
        }
    } else {
        // Create new habit
        const habit = {
            id: Date.now().toString(),
            name: name,
            description: description,
            icon: selectedIcon,
            color: getRandomColor(),
            goal: {
                amount: goalAmount,
                type: goalType
            },
            weekdays: [...selectedWeekdays],
            reminder: reminder,
            createdAt: new Date().toISOString(),
            history: {}
        };
        
        habits.push(habit);
    }
    
    saveHabits();
    updateHabitsList();
    updateAnalyticsHabitSelect();
    closeModal();
}

// Generate random color in red tones
function getRandomColor() {
    const r = Math.floor(Math.random() * (255 - 200) + 200);
    const g = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    return `rgb(${r}, ${g}, ${b})`;
}

// Load habits from storage
function loadHabits() {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    }
}

// Save habits to storage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Update UI
function updateUI() {
    updateHabitsList();
    updateAnalyticsHabitSelect();
}

// Update habits list
function updateHabitsList() {
    const habitsList = document.getElementById('habits-list');
    const activeFilter = document.querySelector('.content-tab.active').dataset.filter;
    const today = new Date();
    const dateKey = formatDateKey(today);
    const dayOfWeek = today.getDay();
    
    habitsList.innerHTML = '';
    
    if (habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <p>Belum ada habit yang dibuat. Tambahkan habit baru untuk mulai melacak!</p>
            </div>
        `;
        return;
    }
    
    const filteredHabits = habits.filter(habit => {
        if (activeFilter === 'all') {
            return habit.weekdays.includes(dayOfWeek);
        } else if (activeFilter === 'active') {
            const progress = habit.history[dateKey]?.progress || 0;
            const completed = progress >= habit.goal.amount;
            return habit.weekdays.includes(dayOfWeek) && !completed;
        } else if (activeFilter === 'completed') {
            const progress = habit.history[dateKey]?.progress || 0;
            const completed = progress >= habit.goal.amount;
            return habit.weekdays.includes(dayOfWeek) && completed;
        }
        return true;
    });
    
    if (filteredHabits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <p>Tidak ada habit yang sesuai dengan filter saat ini.</p>
            </div>
        `;
        return;
    }
    
    filteredHabits.forEach(habit => {
        const progress = habit.history[dateKey]?.progress || 0;
        const progressPercentage = Math.min(100, (progress / habit.goal.amount) * 100);
        const completed = progress >= habit.goal.amount;
        
        const habitElement = document.createElement('div');
        habitElement.className = 'habit-item';
        habitElement.innerHTML = `
            <div class="habit-header">
                <div class="habit-icon" style="background-color: ${habit.color}">
                    <i class="${habit.icon}"></i>
                </div>
                <div>
                    <h3 class="habit-name">${habit.name}</h3>
                    ${habit.description ? `<p class="habit-description">${habit.description}</p>` : ''}
                </div>
            </div>
            <div class="habit-body">
                <div class="progress-info">
                    <span class="progress-label">Progres hari ini</span>
                    <span class="progress-value">${progress}/${habit.goal.amount} ${habit.goal.type === 'count' ? 'kali' : habit.goal.type === 'minutes' ? 'menit' : ''}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="habit-actions">
                    <div class="action-btn-group">
                        ${completed ? 
                            `<button class="action-btn btn-complete" data-action="undo" data-id="${habit.id}"><i class="fas fa-undo"></i></button>` : 
                            `<button class="action-btn btn-increment" data-action="increment" data-id="${habit.id}"><i class="fas fa-plus"></i></button>`
                        }
                    </div>
                    <div class="action-btn-group">
                        <button class="action-btn" data-action="edit" data-id="${habit.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn" data-action="delete" data-id="${habit.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
        
        habitsList.appendChild(habitElement);
        
        // Add event listeners to action buttons
        const actionButtons = habitElement.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action;
                const habitId = this.dataset.id;
                
                switch (action) {
                    case 'increment':
                        incrementHabit(habitId);
                        break;
                    case 'undo':
                        undoHabit(habitId);
                        break;
                    case 'edit':
                        showEditHabitModal(habitId);
                        break;
                    case 'delete':
                        confirmDeleteHabit(habitId);
                        break;
                }
            });
        });
    });
}

// Increment habit progress
function incrementHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date();
    const dateKey = formatDateKey(today);
    
    if (!habit.history[dateKey]) {
        habit.history[dateKey] = {
            date: today.toISOString(),
            progress: 0
        };
    }
    
    if (habit.goal.type === 'check') {
        habit.history[dateKey].progress = habit.goal.amount;
    } else {
        habit.history[dateKey].progress += 1;
    }
    
    saveHabits();
    updateHabitsList();
}

// Undo habit progress
function undoHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date();
    const dateKey = formatDateKey(today);
    
    if (habit.history[dateKey]) {
        if (habit.goal.type === 'check') {
            habit.history[dateKey].progress = 0;
        } else {
            habit.history[dateKey].progress = Math.max(0, habit.history[dateKey].progress - 1);
        }
    }
    
    saveHabits();
    updateHabitsList();
}

// Confirm delete habit
function confirmDeleteHabit(habitId) {
    if (confirm('Apakah Anda yakin ingin menghapus habit ini?')) {
        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex !== -1) {
            habits.splice(habitIndex, 1);
            saveHabits();
            updateHabitsList();
            updateAnalyticsHabitSelect();
        }
    }
}

// Filter habits
function filterHabits(filter) {
    updateHabitsList();
}

// Update analytics habit select
function updateAnalyticsHabitSelect() {
    const select = document.getElementById('analytics-habit');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="all">Semua Habits</option>';
    
    habits.forEach(habit => {
        const option = document.createElement('option');
        option.value = habit.id;
        option.textContent = habit.name;
        select.appendChild(option);
    });
    
    if (habits.find(h => h.id === currentValue)) {
        select.value = currentValue;
    }
}

// Update analytics
function updateAnalytics() {
    const type = document.getElementById('analytics-type').value;
    const habitId = document.getElementById('analytics-habit').value;
    
    const data = getAnalyticsData(type, habitId);
    updateAnalyticsChart(data, type);
    updateAnalyticsStats(data);
}

// Get analytics data
function getAnalyticsData(type, habitId) {
    const today = new Date();
    let startDate, endDate;
    
    switch (type) {
        case 'daily':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 6);
            endDate = today;
            break;
        case 'weekly':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - (6 * 7));
            endDate = today;
            break;
        case 'monthly':
            startDate = new Date(today);
            startDate.setMonth(startDate.getMonth() - 5);
            endDate = today;
            break;
    }
    
    // Generate date labels
    const labels = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
        let label;
        if (type === 'daily') {
            label = formatDateKey(current);
        } else if (type === 'weekly') {
            const weekNumber = getWeekNumber(current);
            label = `${current.getFullYear()}-W${weekNumber}`;
        } else if (type === 'monthly') {
            label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        }
        
        labels.push(label);
        
        if (type === 'daily') {
            current.setDate(current.getDate() + 1);
        } else if (type === 'weekly') {
            current.setDate(current.getDate() + 7);
        } else if (type === 'monthly') {
            current.setMonth(current.getMonth() + 1);
        }
    }
    
    // Get habit data
    let datasets = [];
    
    if (habitId === 'all') {
        habits.forEach(habit => {
            const data = getHabitData(habit, labels, type);
            datasets.push({
                label: habit.name,
                data: data,
                backgroundColor: hexToRgba(habit.color, 0.2),
                borderColor: habit.color,
                borderWidth: 2
            });
        });
    } else {
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            const data = getHabitData(habit, labels, type);
            datasets.push({
                label: habit.name,
                data: data,
                backgroundColor: 'rgba(255, 82, 82, 0.2)',
                borderColor: 'rgb(255, 82, 82)',
                borderWidth: 2
            });
        }
    }
    
    return {
        labels: formatAnalyticsLabels(labels, type),
        datasets: datasets
    };
}

// Get habit data
function getHabitData(habit, labels, type) {
    return labels.map(label => {
        if (type === 'daily') {
            // For daily, just get the progress for that day
            return habit.history[label]?.progress || 0;
        } else if (type === 'weekly') {
            // For weekly, aggregate all days in that week
            const [year, week] = label.split('-W');
            let totalProgress = 0;
            let count = 0;
            
            for (const dateKey in habit.history) {
                const date = new Date(habit.history[dateKey].date);
                const dateYear = date.getFullYear();
                const dateWeek = getWeekNumber(date);
                
                if (dateYear === parseInt(year) && dateWeek === parseInt(week)) {
                    totalProgress += habit.history[dateKey].progress;
                    count++;
                }
            }
            
            return count > 0 ? (totalProgress / count) : 0;
        } else if (type === 'monthly') {
            // For monthly, aggregate all days in that month
            const [year, month] = label.split('-');
            let totalProgress = 0;
            let count = 0;
            
            for (const dateKey in habit.history) {
                const date = new Date(habit.history[dateKey].date);
                const dateYear = date.getFullYear();
                const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
                
                if (dateYear === parseInt(year) && dateMonth === month) {
                    totalProgress += habit.history[dateKey].progress;
                    count++;
                }
            }
            
            return count > 0 ? (totalProgress / count) : 0;
        }
    });
}

// Update analytics chart
function updateAnalyticsChart(data, type) {
    const ctx = document.getElementById('analytics-chart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#333',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    boxPadding: 6
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.1)',
                    },
                    ticks: {
                        color: '#777'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#777'
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.3
                },
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        }
    });
}

// Update analytics stats
function updateAnalyticsStats(data) {
    const completionRate = calculateCompletionRate();
    const bestStreak = calculateBestStreak();
    const currentStreak = calculateCurrentStreak();
    
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    document.getElementById('best-streak').textContent = `${bestStreak} hari`;
    document.getElementById('current-streak').textContent = `${currentStreak} hari`;
}

// Calculate completion rate
function calculateCompletionRate() {
    const today = new Date();
    const habitId = document.getElementById('analytics-habit').value;
    let completedCount = 0;
    let totalCount = 0;
    
    if (habitId === 'all') {
        // Check all habits
        habits.forEach(habit => {
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateKey = formatDateKey(date);
                const dayOfWeek = date.getDay();
                
                if (habit.weekdays.includes(dayOfWeek)) {
                    totalCount++;
                    const progress = habit.history[dateKey]?.progress || 0;
                    if (progress >= habit.goal.amount) {
                        completedCount++;
                    }
                }
            }
        });
    } else {
        // Check specific habit
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateKey = formatDateKey(date);
                const dayOfWeek = date.getDay();
                
                if (habit.weekdays.includes(dayOfWeek)) {
                    totalCount++;
                    const progress = habit.history[dateKey]?.progress || 0;
                    if (progress >= habit.goal.amount) {
                        completedCount++;
                    }
                }
            }
        }
    }
    
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
}

// Calculate best streak
function calculateBestStreak() {
    const habitId = document.getElementById('analytics-habit').value;
    let bestStreak = 0;
    
    if (habitId === 'all') {
        // Check all habits combined
        let currentStreak = 0;
        
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = formatDateKey(date);
            let allCompleted = true;
            
            habits.forEach(habit => {
                const dayOfWeek = date.getDay();
                if (habit.weekdays.includes(dayOfWeek)) {
                    const progress = habit.history[dateKey]?.progress || 0;
                    if (progress < habit.goal.amount) {
                        allCompleted = false;
                    }
                }
            });
            
            if (allCompleted && habits.some(h => h.weekdays.includes(date.getDay()))) {
                currentStreak++;
            } else {
                bestStreak = Math.max(bestStreak, currentStreak);
                currentStreak = 0;
            }
        }
        
        bestStreak = Math.max(bestStreak, currentStreak);
    } else {
        // Check specific habit
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            let currentStreak = 0;
            
            for (let i = 0; i < 365; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateKey = formatDateKey(date);
                const dayOfWeek = date.getDay();
                
                if (habit.weekdays.includes(dayOfWeek)) {
                    const progress = habit.history[dateKey]?.progress || 0;
                    if (progress >= habit.goal.amount) {
                        currentStreak++;
                    } else {
                        bestStreak = Math.max(bestStreak, currentStreak);
                        currentStreak = 0;
                    }
                }
            }
            
            bestStreak = Math.max(bestStreak, currentStreak);
        }
    }
    
    return bestStreak;
}

// Calculate current streak
function calculateCurrentStreak() {
    const habitId = document.getElementById('analytics-habit').value;
    let currentStreak = 0;
    
    if (habitId === 'all') {
        // Check all habits combined
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = formatDateKey(date);
            let allCompleted = true;
            
            habits.forEach(habit => {
                const dayOfWeek = date.getDay();
                if (habit.weekdays.includes(dayOfWeek)) {
                    const progress = habit.history[dateKey]?.progress || 0;
                    if (progress < habit.goal.amount) {
                        allCompleted = false;
                    }
                }
            });
            
            if (allCompleted && habits.some(h => h.weekdays.includes(date.getDay()))) {
                currentStreak++;
            } else {
                break;
            }
        }
    } else {
        // Check specific habit
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            for (let i = 0; i < 365; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateKey = formatDateKey(date);
                const dayOfWeek = date.getDay();
                
                if (habit.weekdays.includes(dayOfWeek)) {
                    const progress = habit.history[dateKey]?.progress || 0;
                    if (progress >= habit.goal.amount) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }
    }
    
    return currentStreak;
}

// Format date key
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Format analytics labels
function formatAnalyticsLabels(labels, type) {
    if (type === 'daily') {
        return labels.map(label => {
            const [year, month, day] = label.split('-');
            return `${day}/${month}`;
        });
    } else if (type === 'weekly') {
        return labels.map(label => {
            const [year, week] = label.split('-W');
            return `Mg${week}`;
        });
    } else if (type === 'monthly') {
        return labels.map(label => {
            const [year, month] = label.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            return monthNames[parseInt(month) - 1];
        });
    }
    return labels;
}

// Convert hex to rgba
function hexToRgba(hex, alpha) {
    // Handle RGB format
    if (hex.startsWith('rgb')) {
        const parts = hex.match(/\d+/g);
        if (parts && parts.length >= 3) {
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
        return hex;
    }
    
    // Handle hex format
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Clear data
function clearData() {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
        habits = [];
        saveHabits();
        updateUI();
        alert('Semua data berhasil dihapus.');
    }
}