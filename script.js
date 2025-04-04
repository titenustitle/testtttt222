// DOM Elements
const startTimeInput = document.getElementById('startTime');
const setTimeBtn = document.getElementById('setTimeBtn');
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const currentDateDisplay = document.getElementById('currentDate');
const prevDayBtn = document.getElementById('prevDayBtn');
const nextDayBtn = document.getElementById('nextDayBtn');
const currentMonthDisplay = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calendarDaysContainer = document.getElementById('calendarDays');
const navLinks = document.querySelectorAll('.nav-links li');
const pages = document.querySelectorAll('.page');
const themeToggle = document.querySelector('.theme-toggle');
const themeButtons = document.querySelectorAll('.theme-btn');
const defaultStartTimeInput = document.getElementById('defaultStartTime');
const saveDefaultTimeBtn = document.getElementById('saveDefaultTime');
const exportDataBtn = document.getElementById('exportData');
const importDataBtn = document.getElementById('importData');
const clearDataBtn = document.getElementById('clearData');

// Rich Text Editor Elements
const richNotes = document.getElementById('richNotes');
const formatButtons = document.querySelectorAll('.format-btn');
const saveNotesBtn = document.getElementById('saveNotes');
const clearNotesBtn = document.getElementById('clearNotes');
const backToHomeBtn = document.getElementById('backToHome');
const notesPageTitle = document.getElementById('notesPageTitle');

// DOM Elements for storage location
const storageLocationInput = document.getElementById('storageLocation');
const browseLocationBtn = document.getElementById('browseLocation');
const saveLocationBtn = document.getElementById('saveLocation');

// State
let timeSlots = [];
let currentDate = new Date();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = new Date();
let theme = localStorage.getItem('theme') || 'light';
let currentSlotId = null;
let autoSaveInterval = 1000; // 1 second debounce
let autoSaveTimeout = null;
let dirHandle = null;
let fileHandles = new Map(); // Store file handles for each date and slot
let saveStatus = 'saved'; // 'saved', 'saving', 'error'
let storageLocation = localStorage.getItem('storageLocation') || 'localStorage';

// Rich Text Editor State
let currentNotes = '';

// Bangladesh Public Holidays 2025
const publicHolidays = {
    '2025-01-01': 'New Year\'s Day',
    '2025-02-21': 'International Mother Language Day',
    '2025-03-17': 'Sheikh Mujibur Rahman\'s Birthday',
    '2025-03-26': 'Independence Day',
    '2025-04-14': 'Pohela Boishakh',
    '2025-05-01': 'May Day',
    '2025-08-15': 'National Mourning Day',
    '2025-10-06': 'Durga Puja',
    '2025-12-16': 'Victory Day',
    '2025-12-25': 'Christmas Day',
    '2025-12-26': 'Boxing Day'
};

// Initialize theme
document.documentElement.setAttribute('data-theme', theme);
updateThemeIcon();

// Initialize the application
function initializeApp() {
    // Load saved data
    loadSavedData();
    
    // Initialize calendar
    renderCalendar(currentMonth, currentYear);
    
    // Initialize time slots
    loadTimeSlotsForDate(selectedDate);
    
    // Initialize theme
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon();
    
    // Initialize IndexedDB
    initIndexedDB().then(() => {
        loadDirectoryHandle().catch(err => {
            console.error('Error loading directory handle:', err);
        });
    }).catch(err => {
        console.error('Error initializing IndexedDB:', err);
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon();
    
    // Get DOM Elements
    const startTimeInput = document.getElementById('startTime');
    const setTimeBtn = document.getElementById('setTimeBtn');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    const currentDateDisplay = document.getElementById('currentDate');
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const currentMonthDisplay = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarDaysContainer = document.getElementById('calendarDays');
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const defaultStartTimeInput = document.getElementById('defaultStartTime');
    const saveDefaultTimeBtn = document.getElementById('saveDefaultTime');
    const exportDataBtn = document.getElementById('exportData');
    const importDataBtn = document.getElementById('importData');
    const clearDataBtn = document.getElementById('clearData');
    const richNotes = document.getElementById('richNotes');
    const formatButtons = document.querySelectorAll('.format-btn');
    const saveNotesBtn = document.getElementById('saveNotes');
    const clearNotesBtn = document.getElementById('clearNotes');
    const backToHomeBtn = document.getElementById('backToHome');
    const notesPageTitle = document.getElementById('notesPageTitle');
    const storageLocationInput = document.getElementById('storageLocation');
    const browseLocationBtn = document.getElementById('browseLocation');
    const saveLocationBtn = document.getElementById('saveLocation');
    const markdownEditor = document.getElementById('markdownEditor');
    const previewPanel = document.getElementById('previewPanel');
    const saveIndicator = document.getElementById('saveIndicator');
    const toggleFocusMode = document.getElementById('toggleFocusMode');
    const pinNote = document.getElementById('pinNote');
    const tagInput = document.getElementById('tagInput');
    const addAttachment = document.getElementById('addAttachment');
    const recordVoice = document.getElementById('recordVoice');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');

    // Navigation
    if (navLinks) {
        navLinks.forEach(link => {
            if (link) {
                link.addEventListener('click', () => {
                    const pageId = link.getAttribute('data-page');
                    switchPage(pageId);
                });
            }
        });
    }

    // Back to Home Button
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            switchPage('home');
        });
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            theme = theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            updateThemeIcon();
        });
    }

    // Date Navigation
    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', () => {
            selectedDate.setDate(selectedDate.getDate() - 1);
            updateDateDisplay();
            loadTimeSlotsForDate(selectedDate);
        });
    }

    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', () => {
            selectedDate.setDate(selectedDate.getDate() + 1);
            updateDateDisplay();
            loadTimeSlotsForDate(selectedDate);
        });
    }

    // Set Time Button
    if (setTimeBtn) {
        setTimeBtn.addEventListener('click', () => {
            const newStartTime = startTimeInput.value;
            generateTimeSlots(newStartTime);
            renderTimeSlots();
            saveData();
        });
    }

    // Theme Buttons
    if (themeButtons) {
        themeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    const selectedTheme = btn.getAttribute('data-theme');
                    theme = selectedTheme;
                    document.documentElement.setAttribute('data-theme', theme);
                    localStorage.setItem('theme', theme);
                    
                    themeButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    updateThemeIcon();
                });
            }
        });
    }

    // Save Notes Button
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', () => {
            saveNotes();
        });
    }

    // Clear Notes Button
    if (clearNotesBtn) {
        clearNotesBtn.addEventListener('click', () => {
            if (richNotes) {
                richNotes.innerHTML = '';
                saveNotes();
            }
        });
    }

    // Update timers every second
    setInterval(() => {
        renderTimeSlots();
    }, 1000);

    // Initialize the app
    initializeApp();
});

// Update theme icon function
function updateThemeIcon() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (!icon || !text) return;
    
    if (theme === 'light') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    }
}

// Switch page function
function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Date Navigation
function updateDateDisplay() {
    currentDateDisplay.textContent = formatDate(selectedDate);
}

// Calendar Elements
const calendarDates = document.getElementById('calendarDates');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');

// Initialize calendar
currentMonth = new Date().getMonth();
currentYear = new Date().getFullYear();

// Render Calendar
function renderCalendar(month, year) {
    if (!calendarDates) return; // Guard clause for null element

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    calendarDates.innerHTML = '';
    if (monthYear) {
        monthYear.innerText = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
    }

    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'other-month';
        dayDiv.textContent = prevMonthDays - i;
        calendarDates.appendChild(dayDiv);
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day;

        // Format date for comparison (YYYY-MM-DD)
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check if it's today
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayDiv.classList.add('today');
        }

        // Check if it's selected
        if (selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && day === selectedDate.getDate()) {
            dayDiv.classList.add('selected');
        }

        // Check if it's a holiday
        if (publicHolidays && publicHolidays[dateString]) {
            dayDiv.classList.add('holiday');
            dayDiv.title = publicHolidays[dateString];
        }

        // Check if it has notes
        const hasNotes = checkIfDateHasNotes(year, month, day);
        if (hasNotes) {
            dayDiv.classList.add('has-notes');
        }

        // Add click event
        dayDiv.addEventListener('click', () => {
            document.querySelectorAll('.calendar-dates div.selected').forEach(el => {
                el.classList.remove('selected');
            });

            dayDiv.classList.add('selected');
            selectedDate = new Date(year, month, day);
            updateDateDisplay();
            renderTimeSlots();
            switchPage('home');
        });

        calendarDates.appendChild(dayDiv);
    }

    // Add next month's days
    const totalCells = 42;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'other-month';
        dayDiv.textContent = i;
        calendarDates.appendChild(dayDiv);
    }
}

// Event listeners for month navigation
prevMonth.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextMonth.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// Initial calendar render
renderCalendar(currentMonth, currentYear);

// Date Utilities
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatDateForStorage(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Load saved data from localStorage
function loadSavedData() {
    const savedStartTime = localStorage.getItem('startTime');
    const defaultStartTime = localStorage.getItem('defaultStartTime');
    
    if (defaultStartTime) {
        defaultStartTimeInput.value = defaultStartTime;
    }
    
    if (savedStartTime) {
        startTimeInput.value = savedStartTime;
    }
    
    loadTimeSlotsForDate(selectedDate);
}

// Load time slots for a specific date
function loadTimeSlotsForDate(date) {
    const dateString = formatDateForStorage(date);
    const savedSlots = localStorage.getItem(`timeSlots_${dateString}`);
    const daySpecificStartTime = localStorage.getItem(`startTime_${dateString}`);
    const defaultStartTime = localStorage.getItem('defaultStartTime') || '09:00';
    
    // Set the start time input to either the day-specific time or default time
    startTimeInput.value = daySpecificStartTime || defaultStartTime;
    
    if (savedSlots) {
        timeSlots = JSON.parse(savedSlots);
    } else {
        generateTimeSlots(startTimeInput.value);
    }
    
    renderTimeSlots();
}

// Generate time slots based on start time
function generateTimeSlots(startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const baseDate = new Date(selectedDate);
    baseDate.setHours(hours, minutes, 0, 0);

    timeSlots = [];
    for (let i = 0; i < 6; i++) {
        const slotStart = new Date(baseDate);
        slotStart.setHours(baseDate.getHours() + (i * 4));
        
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(slotStart.getHours() + 4);

        timeSlots.push({
            id: `slot-${i}`,
            startTime: formatTime(slotStart),
            endTime: formatTime(slotEnd),
            title: `Slot ${i + 1}`,
            notes: '',
            isActive: false,
            startTimestamp: slotStart.getTime(),
            endTimestamp: slotEnd.getTime()
        });
    }
}

// Format time as HH:MM AM/PM
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Calculate time remaining in a slot
function calculateTimeRemaining(slot) {
    const now = new Date();
    const nowTimestamp = now.getTime();
    
    // If we're viewing a different date than today, show static status
    if (!isSameDay(now, selectedDate)) {
        if (now < new Date(slot.startTimestamp)) {
            return 'Upcoming';
        } else if (now > new Date(slot.endTimestamp)) {
            return 'Ended';
        }
    }
    
    // For today's slots, calculate the actual countdown
    if (nowTimestamp < slot.startTimestamp) {
        // Slot hasn't started yet
        const diff = slot.startTimestamp - nowTimestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `Starts in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (nowTimestamp > slot.endTimestamp) {
        // Slot has ended
        return 'Ended';
    } else {
        // Slot is active, show countdown
        const diff = slot.endTimestamp - nowTimestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Update active slot
function updateActiveSlot() {
    const now = new Date();
    const nowTimestamp = now.getTime();
    
    timeSlots.forEach(slot => {
        slot.isActive = isSameDay(now, selectedDate) && 
                        nowTimestamp >= slot.startTimestamp && 
                        nowTimestamp < slot.endTimestamp;
    });
}

// Render time slots
function renderTimeSlots() {
    updateActiveSlot();
    
    const slotsHTML = timeSlots.map(slot => {
        const timeRemaining = calculateTimeRemaining(slot);
        const isActive = slot.isActive;
        const hasNotes = slot.notes && slot.notes.trim() !== '';
        
        return `
            <div class="time-slot ${isActive ? 'active' : ''}" data-id="${slot.id}">
                <div class="slot-header">
                    <input type="text" class="slot-title" value="${slot.title}" 
                        onchange="updateSlotTitle('${slot.id}', this.value)">
                    <span class="slot-time">${slot.startTime} - ${slot.endTime}</span>
                </div>
                <div class="slot-timer ${isActive ? 'active' : ''}">
                    <i class="fas fa-clock"></i>
                    <span>${timeRemaining}</span>
                </div>
                <div class="slot-actions">
                    <button class="notes-btn ${hasNotes ? 'has-notes' : ''}" onclick="openNotes('${slot.id}')">
                        <i class="fas fa-sticky-note"></i> Notes
                    </button>
                </div>
            </div>
        `;
    }).join('');

    timeSlotsContainer.innerHTML = slotsHTML;
}

// Update slot title
function updateSlotTitle(slotId, newTitle) {
    const slot = timeSlots.find(s => s.id === slotId);
    if (slot) {
        slot.title = newTitle;
        saveData();
    }
}

// Open notes for a specific slot
function openNotes(slotId) {
    currentSlotId = slotId;
    const slot = timeSlots.find(s => s.id === slotId);
    
    if (slot) {
        // Update notes page title
        const notesPageTitle = document.getElementById('notesPageTitle');
        if (notesPageTitle) {
            notesPageTitle.textContent = `Notes: ${slot.title} (${slot.startTime} - ${slot.endTime})`;
        }
        
        // Load notes for this slot
        loadNotes(slotId);
        
        // Switch to notes page
        switchPage('notes');
    }
}

// Auto-save functionality
function setupAutoSave() {
    // Clear any existing interval
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    // Set up new auto-save timeout
    autoSaveTimeout = setTimeout(() => {
        saveNotes();
        showAutoSaveIndicator();
    }, autoSaveInterval);
}

// Initialize IndexedDB
async function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('timeslot-db', 1);
        
        request.onerror = () => {
            console.error('Error opening IndexedDB');
            reject(request.error);
        };
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('handles')) {
                db.createObjectStore('handles', { keyPath: 'id' });
            }
        };
    });
}

// Save directory handle to IndexedDB
async function saveDirectoryHandle(handle) {
    try {
        const db = await initIndexedDB();
        const transaction = db.transaction(['handles'], 'readwrite');
        const store = transaction.objectStore('handles');
        
        // Store the handle with a specific ID
        await store.put({ id: 'directoryHandle', handle: handle });
        console.log('Directory handle saved to IndexedDB');
    } catch (err) {
        console.error('Error saving directory handle:', err);
    }
}

// Load directory handle from IndexedDB
async function loadDirectoryHandle() {
    try {
        const db = await initIndexedDB();
        const transaction = db.transaction(['handles'], 'readonly');
        const store = transaction.objectStore('handles');
        
        const result = await store.get('directoryHandle');
        if (result && result.handle) {
            dirHandle = result.handle;
            storageLocationInput.value = dirHandle.name;
            console.log('Directory handle loaded from IndexedDB');
            return true;
        }
    } catch (err) {
        console.error('Error loading directory handle:', err);
    }
    return false;
}

// Get file handle for a specific date and slot
async function getFileHandle(dateString, slotId) {
    if (!dirHandle) return null;
    
    const key = `${dateString}_${slotId}`;
    if (!fileHandles.has(key)) {
        try {
            const fileName = `notes_${dateString}_${slotId}.md`;
            // Use the File System Access API correctly
            const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
            fileHandles.set(key, fileHandle);
            console.log(`File handle created for ${fileName}`);
            return fileHandle;
        } catch (err) {
            console.error('Error getting file handle:', err);
            return null;
        }
    }
    return fileHandles.get(key);
}

// Save notes with file system handling
async function saveNotes() {
    if (!currentSlotId) return;
    
    const dateString = formatDateForStorage(selectedDate);
    const richNotes = document.getElementById('richNotes');
    if (!richNotes) return;
    
    const notesContent = richNotes.innerHTML;
    
    // Find the slot and update its notes
    const slot = timeSlots.find(s => s.id === currentSlotId);
    if (slot) {
        slot.notes = notesContent;
        
        if (dirHandle) {
            try {
                updateSaveStatus('saving');
                const fileHandle = await getFileHandle(dateString, currentSlotId);
                if (fileHandle) {
                    const writable = await fileHandle.createWritable();
                    await writable.write(`# Notes for ${slot.title} (${slot.startTime} - ${slot.endTime})\n\n${notesContent}`);
                    await writable.close();
                    updateSaveStatus('saved');
                    showAutoSaveIndicator('Saved');
                    console.log(`Notes saved to file for ${dateString}_${currentSlotId}`);
                }
            } catch (err) {
                console.error('Error saving to file system:', err);
                updateSaveStatus('error');
                // Fallback to localStorage
                localStorage.setItem(`notes_${dateString}_${currentSlotId}`, notesContent);
                showAutoSaveIndicator('Error saving to file system');
            }
        } else {
            // Save to localStorage if no directory handle
            localStorage.setItem(`notes_${dateString}_${currentSlotId}`, notesContent);
            updateSaveStatus('saved');
        }
        
        saveData();
    }
}

// Load notes with file system handling
async function loadNotes(slotId) {
    if (!slotId) return;
    
    const dateString = formatDateForStorage(selectedDate);
    let notesContent = '';
    
    if (dirHandle) {
        try {
            const fileHandle = await getFileHandle(dateString, currentSlotId);
            if (fileHandle) {
                const file = await fileHandle.getFile();
                notesContent = await file.text();
                console.log(`Notes loaded from file for ${dateString}_${currentSlotId}`);
                
                // Extract the actual notes content (skip the header)
                const contentLines = notesContent.split('\n');
                if (contentLines.length > 2) {
                    notesContent = contentLines.slice(2).join('\n');
                }
            }
        } catch (err) {
            console.error('Error loading from file system:', err);
            // Fallback to localStorage
            notesContent = localStorage.getItem(`notes_${dateString}_${currentSlotId}`);
        }
    } else {
        // Load from localStorage if no directory handle
        notesContent = localStorage.getItem(`notes_${dateString}_${currentSlotId}`);
    }
    
    const richNotes = document.getElementById('richNotes');
    if (richNotes) {
        if (notesContent) {
            richNotes.innerHTML = notesContent;
        } else {
            richNotes.innerHTML = '';
            richNotes.setAttribute('data-placeholder', 'Start typing your notes here...');
        }
    }
}

// Update save status indicator
function updateSaveStatus(status) {
    saveStatus = status;
    const saveIndicator = document.getElementById('saveIndicator');
    if (saveIndicator) {
        saveIndicator.textContent = status === 'saving' ? 'Saving...' : 
                                   status === 'saved' ? 'Saved ✅' : 
                                   'Error ❌';
        saveIndicator.className = `save-indicator ${status}`;
    }
}

// Show auto-save indicator
function showAutoSaveIndicator(message = 'Auto-saved') {
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    indicator.textContent = message;
    document.body.appendChild(indicator);

    setTimeout(() => {
        indicator.remove();
    }, 2000);
}

// Rich Text Editor Functions
function formatText(command, value = null) {
    const richNotes = document.getElementById('richNotes');
    if (!richNotes) return;
    
    document.execCommand(command, false, value);
    richNotes.focus();
    setupAutoSave();
}

function handleFormatButton(button) {
    if (!button) return;
    
    const format = button.getAttribute('data-format');
    
    switch (format) {
        case 'bold':
            formatText('bold');
            break;
        case 'italic':
            formatText('italic');
            break;
        case 'underline':
            formatText('underline');
            break;
        case 'strikethrough':
            formatText('strikethrough');
            break;
        case 'bullet':
            formatText('insertUnorderedList');
            break;
        case 'number':
            formatText('insertOrderedList');
            break;
        case 'link':
            const url = prompt('Enter the URL:');
            if (url) formatText('createLink', url);
            break;
        case 'image':
            const imageUrl = prompt('Enter the image URL:');
            if (imageUrl) formatText('insertImage', imageUrl);
            break;
        case 'code':
            const code = prompt('Enter the code:');
            if (code) {
                const pre = document.createElement('pre');
                const codeElement = document.createElement('code');
                codeElement.textContent = code;
                pre.appendChild(codeElement);
                richNotes.appendChild(pre);
                setupAutoSave();
            }
            break;
        case 'quote':
            formatText('formatBlock', '<blockquote>');
            break;
    }
    
    updateFormatButtons();
}

function updateFormatButtons() {
    if (!formatButtons) return;
    
    formatButtons.forEach(button => {
        if (!button) return;
        
        const format = button.getAttribute('data-format');
        let isActive = false;
        
        switch (format) {
            case 'bold':
                isActive = document.queryCommandState('bold');
                break;
            case 'italic':
                isActive = document.queryCommandState('italic');
                break;
            case 'underline':
                isActive = document.queryCommandState('underline');
                break;
            case 'strikethrough':
                isActive = document.queryCommandState('strikethrough');
                break;
            case 'bullet':
                isActive = document.queryCommandState('insertUnorderedList');
                break;
            case 'number':
                isActive = document.queryCommandState('insertOrderedList');
                break;
        }
        
        button.classList.toggle('active', isActive);
    });
}

// Pin note functionality
function togglePinNote() {
    if (!currentSlotId) return;
    
    const dateString = formatDateForStorage(selectedDate);
    const pinnedNotes = JSON.parse(localStorage.getItem('pinnedNotes') || '[]');
    const noteKey = `${dateString}_${currentSlotId}`;
    
    const index = pinnedNotes.indexOf(noteKey);
    if (index === -1) {
        pinnedNotes.push(noteKey);
        showAutoSaveIndicator('Note pinned');
    } else {
        pinnedNotes.splice(index, 1);
        showAutoSaveIndicator('Note unpinned');
    }
    
    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
    updatePinnedNotesList();
}

function updatePinnedNotesList() {
    const pinnedNotesList = document.getElementById('pinnedNotesList');
    if (!pinnedNotesList) return;
    
    const pinnedNotes = JSON.parse(localStorage.getItem('pinnedNotes') || '[]');
    pinnedNotesList.innerHTML = '';
    
    pinnedNotes.forEach(noteKey => {
        const [dateString, slotId] = noteKey.split('_');
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const slot = timeSlots.find(s => s.id === slotId);
        
        if (slot) {
            const noteElement = document.createElement('div');
            noteElement.className = 'pinned-note';
            noteElement.innerHTML = `
                <div class="pinned-note-header">
                    <span class="pinned-note-title">${slot.title}</span>
                    <span class="pinned-note-date">${formatDate(date)}</span>
                </div>
                <div class="pinned-note-time">${slot.startTime} - ${slot.endTime}</div>
            `;
            
            noteElement.addEventListener('click', () => {
                selectedDate = date;
                openNotes(slotId);
            });
            
            pinnedNotesList.appendChild(noteElement);
        }
    });
}

// Focus mode functionality
function toggleFocusMode() {
    const editorContainer = document.querySelector('.editor-container');
    if (!editorContainer) return;
    
    editorContainer.classList.toggle('focus-mode');
    const isFocusMode = editorContainer.classList.contains('focus-mode');
    localStorage.setItem('focusMode', isFocusMode);
}

// Initialize focus mode from saved preference
function initializeFocusMode() {
    const editorContainer = document.querySelector('.editor-mode');
    if (!editorContainer) return;
    
    const isFocusMode = localStorage.getItem('focusMode') === 'true';
    if (isFocusMode) {
        editorContainer.classList.add('focus-mode');
    }
}

// Add event listeners for rich text editor
document.addEventListener('DOMContentLoaded', () => {
    // Format buttons
    if (formatButtons) {
        formatButtons.forEach(button => {
            if (button) {
                button.addEventListener('click', () => handleFormatButton(button));
            }
        });
    }
    
    // Rich notes editor
    if (richNotes) {
        richNotes.addEventListener('input', () => {
            setupAutoSave();
            updateFormatButtons();
        });
        
        richNotes.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                updateFormatButtons();
            }
        });
        
        richNotes.addEventListener('focus', () => {
            if (richNotes.innerHTML === '') {
                richNotes.removeAttribute('data-placeholder');
            }
        });
        
        richNotes.addEventListener('blur', () => {
            if (richNotes.innerHTML === '') {
                richNotes.setAttribute('data-placeholder', 'Start typing your notes here...');
            }
        });
    }
    
    // Pin note button
    const pinNoteBtn = document.getElementById('pinNote');
    if (pinNoteBtn) {
        pinNoteBtn.addEventListener('click', togglePinNote);
    }
    
    // Focus mode button
    const focusModeBtn = document.getElementById('toggleFocusMode');
    if (focusModeBtn) {
        focusModeBtn.addEventListener('click', toggleFocusMode);
    }
    
    // Initialize focus mode
    initializeFocusMode();
    
    // Update pinned notes list
    updatePinnedNotesList();
});

// Settings
saveDefaultTimeBtn.addEventListener('click', () => {
    const newDefaultTime = defaultStartTimeInput.value;
    localStorage.setItem('defaultStartTime', newDefaultTime);
    
    // Only update current start time if no day-specific time is set
    const dateString = formatDateForStorage(selectedDate);
    const daySpecificStartTime = localStorage.getItem(`startTime_${dateString}`);
    if (!daySpecificStartTime) {
        startTimeInput.value = newDefaultTime;
        generateTimeSlots(newDefaultTime);
        renderTimeSlots();
    }
    
    showAutoSaveIndicator('Default start time saved');
});

exportDataBtn.addEventListener('click', () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'timeslot-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

importDataBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Clear existing data
                localStorage.clear();
                
                // Import new data
                for (const key in data) {
                    localStorage.setItem(key, data[key]);
                }
                
                // Reload the app
                loadSavedData();
                renderCalendar(currentMonth, currentYear);
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
});

clearDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        loadSavedData();
        renderCalendar(currentMonth, currentYear);
        richNotes.innerHTML = '<p>Start typing your notes here...</p>';
        alert('All data has been cleared.');
    }
});

// Function to save data to localStorage
function saveData() {
    const dateString = formatDateForStorage(selectedDate);
    
    // Save the start time specifically for this date
    localStorage.setItem(`startTime_${dateString}`, startTimeInput.value);
    
    // Save time slots
    localStorage.setItem(`timeSlots_${dateString}`, JSON.stringify(timeSlots));
    
    // Show save indicator
    showAutoSaveIndicator('Changes saved');
}

// Function to check if a date has notes
function checkIfDateHasNotes(year, month, day) {
    const dateString = formatDateForStorage(new Date(year, month, day));
    const savedNotes = localStorage.getItem(`notes_${dateString}`);
    return savedNotes && savedNotes.trim() !== '';
}

document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements
    const markdownEditor = document.getElementById('markdownEditor');
    const previewPanel = document.getElementById('previewPanel');
    const saveIndicator = document.getElementById('saveIndicator');
    const toggleFocusMode = document.getElementById('toggleFocusMode');
    const pinNote = document.getElementById('pinNote');
    const formatButtons = document.querySelectorAll('.format-btn');
    const tagInput = document.getElementById('tagInput');
    const addAttachment = document.getElementById('addAttachment');
    const recordVoice = document.getElementById('recordVoice');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Initialize notes features
    if (markdownEditor && previewPanel) {
        // Markdown editor event listeners
        markdownEditor.addEventListener('input', () => {
            updatePreview();
            autoSave();
        });

        // Format buttons
        formatButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyFormat(button.getAttribute('data-format'));
            });
        });
    }

    // Focus mode toggle
    if (toggleFocusMode) {
        toggleFocusMode.addEventListener('click', () => {
            document.querySelector('.editor-container').classList.toggle('focus-mode');
        });
    }

    // Pin note functionality
    if (pinNote) {
        pinNote.addEventListener('click', () => {
            togglePinNote();
        });
    }

    // Tag input handling
    if (tagInput) {
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput.textContent.trim());
                tagInput.textContent = '';
            }
        });
    }

    // Attachment handling
    if (addAttachment) {
        addAttachment.addEventListener('click', () => {
            handleAttachment();
        });
    }

    // Voice recording
    if (recordVoice) {
        recordVoice.addEventListener('click', () => {
            toggleVoiceRecording();
        });
    }

    // Settings panel
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsPanel.classList.remove('active');
        });
    }

    // Font settings
    if (fontFamily) {
        fontFamily.addEventListener('change', (e) => {
            updateFontFamily(e.target.value);
        });
    }

    if (fontSize) {
        fontSize.addEventListener('input', (e) => {
            updateFontSize(e.target.value);
        });
    }

    // Theme settings
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            updateTheme(theme);
            
            // Update active state of theme buttons
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});

// Utility Functions
function updatePreview() {
    if (!previewPanel || !markdownEditor) return;
    // Convert markdown to HTML and update preview
    previewPanel.innerHTML = convertMarkdownToHtml(markdownEditor.textContent);
}

function autoSave() {
    if (!saveIndicator) return;
    saveIndicator.textContent = 'Saving...';
    saveIndicator.classList.remove('saved');
    
    // Debounce save operation
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
        saveNotes();
        saveIndicator.textContent = 'Saved ✓';
        saveIndicator.classList.add('saved');
    }, 1000);
}

function applyFormat(format) {
    const markdownEditor = document.getElementById('markdownEditor');
    if (!markdownEditor) return;
    
    try {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            // No selection, just insert the format at cursor position
            const formattedText = getFormattedText(format, '');
            document.execCommand('insertText', false, formattedText);
            return;
        }
        
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        let formattedText = getFormattedText(format, selectedText);
        
        const textNode = document.createTextNode(formattedText);
        range.deleteContents();
        range.insertNode(textNode);
        
        autoSave();
    } catch (err) {
        console.error('Error applying format:', err);
    }
}

// Helper function to get formatted text
function getFormattedText(format, selectedText) {
    switch (format) {
        case 'bold':
            return `**${selectedText}**`;
        case 'italic':
            return `*${selectedText}*`;
        case 'heading':
            return `\n# ${selectedText}`;
        case 'list':
            return `\n- ${selectedText}`;
        case 'checkbox':
            return `\n- [ ] ${selectedText}`;
        case 'link':
            return `[${selectedText}](url)`;
        case 'image':
            return `![${selectedText}](image-url)`;
        case 'audio':
            return `🎤 ${selectedText}`;
        default:
            return selectedText;
    }
}

// Add other utility functions as needed
function convertMarkdownToHtml(markdown) {
    // Simple markdown to HTML conversion
    return markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n# (.*)/g, '<h1>$1</h1>')
        .replace(/\n- \[ \] (.*)/g, '<div class="checkbox">☐ $1</div>')
        .replace(/\n- \[x\] (.*)/g, '<div class="checkbox checked">☑ $1</div>')
        .replace(/\n- (.*)/g, '<li>$1</li>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
}

// Initialize the application
initializeApp(); 