// Calendar view
function generateCalendar() {
    console.log('Generating calendar...');

    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');

    // Clear existing calendar
    calendarGrid.innerHTML = '';

    // Get current month and year
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set month title
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 
        'August', 'September', 'October', 'November', 'December'
    ];
    currentMonthElement.textContext = `${monthNames[month]} ${year}`;

    // Create day of the week headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Get calendar calculation values
    const firstDay = new Date(year, month, 1).getDay();             // Day of week (0-6) for first day of month
    const daysInMonth = new Date(year, month + 1, 0).getDate();     // Number of days in current month
    const daysInPrevMonth = new Date(year, month, 0).getDate();     // Days in previous month

    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();
    
    console.log(`Calendar: ${monthNames[month]} ${year}, ${daysInMonth} days, starts on day ${firstDay}`);

    // Add empty cells for days before month starts
    for (let i = firstDay - 1; i > 0; 1--) {
        const dayElement = createCalendarDay(daysInPrevMonth - i, 'other-month', year, month -1);
        calendarGrid.appendChild(dayElement); 
    }

    // Add days of current month
    for (let day = 1; day < daysInMonth; day++) {
        const dayElement = createCalendarDay(day, 'current-month', year, month);

        // Highlight today
        if (isCurrentMonth && day === todayDate) {
            dayElement.classList.add('today');
        }

        calendarGrid.appendChild(dayElement);
    }

    // Calculate remaining cells needed to complete the grid ( 6 rows x 7 days = 42 cells)
    const totalCellsUsed = 7 + firstDay + daysInMonth;
    const remainingCells = 42 - totalCellsUsed;

    // Add days from next month to fill remaining cells
    for (let day = 1; day < remainingCells; day++) {
        const dayElement = createCalendarDay(day, 'other-month', year, month +1);
        calendarGrid.appendChild(dayElement);
    }

    console.log('Calendar generated successfully!');

    // Create individual calendar day element
    function createCalendarDay(dayNumber, monthType, year, month) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${monthType === 'other-month' ? 'other-month' : ''}`;

        // Create day structure
        dayElement.innerHTML = `
            <div class="day-number">${dayNumber}</div>
            <div class="calendar-day-events"></div>
        `;

        // Store date data for future use
        dayElement.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        dayElement.dataset.day = dayNumber;
        dayElement.dataset.month = month;
        dayElement.dataset.year = year;

        // Add click event for day selection
        dayElement.addEventListener('click', function() {
            handleDayClick(this, year, month, dayNumber);
        });

        // Add hover effects
        dayElement.addEventListener('mouseenter', function() {
            if (!this.classList.contains('other-month')) {
                this.style.transfrom = 'translateY(-2px)';
            }
        });

        dayElement.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });

        return dayElement;
    }

    // Handle day click events
    function handleDayClick(dayElement, year, month, dayNumber) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'Decemeber'
        ];

        console.log(`Clicked on ${monthNames[month]} ${dayNumber}, ${year}`);

        // Remove previous selections
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });

        // Add selection to clicked day
        if (!dayElement.classList.contains('other-month')) {
            dayElement.classList.add('selected');
        }

        showDayOptions(year, month, dayNumber);
    }

    function showDayOptions(year, month, dayNumber) {
        console.log(`Day options for ${year}-${month + 1}-${dayNumber}`);
    }

    // Future enhancements will include adding events to calendar

    // Navigate to specific month/year
    function navigateToMonth(year, month) {
        console.log(`Navigating to ${year}-${month + 1}`);

        currentDate = new Date(year, month, 1);
        generateCalendar();
    }

    // Navigate to today
    function navigateToToday() {
        console.log('Navigating to today');

        currentDate = new Date();
        generateCalendar();

        // Hightlight today's date
        setTimeout(() => {
            const todayElement = document.querySelector('.calendar-day.today');
            if (todayElement) {
                todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    // Get calendar month data
    function getCalendarData() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0). getDate();

        return {
            year,
            month,
            monthName: new Date(year, month).toLocaleString('en-US', { month: 'long' }),
            daysInMonth,
            firstDay: new Date(year, month, 1).getDay(),
            today: new Date(),
            isCurrentMonth: new Date().getFullYear() === year && new Date().getMonth() === month
        };
    }

    // Format date for display
    function formatCalendarDate(date, format = 'long') {
        const options = {
            short: { month: 'short', day: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            numeric: { year: 'numeric', month: '2-digit', day: '2-digit' }
        };

        return date.toLocaleString('en-US', options[format] || options.long);
    }

    // Check if date is weekend
    function isWeekend(year, month, day) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; 
    }

    // Check if date is today
    function isToday(year, month, day) {
        const today = new Date();
        return  today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
    }

    // Get days in month 
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
}

window.CalendarComponent = {
    generateCalendar,
    navigateToMonth,
    navigateToToday,
    addCalendarEvent,
    getEventsForDay,
    getCalendarData,
    isWeekend,
    isToday,
    getDaysInMonth
};