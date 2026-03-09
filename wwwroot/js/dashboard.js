// ================= GLOBAL =================
let barChartInstance = null;
let pieChartInstance = null;
let floorDhuChartInstance = null;
// ================= LOADING OVERLAY =================
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

// ================= 1️ LOAD CARD DATA =================
async function loadDashboardCardData() {

    showLoader();

    try {
        const res = await fetch('/Dashboard/GetDashboardCardData');
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
        console.error("Error loading dashboard cards:", err);
    } finally {
        hideLoader();
    }
}

// ================= 2️ LOAD COMPANY =================
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

// ================= 3️ LOAD FLOOR =================
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

async function loadPieChart() {

    showLoader();

    try {
        const res = await fetch('/Dashboard/GetPieChartData');

        if (!res.ok) throw new Error("Pie API failed");

        const data = await res.json();

        if (!data || data.length === 0) {
            console.warn("No pie data found");
            return;
        }

        createPieChart(data);

    } catch (err) {
        console.error("Error loading pie chart:", err);
    }
    finally {
        hideLoader();
    }
}


// ================= 4️ LOAD DASHBOARD DATA =================
//async function loadDashboardData() {

//    const company = document.getElementById('companySelect').value;
//    const floor = document.getElementById('floorSelect').value;

//    if (!company || !floor) {
//        alert("Please select Company and Floor");
//        return;
//    }

//    showLoader();

//    try {
//        const res = await fetch(
//            `/Dashboard/GetDashboardData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`
//        );

//        const data = await res.json();

//        data.sort((a, b) => parseInt(a.name) - parseInt(b.name));

//        createBarChart(data);
//        createPieChart(data);

//        // Hide filter automatically
//        const offcanvasEl = document.getElementById('filterPanel');
//        if (offcanvasEl) {
//            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
//            if (offcanvas) offcanvas.hide();
//        }

//    } catch (err) {
//        console.error("Error loading dashboard:", err);
//        alert("Failed to load dashboard data.");
//    } finally {
//        hideLoader();
//    }
//    await loadPieChart();
//}

async function loadDashboardData() {
    const company = document.getElementById('companySelect').value;
    const floor = document.getElementById('floorSelect').value;

    if (!company || !floor) {
        alert("Please select Company and Floor");
        return;
    }
    // show section
    document.getElementById("selectionInfo").style.display = "block";

    // set values
    document.getElementById("selectedCompany").innerText = company;
    document.getElementById("selectedFloorText").innerText = floor;

    showLoader();

    try {
        // Load Bar Chart data
        const res = await fetch(
            `/Dashboard/GetDashboardData?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`
        );

        const data = await res.json();
        data.sort((a, b) => parseInt(a.name) - parseInt(b.name));
        createBarChart(data);

        // Load Pie Chart separately using the Pie API
        const pieRes = await fetch('/Dashboard/GetPieChartData');
        const pieData = await pieRes.json();
        createPieChart(pieData);
        // ⭐ to load Floor Wise DHU Chart Data
        /*await loadFloorDhuChart();*/

        // Hide filter automatically
        const offcanvasEl = document.getElementById('filterPanel');
        if (offcanvasEl) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvas) offcanvas.hide();
        }

    } catch (err) {
        console.error("Error loading dashboard:", err);
        alert("Failed to load dashboard data.");
    } finally {
        hideLoader();
    }
}


//async function loadFloorDhuChart() {

//    const company = document.getElementById('companySelect').value;
//    const floor = document.getElementById('floorSelect').value;

//    if (!company || !floor) {
//        console.warn("Company or Floor not selected");
//        return;
//    }

//    try {

//        const res = await fetch(
//            `/Dashboard/GetFloorWiseDHU?company=${encodeURIComponent(company)}&floorName=${encodeURIComponent(floor)}`
//        );

//        const data = await res.json();

//        createFloorDhuChart(data);

//    } catch (err) {
//        console.error("Error loading floor DHU chart:", err);
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

    if (barChartInstance) {
        barChartInstance.destroy();
    }

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Line wise DHU %',
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
                        font: { size: 18, weight: 'bold' },
                        boxWidth: 0
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Line No.',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'DHU %',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

//=============Horizonatal BAR CHART=======
//function createFloorDhuChart(data) {

//    const labels = data.map(x => x.name);
//    const values = data.map(x => x.value);

//    const colors = values.map(v =>
//        v > 15 ? 'rgba(239,68,68,0.8)' : 'rgba(34,197,94,0.8)'
//    );

//    const ctx = document.getElementById('floorDhuChart').getContext('2d');

//    if (floorDhuChartInstance) {
//        floorDhuChartInstance.destroy();
//    }

//    floorDhuChartInstance = new Chart(ctx, {
//        type: 'bar',
//        data: {
//            labels: labels,
//            datasets: [{
//                label: 'Floor Wise DHU %',
//                data: values,
//                backgroundColor: colors
//            }]
//        },
//        options: {
//            indexAxis: 'y',   // ⭐ This makes it horizontal
//            responsive: true,
//            maintainAspectRatio: false,
//            plugins: {
//                title: {
//                    display: true,
//                    text: 'Floor Wise DHU %',
//                    font: { size: 20, weight: 'bold' }
//                },
//                legend: {
//                    display: false
//                }
//            },
//            scales: {
//                x: {
//                    beginAtZero: true,
//                    title: {
//                        display: true,
//                        text: 'DHU %',
//                        font: { weight: 'bold' }
//                    }
//                },
//                y: {
//                    title: {
//                        display: true,
//                        text: 'Floor',
//                        font: { weight: 'bold' }
//                    }
//                }
//            }
//        }
//    });
//}

// ================= PIE CHART =================
//function createPieChart(data) {

//    const labels = data.map(x => x.name);
//    const values = data.map(x => x.value);
//    const colors = labels.map((_, i) => `hsl(${i * 50 % 360},70%,50%)`);

//    const ctx = document.getElementById('pieChart').getContext('2d');

//    if (pieChartInstance) {
//        pieChartInstance.destroy();
//    }

//    pieChartInstance = new Chart(ctx, {
//        type: 'pie',
//        data: {
//            labels: labels,
//            datasets: [{
//                label: 'Top 5 Defects',
//                data: values,
//                backgroundColor: colors,
//                borderColor: '#fff',
//                borderWidth: 1
//            }]
//        },
//        options: {
//            responsive: true,
//            maintainAspectRatio: false,
//            plugins: {
//                legend: {
//                    position: 'bottom',
//                    labels: {
//                        font: { size: 16, weight: 'bold' },
//                        usePointStyle: true
//                    }
//                }
//            }
//        }
//    });
//}

function createPieChart(data) {

    const labels = data.map(x => x.name);
    const values = data.map(x => x.value);

    const colors = labels.map((_, i) =>
        `hsl(${i * 60 % 360}, 70%, 55%)`
    );

    const ctx = document.getElementById('pieChart').getContext('2d');

    if (pieChartInstance) {
        pieChartInstance.destroy();
    }

    //pieChartInstance = new Chart(ctx, {
    //    type: 'pie',
    //    data: {
    //        labels: labels,
    //        datasets: [{
    //            label: 'Top 5 Defects',
    //            data: values,
    //            backgroundColor: colors,
    //            borderColor: '#fff',
    //            borderWidth: 2
    //        }]
    //    },
    //    options: {
    //        responsive: true,
    //        maintainAspectRatio: false,
    //        plugins: {
    //            legend: {
    //                position: 'bottom',
    //                labels: {
    //                    font: { size: 16, weight: 'bold' },
    //                    usePointStyle: true
    //                }
    //            },
    //            tooltip: {
    //                callbacks: {
    //                    label: function (context) {
    //                        return `${context.label}: ${context.raw}`;
    //                    }
    //                }
    //            }
    //        }
    //    }
    //});


    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
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
                title: {                  // <-- Add this
                    display: true,
                    text: 'Top 5 Defect Chart',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 16, weight: 'bold' },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}



// ================= PAGE LOAD SEQUENCE =================
document.addEventListener('DOMContentLoaded', async () => {

    //await loadDashboardCardData(); // 1
    //await loadCompanyList();       // 2
    //await loadFloorList();         // 3
    await Promise.all([
        loadDashboardCardData(),
        loadCompanyList(),
        loadFloorList(),
        loadPieChart(),
        
    ]);

    // Button click only triggers dashboard data
    const btn = document.getElementById('btnLoadDashboard');

    btn.addEventListener('click', loadDashboardData);
//    btn.addEventListener('click', loadPieChart);
});