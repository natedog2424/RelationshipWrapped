// Chart.js setup for message statistics
let messageChart = null;

// Sample data - replace with actual data
const chartData = {
    dayOfWeek: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        data: [1652, 1701, 1567, 1909, 1427, 1114, 1658]
    },
    byHour: {
        labels: ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'],
        data: [237, 96, 50, 0, 0, 0, 16, 111, 409, 476, 720, 678, 741, 742, 613, 667, 646, 577, 615, 681, 912, 828, 718, 495]
    }
};

function initChart() {
    const ctx = document.getElementById('messageChart');
    if (!ctx) return;

    messageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.dayOfWeek.labels,
            datasets: [{
                label: 'Messages',
                data: chartData.dayOfWeek.data,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });
}

function switchChart(chartType) {
    if (!messageChart) return;

    const data = chartData[chartType];
    messageChart.data.labels = data.labels;
    messageChart.data.datasets[0].data = data.data;
    messageChart.update();
}

// Toggle button handlers
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
        // Remove active class from all buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        e.target.classList.add('active');

        // Switch chart
        const chartType = e.target.getAttribute('data-chart');
        switchChart(chartType);
    }
});

// Initialize chart when page loads
window.addEventListener('load', () => {
    setTimeout(initChart, 500);
    setTimeout(initWordCloud, 500);
});

// Make chart data available globally for customization
window.chartData = chartData;

// Word Cloud Chart
let wordCloudChart = null;

// Sample word data - replace with actual message data
const wordData = [
    { 'key': 'good', 'value': 606 },{ 'key': 'love', 'value': 519 },{ 'key': 'like', 'value': 475 },{ 'key': 'ok', 'value': 461 },{ 'key': 'loved', 'value': 443 },{ 'key': 'yeah', 'value': 405 },{ 'key': "it's", 'value': 389 },{ 'key': "that's", 'value': 315 },{ 'key': 'oh', 'value': 310 },{ 'key': 'get', 'value': 303 },{ 'key': 'lol', 'value': 303 },{ 'key': 'think', 'value': 267 },{ 'key': 'got', 'value': 260 }, { 'key': 'nice', 'value': 248 }, { 'key': "don't", 'value': 221 }, { 'key': 'work', 'value': 212 }, { 'key': "i'll", 'value': 208 }, { 'key': 'gonna', 'value': 208 }, { 'key': 'miss', 'value': 203 }, { 'key': 'see', 'value': 200 }, { 'key': 'time', 'value': 199 }, { 'key': 'call', 'value': 189 }, { 'key': "you're", 'value': 187 }, { 'key': 'going', 'value': 187 }, { 'key': 'go', 'value': 186 }, { 'key': 'back', 'value': 180 }, { 'key': 'one', 'value': 172 }, { 'key': 'morning', 'value': 165 }, { 'key': 'know', 'value': 161 }, { 'key': 'also', 'value': 160 }, { 'key': 'yes', 'value': 159 }, { 'key': 'omg', 'value': 156 }, { 'key': 'sorry', 'value': 156 }, { 'key': "how's", 'value': 156 }, { 'key': 'day', 'value': 147 }, { 'key': 'sounds', 'value': 146 }, { 'key': "didn't", 'value': 144 }, { 'key': 'really', 'value': 144 }, { 'key': 'fun', 'value': 143 }, { 'key': 'home', 'value': 139 }, { 'key': 'liked', 'value': 133 }, { 'key': 'wait', 'value': 129 }, { 'key': 'though', 'value': 129 }, { 'key': '❤️', 'value': 125 }, { 'key': '😭', 'value': 124 }, { 'key': 'baby', 'value': 120 }, { 'key': 'come', 'value': 119 }, { 'key': 'much', 'value': 119 }, { 'key': 'rn', 'value': 119 }, { 'key': 'laughed', 'value': 118 },
];

function initWordCloud() {
    const ctx = document.getElementById('wordCloudChart');
    if (!ctx) return;

    wordCloudChart = new Chart(ctx, {
        type: 'wordCloud',
        data: {
            labels: wordData.map(d => d.key.charAt(0).toUpperCase() + d.key.slice(1)),
            datasets: [{
                label: 'Size',
                data: wordData.map(d => d.value / 7),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            },
            elements: {
                word: {
                    color: '#ffffffa8',
                    family: 'Hind',
                    weight: 'bold',
                    minRotation: 0,
                    maxRotation: 0,
                    rotationSteps: 0,
                    padding: 2
                }
            },
            fit: true
        }
    });
}

// Make word cloud data available globally for customization
window.wordData = wordData;
