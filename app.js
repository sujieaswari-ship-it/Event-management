document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('eventForm');
    const eventsContainer = document.getElementById('eventsContainer');
    const totalCountEl = document.getElementById('totalEvents');
    const upcomingCountEl = document.getElementById('upcomingEvents');
    const completedCountEl = document.getElementById('completedEvents');
    const totalBudgetEl = document.getElementById('totalBudget');

    // Load events from LocalStorage
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Initial Render
    updateDashboard();

    // Form Submission
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newEvent = {
            id: Date.now(),
            name: document.getElementById('eventName').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            venue: document.getElementById('eventVenue').value,
            budget: parseFloat(document.getElementById('eventBudget').value) || 0,
            desc: document.getElementById('eventDesc').value,
            status: 'pending'
        };

        events.unshift(newEvent);
        saveEvents();
        updateDashboard();
        eventForm.reset();

        // Show subtle success toast (console for now)
        notify('Event successfully deployed with allocated budget.');
    });

    function updateDashboard() {
        renderEvents();
        updateStats();
    }

    function updateStats() {
        const now = new Date();
        const total = events.length;
        const upcoming = events.filter(e => new Date(e.date) >= now.setHours(0, 0, 0, 0)).length;
        const completed = total - upcoming;
        const totalBudget = events.reduce((sum, e) => sum + (e.budget || 0), 0);

        totalCountEl.textContent = total;
        upcomingCountEl.textContent = upcoming;
        completedCountEl.textContent = completed;
        totalBudgetEl.textContent = formatCurrency(totalBudget);
    }

    function renderEvents() {
        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="empty-state">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-data-found-8867280-7221008.png?f=webp" alt="No data" style="width: 150px; opacity: 0.3; margin-bottom: 20px;">
                    <p>Your agenda is clear. Ready to create impact?</p>
                </div>
            `;
            return;
        }

        eventsContainer.innerHTML = events.map(event => {
            const isPast = new Date(event.date) < new Date().setHours(0, 0, 0, 0);
            return `
                <div class="event-card anim-slide-in" data-id="${event.id}">
                    <div class="event-status-icon">
                        <i class="fas ${isPast ? 'fa-history' : 'fa-calendar-day'}"></i>
                    </div>
                    <div class="event-main">
                        <h3>${escapeHTML(event.name)}</h3>
                        <div class="event-meta">
                            <span><i class="far fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                            <span><i class="far fa-clock"></i> ${event.time}</span>
                            <span><i class="fas fa-map-pin"></i> ${escapeHTML(event.venue)}</span>
                            <span class="budget-pill"><i class="fas fa-wallet"></i> ${formatCurrency(event.budget)}</span>
                        </div>
                        ${event.desc ? `<p class="event-description">${escapeHTML(event.desc)}</p>` : ''}
                    </div>
                    <div class="event-actions">
                        <button class="btn-delete" title="Delete Event" onclick="deleteEvent(${event.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function saveEvents() {
        localStorage.setItem('events', JSON.stringify(events));
    }

    window.deleteEvent = (id) => {
        if (confirm('Are you sure you want to remove this event?')) {
            events = events.filter(e => e.id !== id);
            saveEvents();
            updateDashboard();
        }
    };

    function notify(msg) {
        console.log(`[EventPro] ${msg}`);
    }

    function formatDate(dateStr) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
