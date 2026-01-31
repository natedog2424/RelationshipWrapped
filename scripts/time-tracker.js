// Time tracking - calculates and updates time since relationship start
// Start date is sourced from met-date attribute on body element
// Flask should inject this as: <body met-date="YYYY-MM-DDTHH:MM:SS">

const startDateStr = document.body.getAttribute('met-date');
const startDate = new Date(startDateStr);

// Get DOM elements
const timeYears = document.getElementById('time-years');
const timeDays = document.getElementById('time-days');
const timeHours = document.getElementById('time-hours');
const timeMinutes = document.getElementById('time-minutes');
const timeSeconds = document.getElementById('time-seconds');

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateTime() {
    const now = new Date();
    const diff = now - startDate;

    // Calculate time units
    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalYears = (diff / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

    // Update data-value attributes for animations to use
    if (timeYears) {
        timeYears.setAttribute('data-value', totalYears);
        timeYears.textContent = totalYears;
    }
    if (timeDays) {
        timeDays.setAttribute('data-value', totalDays);
        timeDays.textContent = formatNumber(totalDays);
    }
    if (timeHours) {
        timeHours.setAttribute('data-value', totalHours);
        timeHours.textContent = formatNumber(totalHours);
    }
    if (timeMinutes) {
        timeMinutes.setAttribute('data-value', totalMinutes);
        timeMinutes.textContent = formatNumber(totalMinutes);
    }
    if (timeSeconds) {
        timeSeconds.setAttribute('data-value', totalSeconds);
        timeSeconds.textContent = formatNumber(totalSeconds);
    }
}

// Update immediately
updateTime();

// Update every second
setInterval(updateTime, 1000);
