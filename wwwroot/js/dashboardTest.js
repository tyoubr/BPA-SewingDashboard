// ================= GLOBAL =================

let barChartInstance = null;
let pieChartInstance = null;

let countdownInterval = null;
let refreshSeconds = 120;
let autoRefreshEnabled = false;


// ================= LOADER =================

function showLoader() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = "flex";
    document.body.style.cursor = "wait";
}

function hideLoader() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = "none";
    document.body.style.cursor = "default";
}


// ================= REFRESH TIMER =================

function startRefreshTimer() {

    if (!autoRefreshEnabled) return;

    clearInterval(countdownInterval);

    refreshSeconds = 60;

    const timerBox = document.getElementById("refreshTimer");

    if (timerBox) timerBox.style.display = "block";

    updateTimerText();

    countdownInterval = setInterval(() => {

        refreshSeconds--;

        updateTimerText();

        if (refreshSeconds <= 0) {

            clearInterval(countdownInterval);

            reloadDashboard();
        }

    }, 1000);
}


function updateTimerText() {

    const min = Math.floor(refreshSeconds / 60);
    const sec = refreshSeconds % 60;

    const counter = document.getElementById("countdown");

    if (counter) {
        counter.innerText =
            String(min).padStart(2, '0') + ":" +
            String(sec).padStart(2, '0');
    }
}


function pauseRefreshTimer() {

    autoRefreshEnabled = false;

    clearInterval(countdownInterval);

    const timer = document.getElementById("refreshTimer");

    if (timer) timer.style.display = "none";
}


function reloadDashboard() {

    const company = localStorage.getItem("dashboard_company");
    const floor = localStorage.getItem("dashboard_floor");

    if (!company || !floor) return;

    showLoader();

    location.reload();
}


// ================= CARD DATA =================

//async function loadDashboardCardData() {

//    try {

//        const res = await fetch('/Dashboard/GetDashboardCardData');
//        const data = await res.json();

//        if (data.length > 0) {

//            const d = data[0];

//            document.getElementById('inputQty').innerText = d.inpuT_QTY ?? 0;
//            document.getElementById('outputQty').innerText = d.outpuT_QTY ?? 0;
//            document.getElementById('checkQty').innerText = d.checK_QTY ?? 0;
//            document.getElementById('alterSpotQty').innerText = d.alteR_SPOT_QNTY ?? 0;
//            document.getElementById('replaceQty').innerText = d.replacE_QTY ?? 0;
//            document.getElementById('rejectQty').innerText = d.rejecT_QNTY ?? 0;
//            document.getElementById('rejectPoint').innerText = d.rejecT_POINT ?? 0;
//            document.getElementById('dhu').innerText = d.dhu ?? 0;

//        }

//    } catch (err) {

//        console.error("Card data error:", err);

//    }
//}

async function loadDashboardCardData(company, floor) {
    document.getElementById("selectionInfo").style.display = "block";
    document.getElementById("selectedCompany").innerText = company;
    document.getElementById("selectedFloorText").innerText = floor;

    try {

        const res = await fetch(
            `/Dashboard/GetDashboardCardData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`
        );
        const data = await res.json();


        if (data.length > 0) {

            const d = data[0];

            document.getElementById('inputQty').innerText = d.inpuT_QTY ?? 0;
            document.getElementById('outputQty').innerText = d.outpuT_QTY ?? 0;
            document.getElementById('checkQty').innerText = d.checK_QTY ?? 0;
            document.getElementById('alterSpotQty').innerText = d.alteR_SPOT_QNTY ?? 0;
            document.getElementById('replaceQty').innerText = d.replacE_QTY ?? 0;
            document.getElementById('rejectQty').innerText = d.rejecT_QNTY ?? 0;
            document.getElementById('rejectPoint').innerText = d.rejecT_POINT ?? 0;
            document.getElementById('dhu').innerText = d.dhu ?? 0;

        }

    } catch (err) {

        console.error("Card data error:", err);

    }
}


// ================= COMPANY =================

async function loadCompanyList() {

    const res = await fetch('/Dashboard/GetCompanyList');
    const companies = await res.json();

    const sel = document.getElementById('companySelect');

    sel.innerHTML = '<option value="">Select Company</option>';

    companies.forEach(c => {

        const o = document.createElement('option');
        o.value = c;
        o.text = c;

        sel.appendChild(o);
    });
}


// ================= FLOOR =================

async function loadFloorList() {

    const res = await fetch('/Dashboard/GetFloorList');
    const floors = await res.json();

    const sel = document.getElementById('floorSelect');

    sel.innerHTML = '<option value="">Select Floor</option>';

    floors.forEach(f => {

        const o = document.createElement('option');
        o.value = f;
        o.text = f;

        sel.appendChild(o);
    });
}


// ================= DASHBOARD =================

async function loadDashboard(company, floor) {

    document.getElementById("selectionInfo").style.display = "block";
    document.getElementById("selectedCompany").innerText = company;
    document.getElementById("selectedFloorText").innerText = floor;

    showLoader();

    try {

        await loadDashboardCardData(company, floor);

        const res = await fetch(
            `/Dashboard/GetDashboardData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`
        );

        const data = await res.json();

        data.sort((a, b) => parseInt(a.name) - parseInt(b.name));

        createBarChart(data);
        
        const url = `/Dashboard/GetPieChartData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`;
        console.log("Request URL:", url);
        console.log("Company:", company);
        console.log("Floor:", floor);

        const pieRes = await fetch(url);
        //const pieRes = await fetch(
        //    `/Dashboard/GetPieChartData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`
        //);

        const pieData = await pieRes.json();

        createPieChart(pieData);

        // Auto-hide filter panel after dashboard loads
        const filterPanelEl = document.getElementById('filterPanel');
        const filterPanel = bootstrap.Offcanvas.getInstance(filterPanelEl);
        if (filterPanel) {
            filterPanel.hide();
        }

    }
    catch (err) {

        console.error("Dashboard load error:", err);

    }
    finally {

        hideLoader();
    }
}


// ================= BUTTON CLICK =================

async function loadDashboardData() {
    const company = document.getElementById('companySelect').value;
    const floor = document.getElementById('floorSelect').value;

    if (!company || !floor) {
        alert("Please select Company and Floor");
        return;
    }

    pauseRefreshTimer();

    localStorage.setItem("dashboard_company", company);
    localStorage.setItem("dashboard_floor", floor);
    sessionStorage.setItem("dashboard_session", "1");

    await loadDashboard(company, floor); // Card data included inside

    autoRefreshEnabled = true;
    startRefreshTimer();
}

//async function loadDashboardCardData(company, floor) {
//    try {
//        const res = await fetch(
//            `/Dashboard/GetDashboardCardData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`
//        );
//        const data = await res.json();

//        if (data.length > 0) {
//            const d = data[0];

//            // Case-sensitive mapping
//            document.getElementById('inputQty').innerText = d.inpuT_QTY ?? 0;
//            document.getElementById('outputQty').innerText = d.outpuT_QTY ?? 0;
//            document.getElementById('checkQty').innerText = d.checK_QTY ?? 0;
//            document.getElementById('alterSpotQty').innerText = d.alteR_SPOT_QNTY ?? 0;
//            document.getElementById('replaceQty').innerText = d.replacE_QTY ?? 0;
//            document.getElementById('rejectQty').innerText = d.rejecT_QNTY ?? 0;
//            document.getElementById('rejectPoint').innerText = d.rejecT_POINT ?? 0;
//            document.getElementById('dhu').innerText = d.dhu ?? 0;
//        }

//    } catch (err) {
//        console.error("Card data error:", err);
//    }
//}


// ================= BAR CHART =================

function createBarChart(data) {

    const labels = data.map(x => x.name);
    const values = data.map(x => x.value);

    const colors = values.map(v =>
        v > 15 ? 'rgba(239,68,68,0.8)' : 'rgba(59,130,246,0.8)'
    );

    const ctx = document.getElementById('barChart').getContext('2d');

    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'DHU%',
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Line wise DHU%',
                    font: { size: 20, weight: 'bold' }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}`;
                        }
                    }
                },
                datalabels: { // This requires chartjs-plugin-datalabels
                    anchor: 'end',
                    align: 'end',
                    color: '#000',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value) => value
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Line No.',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'DHU%',
                        font: { size: 16, weight: 'bold' }
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Make sure to include chartjs-plugin-datalabels.js
    });
}


// ================= PIE CHART =================
//Value inside the pie slices (on the chart) & Defect Name in the legend (bottom)
//function createPieChart(data) {

//    const labels = data.map(x => x.value);//name
//    const values = data.map(x => x.name);//value

//    const colors = labels.map((_, i) =>
//        `hsl(${i * 60 % 360},70%,55%)`
//    );

//    const ctx = document.getElementById('pieChart').getContext('2d');

//    if (pieChartInstance) pieChartInstance.destroy();

//    pieChartInstance = new Chart(ctx, {
//        type: 'pie',
//        data: {
//            labels: labels,
//            datasets: [{
//                label: 'Top 5 Defects',
//                data: values,
//                backgroundColor: colors,
//                borderColor: '#fff',
//                borderWidth: 2
//            }]
//        },
//        options: {
//            responsive: true,
//            maintainAspectRatio: false,
//            plugins: {
//                title: {
//                    display: true,
//                    text: 'Top 5 Defect',
//                    font: { size: 20, weight: 'bold' }
//                },
//                legend: {
//                    display: true,
//                    position: 'bottom', // Legend at bottom
//                    labels: {
//                        font: { size: 14, weight: 'bold' }
//                    }
//                },
//                datalabels: {
//                    color: '#fff',          // Value color
//                    font: { weight: 'bold', size: 14 },
//                    formatter: (value) => value, // Display value
//                }
//            }
//        },
//        plugins: [ChartDataLabels] // Make sure chartjs-plugin-datalabels.js is included
//    });
//}


//Defect Name → inside the pie slices (on the chart) & Value → in the legend (bottom)
function createPieChart(data) {

    const labels = data.map(x => x.value);   // values for legend
    const values = data.map(x => x.value);   // numeric values
    const defectNames = data.map(x => x.name); // defect names for chart labels

    const colors = labels.map((_, i) =>
        `hsl(${i * 60 % 360},70%,55%)`
    );

    const ctx = document.getElementById('pieChart').getContext('2d');

    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels, // legend will show values
            datasets: [{
                label: 'Top 5 Defects',
                data: values,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 5 Defect',
                    font: { size: 20, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: { size: 14, weight: 'bold' }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, context) => {
                        return defectNames[context.dataIndex]; // show defect name on pie
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// ================= PAGE LOAD =================

document.addEventListener('DOMContentLoaded', async () => {

    showLoader();
    // Load card data by default immediately
    //await loadDashboardCardData();

    await Promise.all([
        loadCompanyList(),
        loadFloorList()
    ]);

    const btn = document.getElementById('btnLoadDashboard');

    if (btn) btn.addEventListener('click', loadDashboardData);

    const companySelect = document.getElementById("companySelect");
    const floorSelect = document.getElementById("floorSelect");

    if (companySelect) companySelect.addEventListener("change", pauseRefreshTimer);
    if (floorSelect) floorSelect.addEventListener("change", pauseRefreshTimer);

    const isSessionStarted = sessionStorage.getItem("dashboard_session");

    if (isSessionStarted) {

        const savedCompany = localStorage.getItem("dashboard_company");
        const savedFloor = localStorage.getItem("dashboard_floor");

        if (savedCompany && savedFloor) {

            companySelect.value = savedCompany;
            floorSelect.value = savedFloor;

            await loadDashboard(savedCompany, savedFloor);

            autoRefreshEnabled = true;

            startRefreshTimer();
        }
    }

    hideLoader();
});