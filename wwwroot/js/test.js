//// wwwroot/js/dashboard.js

//let barChartInstance;
//let pieChartInstance;

//// Utility to create options in a select
//function populateSelect(selectId, data) {
//    const select = document.getElementById(selectId);
//    select.innerHTML = `<option value="">-- Select --</option>`;
//    data.forEach(item => {
//        const option = document.createElement('option');
//        option.value = item;
//        option.text = item;
//        select.add(option);
//    });
//}

//// Load companies and floors
//async function loadDropdowns() {
//    try {
//        // Load Companies
//        const companyRes = await fetch('/Dashboard/GetCompanyList');
//        const companies = await companyRes.json();
//        populateSelect('companySelect', companies);

//        // Load Floors
//        const floorRes = await fetch('/Dashboard/GetFloorList');
//        const floors = await floorRes.json();
//        populateSelect('floorSelect', floors);
//    } catch (err) {
//        console.error("Error loading dropdowns:", err);
//    }
//}

//// Load dashboard data based on selected company/floor
//async function loadDashboard() {
//    const company = document.getElementById("companySelect").value;
//    const floor = document.getElementById("floorSelect").value;

//    if (!company || !floor) {
//        alert("Please select both Company and Floor");
//        return;
//    }

//    document.getElementById("selectedFloor").innerText = floor;

//    try {
//        const res = await fetch(`/Dashboard/GetDashboardData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`);
//        const data = await res.json();

//        // Sort ascending by line name (assuming numeric names)
//        data.sort((a, b) => parseInt(a.name) - parseInt(b.name));

//        createBarChart(data);
//        createPieChart(data);

//        // Close offcanvas panel if open
//        const offcanvasEl = document.getElementById('filterPanel');
//        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
//        if (offcanvas) offcanvas.hide();

//    } catch (err) {
//        console.error("Error loading dashboard data:", err);
//    }
//}

//// Bar chart
//function createBarChart(data) {
//    const labels = data.map(d => d.name);
//    const values = data.map(d => d.value);

//    if (barChartInstance) {
//        barChartInstance.data.labels = labels;
//        barChartInstance.data.datasets[0].data = values;
//        barChartInstance.update();
//        return;
//    }

//    const ctx = document.getElementById('barChart').getContext('2d');
//    barChartInstance = new Chart(ctx, {
//        type: 'bar',
//        data: {
//            labels: labels,
//            datasets: [{
//                label: 'DHU %',
//                data: values,
//                backgroundColor: 'rgba(59,130,246,0.8)'
//            }]
//        },
//        options: {
//            responsive: true,
//            maintainAspectRatio: false,
//            scales: {
//                y: { beginAtZero: true }
//            }
//        }
//    });
//}

//// Pie chart
//function createPieChart(data) {
//    const labels = data.map(d => d.name);
//    const values = data.map(d => d.value);

//    if (pieChartInstance) {
//        pieChartInstance.data.labels = labels;
//        pieChartInstance.data.datasets[0].data = values;
//        pieChartInstance.update();
//        return;
//    }

//    const ctx = document.getElementById('pieChart').getContext('2d');
//    pieChartInstance = new Chart(ctx, {
//        type: 'pie',
//        data: {
//            labels: labels,
//            datasets: [{
//                data: values,
//                backgroundColor: labels.map((_, i) => `hsl(${i * 30 % 360}, 70%, 50%)`)
//            }]
//        },
//        options: {
//            responsive: true,
//            maintainAspectRatio: false,
//            plugins: {
//                legend: {
//                    position: 'bottom',
//                    labels: {
//                        color: 'black',
//                        font: { size: 14 }
//                    }
//                }
//            }
//        }
//    });
//}

//// Auto-load dropdowns and optionally load dashboard
//document.addEventListener('DOMContentLoaded', () => {
//    loadDropdowns();

//    // Optionally, auto-load dashboard if defaults exist
//    const companySelect = document.getElementById('companySelect');
//    const floorSelect = document.getElementById('floorSelect');

//    companySelect.addEventListener('change', () => {
//        if (floorSelect.value) loadDashboard();
//    });
//    floorSelect.addEventListener('change', () => {
//        if (companySelect.value) loadDashboard();
//    });
//});




let barChartInstance;
let pieChartInstance;

// ================== LOAD DASHBOARD DATA ==================
async function loadDashboard() {
    const company = document.getElementById("companySelect").value;
    const floor = document.getElementById("floorSelect").value;

    if (!company || !floor) {
        alert("Please select both Company and Floor");
        return;
    }

    const overlay = document.getElementById("loadingOverlay");
    overlay.style.display = "flex";
    document.body.style.cursor = "wait";

    // Force repaint before fetch
    await new Promise(requestAnimationFrame);

    document.getElementById("selectedFloor").innerText = floor;

    try {
        const res = await fetch(`/Dashboard/GetDashboardData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`);
        const data = await res.json();

        data.sort((a, b) => parseInt(a.name) - parseInt(b.name));

        createBarChart(data);
        createPieChart(data);

        // Close offcanvas if open
        const offcanvasEl = document.getElementById('filterPanel');
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (offcanvas) offcanvas.hide();

    } catch (err) {
        console.error(err);
        alert("Failed to load dashboard data.");
    } finally {
        overlay.style.display = "none";
        document.body.style.cursor = "default";
    }
}

// ================== BAR CHART ==================
//For Static Color
//function createBarChart(data) {
//    const labels = data.map(x => x.name);
//    const values = data.map(x => x.value);

//    if (barChartInstance) {
//        barChartInstance.data.labels = labels;
//        barChartInstance.data.datasets[0].data = values;
//        barChartInstance.update();
//        return;
//    }

//    const ctx = document.getElementById('barChart').getContext('2d');
//    barChartInstance = new Chart(ctx, {
//        type: 'bar',
//        data: { labels, datasets: [{ label: 'DHU %', data: values, backgroundColor: 'rgba(59,130,246,0.8)' }] },
//        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
//    });
//}

//For Dynamic Color
//function createBarChart(data) {
//    const labels = data.map(x => x.name);
//    const values = data.map(x => x.value);

//    // 🎨 Set color based on DHU value
//    const colors = values.map(v =>
//        v > 15
//            ? 'rgba(239, 68, 68, 0.8)'   // Red
//            : 'rgba(59, 130, 246, 0.8)'  // Blue
//    );

//    if (barChartInstance) {
//        barChartInstance.data.labels = labels;
//        barChartInstance.data.datasets[0].data = values;
//        barChartInstance.data.datasets[0].backgroundColor = colors;
//        barChartInstance.update();
//        return;
//    }

//    const ctx = document.getElementById('barChart').getContext('2d');
//    barChartInstance = new Chart(ctx, {
//        type: 'bar',
//        data: {
//            labels,
//            datasets: [{
//                label: 'DHU %',
//                data: values,
//                backgroundColor: colors
//            }]
//        },
//        options: {
//            responsive: true,
//            maintainAspectRatio: false,
//            scales: {
//                y: { beginAtZero: true }
//            }
//        }
//    });
//}


//applied color condition
//function createBarChart(data) {
//    const labels = data.map(x => x.name);
//    const values = data.map(x => x.value);

//    const colors = values.map(v =>
//        v > 15
//            ? 'rgba(239, 68, 68, 0.8)'   // Red
//            : 'rgba(59, 130, 246, 0.8)'  // Blue
//    );

//    if (barChartInstance) {
//        barChartInstance.data.labels = labels;
//        barChartInstance.data.datasets[0].data = values;
//        barChartInstance.data.datasets[0].backgroundColor = colors;
//        barChartInstance.update();
//        return;
//    }

//    const ctx = document.getElementById('barChart').getContext('2d');
//    barChartInstance = new Chart(ctx, {
//        type: 'bar',
//        data: {
//            labels,
//            datasets: [{
//                label: 'Line wise DHU % Chart',
//                data: values,
//                backgroundColor: colors
//            }]
//        },
//        options: {
//            responsive: true,
//            maintainAspectRatio: false,
//            scales: {
//                x: {
//                    title: {
//                        display: true,
//                        text: 'Line No.',
//                        font: { size: 14, weight: 'bold' }
//                    }
//                },
//                y: {
//                    beginAtZero: true,
//                    title: {
//                        display: true,
//                        text: 'DHU Value',
//                        font: { size: 14, weight: 'bold' }
//                    }
//                }
//            }
//        }
//    });
//}

function createBarChart(data) {
    const labels = data.map(x => x.name);
    const values = data.map(x => x.value);

    // 🎨 Color logic
    const colors = values.map(v =>
        v > 15
            ? 'rgba(239, 68, 68, 0.8)'   // Red
            : 'rgba(59, 130, 246, 0.8)'  // Blue
    );

    if (barChartInstance) {
        barChartInstance.data.labels = labels;
        barChartInstance.data.datasets[0].data = values;
        barChartInstance.data.datasets[0].backgroundColor = colors;
        barChartInstance.update();
        return;
    }

    const ctx = document.getElementById('barChart').getContext('2d');

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Line wise DHU % Chart',
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        boxWidth: 0   // ✅ removes color box
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Line No.',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'DHU %',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

// ================== PIE CHART ==================
function createPieChart(data) {
    const labels = data.map(x => x.name);
    const values = data.map(x => x.value);

    if (pieChartInstance) {
        pieChartInstance.data.labels = labels;
        pieChartInstance.data.datasets[0].data = values;
        pieChartInstance.update();
        return;
    }

    const ctx = document.getElementById('pieChart').getContext('2d');
    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: { labels, datasets: [{ data: values, backgroundColor: labels.map((_, i) => `hsl(${i * 30 % 360},70%,50%)`) }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: 'black', font: { size: 14 } } } }
        }
    });
}

//let pieChartInstance;

//async function loadPieChart() {
//    try {
//        const res = await fetch('/Dashboard/GetPieChartData');
//        if (!res.ok) throw new Error('Failed to fetch pie chart data');
//        const data = await res.json();

//        const labels = data.map(d => d.name);
//        const values = data.map(d => d.value);

//        // Generate colors dynamically
//        const colors = labels.map((_, i) => `hsl(${i * 45 % 360}, 70%, 50%)`);

//        if (pieChartInstance) {
//            pieChartInstance.data.labels = labels;
//            pieChartInstance.data.datasets[0].data = values;
//            pieChartInstance.data.datasets[0].backgroundColor = colors;
//            pieChartInstance.update();
//            return;
//        }

//        const ctx = document.getElementById('pieChart').getContext('2d');
//        pieChartInstance = new Chart(ctx, {
//            type: 'pie',
//            data: {
//                labels,
//                datasets: [{
//                    label: 'Top 5 Defects',
//                    data: values,
//                    backgroundColor: colors,
//                    borderColor: '#fff',
//                    borderWidth: 1
//                }]
//            },
//            options: {
//                responsive: true,
//                plugins: {
//                    legend: {
//                        display: true,
//                        labels: {
//                            font: { size: 16, weight: 'bold' },
//                            color: '#000',
//                            usePointStyle: true // makes legend show circles instead of boxes
//                        }
//                    },
//                    tooltip: {
//                        callbacks: {
//                            label: function (context) {
//                                return `${context.label}: ${context.formattedValue}`;
//                            }
//                        }
//                    }
//                }
//            }
//        });

//    } catch (err) {
//        console.error(err);
//        alert("Failed to load pie chart data.");
//    }
//}

// Call automatically on page load
document.addEventListener('DOMContentLoaded', loadPieChart);

// ================== LOAD DASHBOARD CARDS ==================
async function loadDashboardCards() {
    const overlay = document.getElementById("loadingOverlay");
    overlay.style.display = "flex";
    document.body.style.cursor = "wait";

    // Force repaint before fetch
    await new Promise(requestAnimationFrame);

    try {
        const res = await fetch('/Dashboard/GetDashboardCardData');
        if (!res.ok) throw new Error('Failed to fetch card data');
        const data = await res.json();

        // Assuming your SP returns a single row
        if (data.length > 0) {
            const d = data[0];

            document.getElementById('inputQty').innerText = d.inpuT_QTY;
            document.getElementById('outputQty').innerText = d.outpuT_QTY;
            document.getElementById('checkQty').innerText = d.checK_QTY;
            document.getElementById('alterSpotQty').innerText = d.alteR_SPOT_QNTY;
            document.getElementById('replaceQty').innerText = d.replacE_QTY;
            document.getElementById('rejectQty').innerText = d.rejecT_QNTY;
            document.getElementById('rejectPoint').innerText = d.rejecT_POINT;
            document.getElementById('dhu').innerText = d.dhu;
        }

    } catch (err) {
        console.error(err);
        alert("Failed to load dashboard cards.");
    } finally {
        overlay.style.display = "none";
        document.body.style.cursor = "default";
    }
}

// Call it automatically on page load
document.addEventListener('DOMContentLoaded', loadDashboardCards);
// ================== LOAD COMPANIES ==================
async function loadCompanies() {
    try {
        const res = await fetch('/Dashboard/GetCompanyList');
        const companies = await res.json();
        const sel = document.getElementById('companySelect');
        sel.innerHTML = '<option value="">-- Select Company --</option>';
        companies.forEach(c => { let o = document.createElement('option'); o.value = c; o.text = c; sel.appendChild(o); });
    } catch (err) { console.error(err); }
}

// ================== LOAD FLOORS ==================
async function loadFloors() {
    try {
        const res = await fetch('/Dashboard/GetFloorList');
        const floors = await res.json();
        const sel = document.getElementById('floorSelect');
        sel.innerHTML = '<option value="">-- Select Floor --</option>';
        floors.forEach(f => { let o = document.createElement('option'); o.value = f; o.text = f; sel.appendChild(o); });
    } catch (err) { console.error(err); }
}

// Auto load companies and floors on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCompanies();
    loadFloors();
});