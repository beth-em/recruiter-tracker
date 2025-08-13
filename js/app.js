let candidates = [];             // Array to store all candidate data
let currentData = new Date();    // Current date for calendar
let draggedElement = null;       // Element currently being dragged

// DOM element references (elements we will interact with)
const sideBar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const navTabs = document.getElementById('.nav-tab');
const tabContents = document.getElementById('.tab-content');
const addCandidateBtn = document.getElementById('addCandidateBtn');
const candidateModal = document.getElementById('candidateModal');
const closeModal = document.getElementById('closeModal');
const candidateForm = document.getElementById('candidateForm');

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Recruiter Tracker app stating...');
    setupEventListeners();      // Set up all click and interaction handlers
    generateCalender();         // Create the calendar view
    loadSampleData();           // Add some sample candidates for demonstration
    console.log('App initialized successfully!');
});

// Set up all event listeners for user interactions
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Sidebar toggle functionality
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');      // Add/remove collapsed class
        console.log('Sidebar toggled');
    });

    // Navigation tab switching
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;       // Get tab name from data attribute
            switchTab(tabName);                     // Switch to selected tab
            console.log(`Switched to ${tabName} tab`);
        });
    });

    // Modal controls
    addCandidateBtn.addEventListener('click', () => {
        candidateModal.style.display = 'block';
        console.log('Add candidate modal opened');
    });

    closeModal.addEventListener('click', () => {
        candidateModal.style.display = 'none';
        console.log('Modal closed');
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === candidateModal) {
            candidateModal.style.display = 'none';
            console.log('Modal closed by clicking outside');
        }
    });

    // Form submission for adding new candidates
    candidateForm.addEventListener('submit', handleAddCandidate);

    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);       // Go to previous month
        generateCalender();                                     // Regenerate calendar
        console.log('Moved to previous month');
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);       // Go to next month
        generateCalendar();                                     // Regenerate calendar
        console.log('Moved to next month');
    });

    // Set up drag and drop for kanban board
    setupDragAndDrop();

    console.log('All event listeners set up');
}

// Switch between ddifferent tabs
function switchTab(tabName) {
    // Remove active class from all tabs
    navTabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add(active);
    document.getElementById(`${tabName}-content`).classList.add('active');
}

// Handle adding a new candidate
function handleAddCandidate(event) {
    event.preventDefault();         // Prevent form from submitting normally
    console.log('Adding new candidate...');

    // Get form values
    const name = document.getElementById('candidateForm').value.trim();
    const position = document.getElementById('candidatePosition').value.trim();
    const email = document.getElementById('candidateEmail').value.trim();
    const status = document.getElementById('candidateStatus').value;

    // Validate form data
    if (!name || !position || !email) {
        alert('Please fill in all required fields');
        return;
    }

    // Create new candidate object
    const newCandidate = {
        id: Date.now(),                         // Use timestamp as unique ID
        name: name,
        position: position,
        email: email,
        status: status,
        dateAdded: new Date().toISOString()     // Track when candidate was added
    };

    // Add candidate to our data array
    candidates.push(newCandidate);

    // Create and display the candidate card
    createCandidateCard(newCandidate);

    // Update column counts
    updateColumnCounts();

    // Reset form and close modal
    candidateForm.reset();
    candidateModal.style.display = 'none';

    console.log(`Added candidate: ${name} (${position})`); 
}

// Create a visual card for a candidate
function createCandidateCard(candidate) {
    console.log(`Creating card for ${candidate.name}`);

    // Create the card element
    const card = document.createElement('div');
    card.className = 'candidate-card loading';      // Add loading class animation
    card.dataset.id = candidate.id;                 // Store candidate ID for reference
    card.draggable = true;                          // Make the card draggable

    // Set the card's HTML content
    card.innerHTML = `
    <div class="candidate-name">${escapeHtml(candidate.name)}</div>
    <div class="candidate-position">${escapeHtml(candidate.position)}</div>
    <div class="candidate-email">${escapeHtml(candidate.email)}</div>
    `;

    // Add drag event listeners to the card
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    // Add click event for future card details functionality
    card.addEventListener('click', function(e) {
        // Prevent click during drag
        if (!card.classList.contains('dragging')) {
            console.log(`Clicked on ${candidate.name}'s card`);
        }
    });

    // Find the correct column and add the card
    const column = document.querySelector(`[data-status="${candidate.status}"] .cards-container`);
    if (column) {
        column.appendChild(card);

        // Remove loading class after a short delay for animation
        setTimeout(() => {
            card.classList.remove('loading');
        }, 100);
    } else {
        console.error(`Could not find column for status: ${candidate.status}`);
    }
}

// Utility function to escape HTML to prevent XSS attacks
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&alt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Set up drag and drop functionality for the kanban board
function setupDragAndDrop() {
    console.log('Setting up drag and drop...');

    const columns = document.querySelectorAll('.kanban-column');

    // Add event listeners to each column
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });

    console.log('Drag and drop set up!');
}

// Handle when drag starts
function handleDragStart(event) {
    draggedElement = event.target;               // Store reference to dragged element
    event.target.classList.add('dragging');      // Add visual feedback
    
    // Set drag data for better browser compatibility 
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);

    console.log(`Started dragging: ${event.target.querySelector('.candidate-name').textContent}`);
}

// Handle when drag ends
function handleDragEnd(event) {
    event.target.classList.remove('dragging');      // Remove visual feedback
    draggedElement = null;                          // Clear reference

    // Remove drop zone styling from all columns
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drop-zone-active');
    });

    console.log('Drag ended');
}

// Handle drag over column
function handleDragOver(event) {
    event.preventDefault();         // Allow dropping
    event.dataTransfer.dropEffect = 'move';
}

// Handle drag enter column
function handleDragEnter(event) {
    if (event.target.classList.contains('kanban-column')) {
        event.target.classList.add('drop-zone-active');         // Visual feedback
    }
}

// Handle drag leave column
function handleDragLeave(event) {
    // Only remove styling if we're actuall leaving the column
    if (event.target.classList.contains('kanban-column') && 
        !event.target.contains(event.relatedTarget)) {
        event.target.classList.remove('drop-zone-active');      // Remove visual feedback        
    }
}

// Handle dropping a card onto a column
function handleDrop(event) {
    event.preventDefault();

    // Find the column that was dropped on
    let dropColumn = event.target;
    while (dropColumn && !dropColumn.classList.contains('kanban-column')) {
        dropColumn = dropColumn.parentElement;
    }

    if (dropColumn && draggedElement) {
        const newStatus = dropColumn.dataset.status;            // Get new status
        const cardId = parseInt(draggedElement.dataset.id);     // Get candidate ID

        console.log(`Dropping candidate ${cardId} into ${newStatus} column`);

        // Update candidate data
        const candidate = candidate.find(c => c.id === cardId);
        if (candidate) {
            const oldStatus = candidate.status;
            candidate.status = newStatus;           // Update status in data
            console.log(`Updated ${candidate.name} from ${oldStatus} to ${newStatus}`);
        }

        // Move the card to new column
        const cardsContainer = dropColumn.querySelector('.cards-container');
        cardsContainer.appendChild(draggedElement);

        // Add animation class
        draggedElement.classList.add('moved');
        setTimeout(() => {
            draggedElement.classList.remove('moved');
        }, 300);

        // Update column counts after move
        updateColumnsCount();
    }

    // Remove drop zone styling
    if (dropColumn) {
        dropColumn.classList.remove('drop-zone-active');
    }
}

// Update the count display for each column
function updateColumnCounts() {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(column => {
        const status = column.dataset.status;                                   // Get column status
        const cardsCount = column.querySelectorAll('.candidate-card').length;   // Get card count
        const countElement = column.querySelector('.column-count');

        if (countElement) {
            // Update count text with proper grammar
            countElement.textContent = `${cardsCount} candidates${cardsCount === 1 ? 's' : ''}`;
        }
    });

    console.log('Column counts updated');
}

// Load sample data for demonstration purposes
function loadSampleData() {
    console.log('Loading sample data');

    // Sample candidates to deomnstrate the app
    const sampleCandidates = [
        {
            id: 1,
            names: 'Eli Miller',
            position: 'Frontend Developer',
            email: 'eli.miller@email.com',
            status: 'all',
            dateAdded: new Date().toISOString()
        },
        {
            id: 2,
            names: 'Benny Bucco',
            position: 'Backend Developer',
            email: 'benny.bucco@email.com',
            status: 'applied',
            dateAdded: new Date().toISOString()
        },
        {
            id: 3,
            names: 'Sully Sullivan',
            position: 'Project Manager',
            email: 'sully.sullivan@email.com',
            status: 'offer',
            dateAdded: new Date().toISOString()
        },
        {
            id: 4,
            names: 'Elise Smith',
            position: 'Senior Engineer',
            email: 'elise.smith@email.com',
            status: 'interviewed',
            dateAdded: new Date().toISOString()
        },
        {
            id: 5,
            names: 'Rosie Ross',
            position: 'Data Scientist',
            email: 'rosie.ross@email.com',
            status: 'rejected',
            dateAdded: new Date().toISOString()
        },
        {
            id: 6,
            names: 'Seth Cohen',
            position: 'UX Designer',
            email: 'seth.cohen@email.com',
            status: 'offer',
            dateAdded: new Date().toISOString()
        }
    ];

    // Add sample candidates to our data array
    candidates = [...sampleCandidates];

    // Create cards for all sample candidates
    sampleCandidates.forEach(candidate => {
        createCandidateCard(candidate);
    });

    // Update column counts
    updateColumnCounts();

    console.log(`Loaded ${sampleCandidates.length} sample candidates`);
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
});

window.RecruiterTrack = {
    searchCandidates,
    exportCandidateData,
    getCandidateAnalytics,
    deleteCandidate
};