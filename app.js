// State management
const state = {
    habits: [],
    completions: [],
    editing: null,
    charts: {
        successRate: null,
        topHabits: null,
        category: null,
        dailyProgress: null,
        monthlyOverview: null
    },
    deleteId: null,
    currentDay: new Date(),
    analytics: {
        timeRange: 'week', // 'day', 'week', 'month'
        startDate: null,
        endDate: null
    }
};

// DOM Elements
const elements = {
    habitsList: document.getElementById('all-habits-list'),
    emptyHabits: document.getElementById('empty-habits'),
    habitModal: document.getElementById('habit-modal'),
    habitForm: document.getElementById('habit-form'),
    modalTitle: document.getElementById('modal-title'),
    addHabitBtn: document.getElementById('add-habit-btn'),
    habitPageAddBtn: document.getElementById('habit-page-add-btn'),
    saveHabitBtn: document.getElementById('save-habit'),
    cancelHabitBtn: document.getElementById('cancel-habit'),
    closeModalBtn: document.getElementById('close-modal'),
    habitId: document.getElementById('habit-id'),
    habitName: document.getElementById('habit-name'),
    habitCategory: document.getElementById('habit-category'),
    habitGoal: document.getElementById('habit-goal'),
    habitNotes: document.getElementById('habit-notes'),
    weeklyTracker: document.getElementById('weekly-tracker'),
    weeklyTrackerContainer: document.getElementById('weekly-tracker-container'),
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),
    confirmDialog: document.getElementById('confirm-dialog'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmAction: document.getElementById('confirm-action'),
    cancelConfirm: document.getElementById('cancel-confirm'),
    toast: document.getElementById('toast'),
    activeHabitsCount: document.getElementById('active-habits-count'),
    longestStreak: document.getElementById('longest-streak'),
    successRate: document.getElementById('success-rate'),
    todayCompletion: document.getElementById('today-completion'),
    analyticsTabs: document.querySelectorAll('.analytics-tab'),
    successRateChart: document.getElementById('success-rate-chart'),
    topHabitsChart: document.getElementById('top-habits-chart'),
    categoryChart: document.getElementById('category-chart'),
    dailyProgressChart: document.getElementById('daily-progress-chart'),
    monthlyOverviewChart: document.getElementById('monthly-overview-chart'),
    successRatePlaceholder: document.getElementById('success-rate-placeholder'),
    topHabitsPlaceholder: document.getElementById('top-habits-placeholder'),
    categoryPlaceholder: document.getElementById('category-placeholder'),
    dailyProgressPlaceholder: document.getElementById('daily-progress-placeholder'),
    monthlyOverviewPlaceholder: document.getElementById('monthly-overview-placeholder'),
    previousPeriodBtn: document.getElementById('previous-period'),
    nextPeriodBtn: document.getElementById('next-period'),
    currentPeriodText: document.getElementById('current-period'),
    categoryBoxes: document.querySelectorAll('.category-box'),
    dayBoxes: document.querySelectorAll('.day-box')
};

// Helper Functions
function saveToLocalStorage() {
    localStorage.setItem('habits', JSON.stringify(state.habits));
    localStorage.setItem('completions', JSON.stringify(state.completions));
}

function loadFromLocalStorage() {
    const habits = localStorage.getItem('habits');
    const completions = localStorage.getItem('completions');

    if (habits) {
        state.habits = JSON.parse(habits);
    }

    if (completions) {
        state.completions = JSON.parse(completions);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function toggleEmptyState() {
    if (state.habits.length === 0) {
        if (elements.emptyHabits) {
            elements.emptyHabits.style.display = 'flex';
        }
        if (elements.weeklyTrackerContainer) {
            elements.weeklyTrackerContainer.style.display = 'none';
        }
    } else {
        if (elements.emptyHabits) {
            elements.emptyHabits.style.display = 'none';
        }
        if (elements.weeklyTrackerContainer) {
            elements.weeklyTrackerContainer.style.display = 'block';
        }
    }
}

function isHabitActiveToday(habit) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Check if the specific day is selected
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return habit.selectedDays && habit.selectedDays[days[dayOfWeek]];
}

function isHabitActiveOnDate(habit, date) {
    const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Check if habit was created after this date
    if (habit.createdAt && new Date(habit.createdAt) > date) {
        return false;
    }
    
    // Check if the specific day is selected
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return habit.selectedDays && habit.selectedDays[days[dayOfWeek]];
}

function getDayName(index) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[index];
}

function getDayShortName(index) {
    const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    return days[index];
}

function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dates = [];
    
    // Calculate first day (Sunday) of current week
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - dayOfWeek);
    
    // Get all 7 days of the week
    for (let i = 0; i < 7; i++) {
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() + i);
        dates.push(date);
    }
    
    return dates;
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

function getDaysDiff(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

function formatShortDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

function calculateStreak(habitId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return 0;
    
    const completions = state.completions
        .filter(c => c.habitId === habitId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (completions.length === 0) return 0;
    
    let currentStreak = 0;
    let currentDate = today;
    
    for (let i = 0; i < completions.length; i++) {
        const completion = completions[i];
        const completionDate = new Date(completion.date);
        completionDate.setHours(0, 0, 0, 0);
        
        // If there's a gap larger than 1 day, the streak is broken
        const daysDiff = getDaysDiff(currentDate, completionDate);
        
        if (daysDiff > 1) break;
        
        // If this is exactly the next day or the same day, increment streak
        if (daysDiff <= 1) {
            currentStreak++;
            currentDate = completionDate;
            // Move the currentDate one day back to look for previous day
            currentDate.setDate(currentDate.getDate() - 1);
        }
    }
    
    return currentStreak;
}

function isHabitCompletedOnDate(habitId, date) {
    const formattedDate = formatDate(date);
    return state.completions.some(c => 
        c.habitId === habitId && formatDate(c.date) === formattedDate
    );
}

function countTodayCompletions() {
    const today = formatDate(new Date());
    const activeHabits = state.habits.filter(h => isHabitActiveToday(h));
    const completedToday = state.completions.filter(c => 
        formatDate(c.date) === today && 
        activeHabits.some(h => h.id === c.habitId)
    );
    
    return {
        completed: completedToday.length,
        total: activeHabits.length
    };
}

function calculateLongestStreak() {
    if (state.habits.length === 0) return 0;
    
    const streaks = state.habits.map(habit => {
        return {
            id: habit.id,
            name: habit.name,
            streak: calculateStreak(habit.id)
        };
    });
    
    streaks.sort((a, b) => b.streak - a.streak);
    return streaks.length > 0 ? streaks[0].streak : 0;
}

function calculateSuccessRate() {
    if (state.habits.length === 0) return 0;
    
    const last7Days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        last7Days.push(formatDate(date));
    }
    
    let possibleCompletions = 0;
    let actualCompletions = 0;
    
    state.habits.forEach(habit => {
        last7Days.forEach(date => {
            const dateObj = new Date(date);
            
            // Check if the habit should be active on this day
            if (isHabitActiveOnDate(habit, dateObj)) {
                possibleCompletions++;
                
                if (isHabitCompletedOnDate(habit.id, date)) {
                    actualCompletions++;
                }
            }
        });
    });
    
    return possibleCompletions === 0 ? 0 : Math.round((actualCompletions / possibleCompletions) * 100);
}

function updateStats() {
    elements.activeHabitsCount.textContent = state.habits.length;
    elements.longestStreak.textContent = calculateLongestStreak();
    elements.successRate.textContent = `${calculateSuccessRate()}%`;
    
    const todayStats = countTodayCompletions();
    elements.todayCompletion.textContent = `${todayStats.completed}/${todayStats.total}`;
}

// UI Functions
function renderAllHabits() {
    // Clear existing habits
    if (elements.habitsList) {
        const habitNodes = elements.habitsList.querySelectorAll('.habit-card');
        habitNodes.forEach(node => node.remove());
    
        if (state.habits.length === 0) {
            // Show empty state
            if (elements.emptyHabits) {
                elements.emptyHabits.style.display = 'flex';
            }
            return;
        } else {
            if (elements.emptyHabits) {
                elements.emptyHabits.style.display = 'none';
            }
        }
        
        // Add habit cards
        state.habits.forEach(habit => {
            const streak = calculateStreak(habit.id);
            const habitCard = document.createElement('div');
            habitCard.classList.add('habit-card');
            habitCard.dataset.id = habit.id;
            
            // Check if completed today
            const isCompletedToday = isHabitCompletedOnDate(habit.id, new Date());
            
            // Format days display
            const days = [];
            if (habit.selectedDays) {
                if (habit.selectedDays.sun) days.push('MIN');
                if (habit.selectedDays.mon) days.push('SEN');
                if (habit.selectedDays.tue) days.push('SEL');
                if (habit.selectedDays.wed) days.push('RAB');
                if (habit.selectedDays.thu) days.push('KAM');
                if (habit.selectedDays.fri) days.push('JUM');
                if (habit.selectedDays.sat) days.push('SAB');
            }
            const daysDisplay = days.join(', ');
            
            habitCard.innerHTML = `
                <div class="habit-details">
                    <div class="habit-name">${habit.name}${habit.goal ? ` - ${habit.goal}` : ''}</div>
                    <div class="habit-meta">
                        <div class="habit-frequency">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${daysDisplay}</span>
                        </div>
                        <div class="habit-streak">
                            <i class="fas fa-fire"></i>
                            <span>Streak: ${streak}</span>
                        </div>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="habit-action-btn complete-btn" data-id="${habit.id}" ${isCompletedToday ? 'disabled' : ''}>
                        <i class="fas ${isCompletedToday ? 'fa-check' : 'fa-check'}"></i>
                    </button>
                    <button class="habit-action-btn" data-id="${habit.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="habit-action-btn delete-btn" data-id="${habit.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Append to list
            elements.habitsList.appendChild(habitCard);
            
            // Add event listeners
            const editBtn = habitCard.querySelector('.fa-edit').parentNode;
            editBtn.addEventListener('click', () => {
                editHabit(habit.id);
            });
            
            const deleteBtn = habitCard.querySelector('.fa-trash').parentNode;
            deleteBtn.addEventListener('click', () => {
                confirmDeleteHabit(habit.id);
            });
            
            const completeBtn = habitCard.querySelector('.complete-btn');
            if (!isCompletedToday) {
                completeBtn.addEventListener('click', () => {
                    completeHabit(habit.id);
                });
            } else {
                completeBtn.style.backgroundColor = 'var(--success-color)';
                completeBtn.style.color = 'white';
            }
        });
    }
}

function renderWeeklyTracker() {
    if (state.habits.length === 0) {
        elements.weeklyTracker.innerHTML = '';
        return;
    }
    
    const weekDates = getWeekDates();
    let trackerHTML = `
        <div class="tracker-grid">
            <div class="tracker-header">Kebiasaan</div>
    `;
    
    // Add day headers
    weekDates.forEach((date, index) => {
        const isToday = formatDate(date) === formatDate(new Date());
        trackerHTML += `
            <div class="tracker-header" style="${isToday ? 'color: var(--primary-color); font-weight: 700;' : ''}">
                ${getDayShortName(date.getDay())}
                <div style="font-size: 0.8rem; opacity: 0.7;">${date.getDate()}/${date.getMonth() + 1}</div>
            </div>
        `;
    });
    
    // Add habits and tracking cells
    state.habits.forEach(habit => {
        trackerHTML += `<div class="tracker-habit">${habit.name}</div>`;
        
        weekDates.forEach(date => {
            const dateStr = formatDate(date);
            const isCompleted = state.completions.some(c => c.habitId === habit.id && formatDate(c.date) === dateStr);
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            const shouldBeActive = isHabitActiveOnDate(habit, date);
            
            if (shouldBeActive) {
                if (isCompleted) {
                    trackerHTML += `<div class="tracker-cell completed"><i class="fas fa-check"></i></div>`;
                } else if (isPast) {
                    trackerHTML += `<div class="tracker-cell missed"></div>`;
                } else {
                    trackerHTML += `<div class="tracker-cell"></div>`;
                }
            } else {
                trackerHTML += `<div class="tracker-cell" style="background-color: #f8f8f8; cursor: default;"></div>`;
            }
        });
    });
    
    trackerHTML += `</div>`;
    elements.weeklyTracker.innerHTML = trackerHTML;
}

// Initialize Analytics Time Range
function initializeAnalyticsTimeRange() {
    changeTimeRange('week'); // Default to week view
    
    // Add click event listeners to analytics tabs
    if (elements.analyticsTabs) {
        elements.analyticsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                elements.analyticsTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Change time range
                changeTimeRange(tab.dataset.range);
            });
        });
    }
}

// Update current period text
function updateCurrentPeriodText() {
    if (!elements.currentPeriodText) return;
    
    const formatOptions = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    };
    
    const startDateStr = state.analytics.startDate.toLocaleDateString('id-ID', formatOptions);
    const endDateStr = state.analytics.endDate.toLocaleDateString('id-ID', formatOptions);
    
    let periodText = '';
    
    switch(state.analytics.timeRange) {
        case 'day':
            periodText = startDateStr;
            break;
        case 'week':
            periodText = `${startDateStr} - ${endDateStr}`;
            break;
        case 'month':
            periodText = state.analytics.startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            break;
        default:
            periodText = `${startDateStr} - ${endDateStr}`;
    }
    
    elements.currentPeriodText.textContent = periodText;
}

// Change time range
function changeTimeRange(range) {
    state.analytics.timeRange = range;
    
    const today = new Date();
    let startDate, endDate;
    
    switch(range) {
        case 'day':
            startDate = new Date(today);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay()); // Start from Sunday
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // Until Saturday
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
            
        default:
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay());
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
    }
    
    state.analytics.startDate = startDate;
    state.analytics.endDate = endDate;
    
    updateCurrentPeriodText();
    updateCharts();
}

// Navigate to previous period
function navigateToPreviousPeriod() {
    const currentStart = state.analytics.startDate;
    const currentEnd = state.analytics.endDate;
    
    let newStart, newEnd;
    
    switch(state.analytics.timeRange) {
        case 'day':
            newStart = new Date(currentStart);
            newStart.setDate(currentStart.getDate() - 1);
            
            newEnd = new Date(newStart);
            newEnd.setHours(23, 59, 59, 999);
            break;
            
        case 'week':
            newStart = new Date(currentStart);
            newStart.setDate(currentStart.getDate() - 7);
            
            newEnd = new Date(newStart);
            newEnd.setDate(newStart.getDate() + 6);
            newEnd.setHours(23, 59, 59, 999);
            break;
            
        case 'month':
            newStart = new Date(currentStart);
            newStart.setMonth(currentStart.getMonth() - 1);
            
            newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
            newEnd.setHours(23, 59, 59, 999);
            break;
    }
    
    state.analytics.startDate = newStart;
    state.analytics.endDate = newEnd;
    
    updateCurrentPeriodText();
    updateCharts();
}

// Navigate to next period
function navigateToNextPeriod() {
    const currentStart = state.analytics.startDate;
    const currentEnd = state.analytics.endDate;
    const today = new Date();
    
    let newStart, newEnd;
    
    switch(state.analytics.timeRange) {
        case 'day':
            newStart = new Date(currentStart);
            newStart.setDate(currentStart.getDate() + 1);
            
            newEnd = new Date(newStart);
            newEnd.setHours(23, 59, 59, 999);
            break;
            
        case 'week':
            newStart = new Date(currentStart);
            newStart.setDate(currentStart.getDate() + 7);
            
            newEnd = new Date(newStart);
            newEnd.setDate(newStart.getDate() + 6);
            newEnd.setHours(23, 59, 59, 999);
            break;
            
        case 'month':
            newStart = new Date(currentStart);
            newStart.setMonth(currentStart.getMonth() + 1);
            
            newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
            newEnd.setHours(23, 59, 59, 999);
            break;
    }
    
    // Don't go beyond today
    if (newEnd > today) {
        // If we're in day view and trying to go beyond today
        if (state.analytics.timeRange === 'day' && newStart > today) {
            return; // Don't update
        }
        
        // Otherwise adjust the end date to today
        if (newEnd > today) {
            newEnd = new Date(today);
            newEnd.setHours(23, 59, 59, 999);
        }
    }
    
    state.analytics.startDate = newStart;
    state.analytics.endDate = newEnd;
    
    updateCurrentPeriodText();
    updateCharts();
}

function updateCharts() {
    if (state.habits.length === 0) {
        // Show placeholders
        if (elements.successRatePlaceholder) elements.successRatePlaceholder.style.display = 'flex';
        if (elements.topHabitsPlaceholder) elements.topHabitsPlaceholder.style.display = 'flex';
        if (elements.categoryPlaceholder) elements.categoryPlaceholder.style.display = 'flex';
        if (elements.dailyProgressPlaceholder) elements.dailyProgressPlaceholder.style.display = 'flex';
        if (elements.monthlyOverviewPlaceholder) elements.monthlyOverviewPlaceholder.style.display = 'flex';
        
        // Hide charts
        if (elements.successRateChart) elements.successRateChart.style.display = 'none';
        if (elements.topHabitsChart) elements.topHabitsChart.style.display = 'none';
        if (elements.categoryChart) elements.categoryChart.style.display = 'none';
        if (elements.dailyProgressChart) elements.dailyProgressChart.style.display = 'none';
        if (elements.monthlyOverviewChart) elements.monthlyOverviewChart.style.display = 'none';
        return;
    }
    
    // Get dates in the selected range
    const datesInRange = getDatesInRange(state.analytics.startDate, state.analytics.endDate);
    
    // Success rate chart - Shows completion rate for each date in range
    const successRateData = datesInRange.map(date => {
        const dateStr = formatDate(date);
        const activeHabits = state.habits.filter(h => isHabitActiveOnDate(h, date));
        
        const completedHabits = activeHabits.filter(h => 
            state.completions.some(c => c.habitId === h.id && formatDate(c.date) === dateStr)
        );
        
        return activeHabits.length === 0 ? 0 : Math.round((completedHabits.length / activeHabits.length) * 100);
    });
    
    // Check if we have enough data for success rate chart
    if (successRateData.some(rate => rate > 0) && elements.successRateChart) {
        elements.successRatePlaceholder.style.display = 'none';
        elements.successRateChart.style.display = 'block';
        
        if (state.charts.successRate) {
            state.charts.successRate.destroy();
        }
        
        // Format date labels based on time range
        let dateLabels;
        if (state.analytics.timeRange === 'month' || datesInRange.length > 14) {
            // For month view or if too many dates, group by week
            dateLabels = datesInRange.map(date => {
                if (date.getDate() === 1 || date.getDay() === 0 || datesInRange.indexOf(date) === 0) {
                    return formatShortDate(date);
                }
                return '';
            });
        } else {
            dateLabels = datesInRange.map(date => formatShortDate(date));
        }
        
        state.charts.successRate = new Chart(elements.successRateChart, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [{
                    label: 'Tingkat Kesuksesan (%)',
                    data: successRateData,
                    borderColor: '#8B0000',
                    backgroundColor: 'rgba(139, 0, 0, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Top habits chart - Shows success rate for each habit in the selected period
    const habitSuccessRates = state.habits.map(habit => {
        let totalDays = 0;
        let completedDays = 0;
        
        datesInRange.forEach(date => {
            if (isHabitActiveOnDate(habit, date)) {
                totalDays++;
                
                const dateStr = formatDate(date);
                if (state.completions.some(c => c.habitId === habit.id && formatDate(c.date) === dateStr)) {
                    completedDays++;
                }
            }
        });
        
        return {
            id: habit.id,
            name: habit.name,
            rate: totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100),
            completedDays,
            totalDays
        };
    });
    
    // Sort by success rate
    habitSuccessRates.sort((a, b) => b.rate - a.rate);
    
    // Only include habits that were active during this period
    const activeHabits = habitSuccessRates.filter(h => h.totalDays > 0);
    
    if (activeHabits.length > 0 && elements.topHabitsChart) {
        elements.topHabitsPlaceholder.style.display = 'none';
        elements.topHabitsChart.style.display = 'block';
        
        if (state.charts.topHabits) {
            state.charts.topHabits.destroy();
        }
        
        state.charts.topHabits = new Chart(elements.topHabitsChart, {
            type: 'bar',
            data: {
                labels: activeHabits.map(h => h.name),
                datasets: [{
                    label: 'Tingkat Kesuksesan (%)',
                    data: activeHabits.map(h => h.rate),
                    backgroundColor: 'rgba(139, 0, 0, 0.7)',
                    borderColor: '#8B0000',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const habitData = activeHabits[context.dataIndex];
                                return `Selesai: ${habitData.completedDays}/${habitData.totalDays} hari`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Category distribution chart - Shows distribution of habits by category for active habits in range
    const categories = {};
    state.habits.forEach(habit => {
        // Only count if habit was active during this period
        const wasActive = datesInRange.some(date => isHabitActiveOnDate(habit, date));
        
        if (wasActive) {
            if (!categories[habit.category]) {
                categories[habit.category] = 0;
            }
            categories[habit.category]++;
        }
    });
    
    const categoryLabels = {
        health: 'Kesehatan',
        fitness: 'Kebugaran',
        productivity: 'Produktivitas',
        mindfulness: 'Mindfulness',
        learning: 'Pembelajaran',
        finance: 'Keuangan',
        other: 'Lainnya'
    };
    
    const categoryColors = {
        health: '#8B0000',
        fitness: '#B22222',
        productivity: '#FF0000',
        mindfulness: '#DC143C',
        learning: '#CD5C5C',
        finance: '#F08080',
        other: '#FA8072'
    };
    
    if (Object.keys(categories).length > 0 && elements.categoryChart) {
        elements.categoryPlaceholder.style.display = 'none';
        elements.categoryChart.style.display = 'block';
        
        if (state.charts.category) {
            state.charts.category.destroy();
        }
        
        state.charts.category = new Chart(elements.categoryChart, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories).map(key => categoryLabels[key] || key),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: Object.keys(categories).map(key => categoryColors[key] || '#8B0000'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.formattedValue;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Daily Progress Chart - Shows completed vs missed habits for each day
    if (elements.dailyProgressChart) {
        const completedData = [];
        const missedData = [];
        
        datesInRange.forEach(date => {
            const dateStr = formatDate(date);
            const activeHabits = state.habits.filter(h => isHabitActiveOnDate(h, date));
            
            const completedHabits = activeHabits.filter(h => 
                state.completions.some(c => c.habitId === h.id && formatDate(c.date) === dateStr)
            );
            
            completedData.push(completedHabits.length);
            missedData.push(activeHabits.length - completedHabits.length);
        });
        
        // Format date labels based on time range
        let dateLabels;
        if (state.analytics.timeRange === 'month' || datesInRange.length > 14) {
            // For month view or if too many dates, group by week
            dateLabels = datesInRange.map(date => {
                if (date.getDate() === 1 || date.getDay() === 0 || datesInRange.indexOf(date) === 0) {
                    return formatShortDate(date);
                }
                return '';
            });
        } else {
            dateLabels = datesInRange.map(date => formatShortDate(date));
        }
        
        if (completedData.some(count => count > 0) || missedData.some(count => count > 0)) {
            elements.dailyProgressPlaceholder.style.display = 'none';
            elements.dailyProgressChart.style.display = 'block';
            
            if (state.charts.dailyProgress) {
                state.charts.dailyProgress.destroy();
            }
            
            state.charts.dailyProgress = new Chart(elements.dailyProgressChart, {
                type: 'bar',
                data: {
                    labels: dateLabels,
                    datasets: [
                        {
                            label: 'Selesai',
                            data: completedData,
                            backgroundColor: '#4caf50',
                            borderColor: '#388e3c',
                            borderWidth: 1
                        },
                        {
                            label: 'Terlewat',
                            data: missedData,
                            backgroundColor: '#8B0000',
                            borderColor: '#800000',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
    
    // Monthly Overview Chart - Shows trend across months
    if (elements.monthlyOverviewChart) {
        // Get all completions and group by month
        const months = {};
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
            'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
        ];
        
        // Get the last 6 months including current month
        const today = new Date();
        const monthsToShow = 6;
        let labels = [];
        let completionRates = [];
        
        for (let i = monthsToShow - 1; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStr = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
            const monthLabel = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
            
            labels.push(monthLabel);
            
            // Calculate completion rate for this month
            const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            
            let totalPossible = 0;
            let totalCompleted = 0;
            
            // Loop through each day in the month
            const daysInMonth = getDatesInRange(startOfMonth, endOfMonth);
            
            daysInMonth.forEach(date => {
                const dateStr = formatDate(date);
                const activeHabits = state.habits.filter(h => isHabitActiveOnDate(h, date));
                
                totalPossible += activeHabits.length;
                
                // Count completions
                activeHabits.forEach(habit => {
                    if (state.completions.some(c => c.habitId === habit.id && formatDate(c.date) === dateStr)) {
                        totalCompleted++;
                    }
                });
            });
            
            const rate = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
            completionRates.push(rate);
        }
        
        if (completionRates.some(rate => rate > 0)) {
            elements.monthlyOverviewPlaceholder.style.display = 'none';
            elements.monthlyOverviewChart.style.display = 'block';
            
            if (state.charts.monthlyOverview) {
                state.charts.monthlyOverview.destroy();
            }
            
            state.charts.monthlyOverview = new Chart(elements.monthlyOverviewChart, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tingkat Kesuksesan Bulanan (%)',
                        data: completionRates,
                        borderColor: '#8B0000',
                        backgroundColor: 'rgba(139, 0, 0, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }
}

// CRUD Operations
function addHabit() {
    const name = elements.habitName.value.trim();
    const category = elements.habitCategory.value;
    const goal = elements.habitGoal.value.trim();
    const notes = elements.habitNotes.value.trim();
    
    if (!name || !category) {
        showToast('Mohon lengkapi semua field yang diperlukan');
        return;
    }
    
    // Get selected days
    const selectedDays = {};
    elements.dayBoxes.forEach(box => {
        const day = box.dataset.day;
        selectedDays[day] = box.classList.contains('active');
    });
    
    // Validate if at least one day is selected
    const hasDaySelected = Object.values(selectedDays).some(selected => selected);
    if (!hasDaySelected) {
        showToast('Pilih minimal satu hari');
        return;
    }
    
    const habit = {
        id: generateId(),
        name,
        category,
        selectedDays,
        goal,
        notes,
        createdAt: new Date()
    };
    
    state.habits.push(habit);
    saveToLocalStorage();
    closeHabitModal();
    renderAllHabits();
    renderWeeklyTracker();
    updateStats();
    updateCharts();
    showToast('Kebiasaan baru ditambahkan!');
}

function editHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    state.editing = habitId;
    elements.modalTitle.textContent = 'Edit Kebiasaan';
    elements.habitId.value = habit.id;
    elements.habitName.value = habit.name;
    elements.habitCategory.value = habit.category;
    elements.habitGoal.value = habit.goal || '';
    elements.habitNotes.value = habit.notes || '';
    
    // Set active category
    elements.categoryBoxes.forEach(box => {
        if (box.dataset.category === habit.category) {
            box.classList.add('active');
        } else {
            box.classList.remove('active');
        }
    });
    
    // Set active days
    elements.dayBoxes.forEach(box => {
        const day = box.dataset.day;
        if (habit.selectedDays && habit.selectedDays[day]) {
            box.classList.add('active');
        } else {
            box.classList.remove('active');
        }
    });
    
    openHabitModal();
}

function updateHabit() {
    const id = elements.habitId.value;
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;
    
    const name = elements.habitName.value.trim();
    const category = elements.habitCategory.value;
    const goal = elements.habitGoal.value.trim();
    const notes = elements.habitNotes.value.trim();
    
    if (!name || !category) {
        showToast('Mohon lengkapi semua field yang diperlukan');
        return;
    }
    
    // Get selected days
    const selectedDays = {};
    elements.dayBoxes.forEach(box => {
        const day = box.dataset.day;
        selectedDays[day] = box.classList.contains('active');
    });
    
    // Validate if at least one day is selected
    const hasDaySelected = Object.values(selectedDays).some(selected => selected);
    if (!hasDaySelected) {
        showToast('Pilih minimal satu hari');
        return;
    }
    
    habit.name = name;
    habit.category = category;
    habit.selectedDays = selectedDays;
    habit.goal = goal;
    habit.notes = notes;
    
    saveToLocalStorage();
    closeHabitModal();
    renderAllHabits();
    renderWeeklyTracker();
    updateStats();
    updateCharts();
    showToast('Kebiasaan berhasil diperbarui!');
}

function deleteHabit(habitId) {
    const index = state.habits.findIndex(h => h.id === habitId);
    if (index === -1) return;
    
    state.habits.splice(index, 1);
    state.completions = state.completions.filter(c => c.habitId !== habitId);
    
    saveToLocalStorage();
    renderAllHabits();
    renderWeeklyTracker();
    updateStats();
    updateCharts();
    showToast('Kebiasaan berhasil dihapus!');
    
    // Check if we need to show empty state
    toggleEmptyState();
}

function completeHabit(habitId) {
    const today = formatDate(new Date());
    
    // Check if already completed today
    const alreadyCompleted = state.completions.some(c => 
        c.habitId === habitId && formatDate(c.date) === today
    );
    
    if (alreadyCompleted) return;
    
    state.completions.push({
        id: generateId(),
        habitId,
        date: new Date()
    });
    
    saveToLocalStorage();
    renderAllHabits();
    renderWeeklyTracker();
    updateStats();
    updateCharts();
    showToast('Kebiasaan selesai hari ini!');
}

function confirmDeleteHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    state.deleteId = habitId;
    elements.confirmTitle.textContent = 'Hapus Kebiasaan?';
    elements.confirmMessage.textContent = `Apakah Anda yakin ingin menghapus "${habit.name}"? Tindakan ini tidak dapat dibatalkan.`;
    elements.confirmAction.textContent = 'Hapus';
    elements.confirmDialog.classList.add('active');
}

// Modal Functions
function openHabitModal() {
    elements.habitModal.classList.add('active');
    setupCategorySelectors();
    setupDaySelectors();
}

function closeHabitModal() {
    elements.habitModal.classList.remove('active');
    elements.habitForm.reset();
    state.editing = null;
    elements.modalTitle.textContent = 'Tambah Kebiasaan Baru';
    
    // Reset category selections
    elements.categoryBoxes.forEach(box => {
        box.classList.remove('active');
    });
    
    // Reset day selections
    elements.dayBoxes.forEach(box => {
        box.classList.remove('active');
    });
}

// Setup category selectors
function setupCategorySelectors() {
    elements.categoryBoxes.forEach(box => {
        box.addEventListener('click', function() {
            // Remove active class from all boxes
            elements.categoryBoxes.forEach(b => {
                b.classList.remove('active');
            });
            
            // Add active class to selected box
            this.classList.add('active');
            
            // Set hidden input value
            elements.habitCategory.value = this.dataset.category;
        });
    });
}

// Setup day selectors
function setupDaySelectors() {
    elements.dayBoxes.forEach(box => {
        box.addEventListener('click', function() {
            // Toggle active class
            this.classList.toggle('active');
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Add habit buttons
    if (elements.addHabitBtn) {
        elements.addHabitBtn.addEventListener('click', () => {
            state.editing = null;
            elements.modalTitle.textContent = 'Tambah Kebiasaan Baru';
            elements.habitForm.reset();
            
            // Reset category selections
            elements.categoryBoxes.forEach(box => {
                box.classList.remove('active');
            });
            
            // Reset day selections
            elements.dayBoxes.forEach(box => {
                box.classList.remove('active');
            });
            
            openHabitModal();
        });
    }
    
    if (elements.habitPageAddBtn) {
        elements.habitPageAddBtn.addEventListener('click', () => {
            state.editing = null;
            elements.modalTitle.textContent = 'Tambah Kebiasaan Baru';
            elements.habitForm.reset();
            
            // Reset category selections
            elements.categoryBoxes.forEach(box => {
                box.classList.remove('active');
            });
            
            // Reset day selections
            elements.dayBoxes.forEach(box => {
                box.classList.remove('active');
            });
            
            openHabitModal();
        });
    }
    
    // Modal buttons
    elements.closeModalBtn.addEventListener('click', closeHabitModal);
    elements.cancelHabitBtn.addEventListener('click', closeHabitModal);
    
    elements.saveHabitBtn.addEventListener('click', () => {
        if (state.editing) {
            updateHabit();
        } else {
            addHabit();
        }
    });
    
    // Setup initial event listeners for category boxes
    setupCategorySelectors();
    
    // Setup initial event listeners for day boxes
    setupDaySelectors();
    
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.dataset.page;
            
            // Update nav items
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update pages
            elements.pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            // Update charts if switching to analytics page
            if (targetPage === 'analytics-page') {
                updateCharts();
            }
            
            // Update habits list if switching to habits page
            if (targetPage === 'habits-page') {
                renderAllHabits();
            }
        });
    });
    
    // Confirm dialog
    elements.confirmAction.addEventListener('click', () => {
        if (state.deleteId) {
            deleteHabit(state.deleteId);
            state.deleteId = null;
        }
        elements.confirmDialog.classList.remove('active');
    });
    
    elements.cancelConfirm.addEventListener('click', () => {
        elements.confirmDialog.classList.remove('active');
        state.deleteId = null;
    });
    
    // Analytics navigation buttons
    if (elements.previousPeriodBtn) {
        elements.previousPeriodBtn.addEventListener('click', navigateToPreviousPeriod);
    }
    
    if (elements.nextPeriodBtn) {
        elements.nextPeriodBtn.addEventListener('click', navigateToNextPeriod);
    }
    
    // Click outside modal to close
    elements.habitModal.addEventListener('click', (e) => {
        if (e.target === elements.habitModal) {
            closeHabitModal();
        }
    });
    
    elements.confirmDialog.addEventListener('click', (e) => {
        if (e.target === elements.confirmDialog) {
            elements.confirmDialog.classList.remove('active');
            state.deleteId = null;
        }
    });
}

// Initialize app
function initApp() {
    loadFromLocalStorage();
    renderAllHabits();
    renderWeeklyTracker();
    updateStats();
    initializeAnalyticsTimeRange();
    setupEventListeners();
    toggleEmptyState();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);