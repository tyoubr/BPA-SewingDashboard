// ================= GLOBAL =================
let barChartInstance = null;
let pieChartInstance = null;

let countdownInterval = null;
let refreshSeconds = 120;
let autoRefreshEnabled = false;

// ================= HELPERS =================
const $ = (id) => document.getElementById(id);

// ================= DATE =================
function getCurrentDate() {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}-${m}-${y}`;
}

// ================= PARAMS (SAFE) =================
function getParams() {
    const params = new URLSearchParams(window.location.search);

    return {
        companyId: params.get("companyId") || "",
        floorId: params.get("floorId") || "",
        date: params.get("date") || getCurrentDate()
    };
}

// ================= QUERY =================
function buildQuery(companyId, floorId, date) {
    return `companyId=${encodeURIComponent(companyId)}&floorId=${encodeURIComponent(floorId)}&date=${encodeURIComponent(date)}`;
}

// ================= API =================
async function apiGet(url) {
    try {
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} → ${url}`);
        }

        return await res.json();

    } catch (err) {
        console.error("API ERROR:", err);
        throw err;
    }
}

// ================= HEADER =================
function updateHeader(companyId, floorId, date) {

    const companyText =
        $("companySelect")?.selectedOptions?.[0]?.text || companyId;

    const floorText =
        $("floorSelect")?.selectedOptions?.[0]?.text || floorId;

    if ($("selectedCompany")) $("selectedCompany").innerText = companyText;
    if ($("selectedFloorText")) $("selectedFloorText").innerText = floorText;
    if ($("selectedDateText")) $("selectedDateText").innerText = date;

    if ($("selectionInfo")) $("selectionInfo").style.display = "block";
}

// ================= LOADER =================
function showLoader() {
    const el = $("loadingOverlay");
    if (el) el.style.display = "flex";
}

function hideLoader() {
    const el = $("loadingOverlay");
    if (el) el.style.display = "none";
}

// ================= VALIDATION =================
function isValidParams(companyId, floorId, date) {
    return companyId && floorId && date;
}

// ================= COMPANY =================
async function loadCompanyList() {

    const data = await apiGet('/Dashboard/GetCompanyList?t=' + Date.now());

    const sel = $("companySelect");
    if (!sel) return;

    sel.innerHTML = '<option value="">Select Company</option>';

    data.forEach(x => {
        sel.appendChild(new Option(x.name, x.id));
    });
}

// ================= FLOOR =================
async function loadFloorList(companyId) {

    if (!companyId) return;

    const data = await apiGet(`/Dashboard/GetFloorList?companyId=${companyId}&t=${Date.now()}`);

    const sel = $("floorSelect");
    if (!sel) return;

    sel.innerHTML = '<option value="">Select Floor</option>';

    data.forEach(x => {
        sel.appendChild(new Option(x.name, x.id));
    });
}

// ================= CARD DATA =================
async function loadDashboardCardData(companyId, floorId, date) {

    if (!isValidParams(companyId, floorId, date)) return;

    const url = `/Dashboard/GetDashboardCardData?${buildQuery(companyId, floorId, date)}&t=${Date.now()}`;

    const data = await apiGet(url);

    if (!Array.isArray(data) || data.length === 0) return;

    const d = data[0];

    const map = {
        inputQty: d.inpuT_QTY,
        outputQty: d.outpuT_QTY,
        checkQty: d.checK_QTY,
        alterSpotQty: d.alteR_SPOT_QNTY,
        replaceQty: d.replacE_QTY,
        rejectQty: d.rejecT_QTY,
        rejectPoint: d.rejecT_POINT,
        dhu: d.dhu
    };

    Object.entries(map).forEach(([id, value]) => {
        if ($(id)) $(id).innerText = value ?? 0;
    });
}

// ================= DASHBOARD =================
async function loadDashboard(companyId, floorId, date) {

    if (!isValidParams(companyId, floorId, date)) {
        console.warn("Invalid params:", { companyId, floorId, date });
        return;
    }

    showLoader();

    try {
        const query = buildQuery(companyId, floorId, date);
        const cache = `&t=${Date.now()}`;

        const [barData, pieData] = await Promise.all([
            apiGet(`/Dashboard/GetDashboardData?${query}${cache}`),
            apiGet(`/Dashboard/GetPieChartData?${query}${cache}`)
        ]);

        renderBarChart(barData);
        renderPieChart(pieData);

        await loadDashboardCardData(companyId, floorId, date);

        updateHeader(companyId, floorId, date);

        hideFilterPanel();

        console.log("Dashboard loaded successfully");

    } catch (err) {
        console.error("Dashboard error:", err);
    } finally {
        hideLoader();
    }
}

// ================= BUTTON =================
async function loadDashboardData() {

    const companyId = $("companySelect")?.value;
    const floorId = $("floorSelect")?.value;
    const date = $("dateSelect")?.value || getCurrentDate();

    if (!isValidParams(companyId, floorId, date)) {
        alert("Select Company, Floor and Date");
        return;
    }

    await loadDashboard(companyId, floorId, date);
}

// ================= BAR CHART =================
function renderBarChart(data) {

    if (!Array.isArray(data)) return;

    const getNum = (n) =>
        parseInt(String(n || "").replace(/\D/g, "")) || 0;

    data.sort((a, b) => getNum(a.name) - getNum(b.name));

    const labels = data.map(x => x.name);
    const values = data.map(x => x.value);

    const colors = values.map(v =>
        v > 7 ? "#ef4444" :
            v > 5 ? "#facc15" :
                "#22c55e"
    );

    const ctx = $("barChart")?.getContext("2d");
    if (!ctx) {
        console.error("barChart canvas missing");
        return;
    }

    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "DHU %",
                data: values,
                backgroundColor: colors
            }]
        },
        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Line Wise DHU%",
                    font: { size: 18, weight: "bold" }
                },
                legend: { display: false },
                datalabels: {
                    anchor: "end",
                    align: "top",
                    color: "#000",
                    font: { weight: "bold" },
                    formatter: v => v + "%"
                },
                tooltip: { enabled: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ================= PIE CHART =================
function renderPieChart(data) {

    if (!Array.isArray(data)) return;

    const labels = data.map(x => x.name);
    const values = data.map(x => x.value);

    const colors = labels.map((_, i) => `hsl(${i * 50},70%,55%)`);

    const ctx = $("pieChart")?.getContext("2d");
    if (!ctx) {
        console.error("pieChart canvas missing");
        return;
    }

    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors
            }]
        },
        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Top Defect Point",
                    font: { size: 18, weight: "bold" }
                },
                legend: {
                    position: "bottom",
                    labels: {
                        generateLabels: (chart) =>
                            chart.data.labels.map((label, i) => ({
                                text: `${label} (${chart.data.datasets[0].data[i]})`,
                                fillStyle: chart.data.datasets[0].backgroundColor[i]
                            }))
                    }
                },
                datalabels: {
                    color: "#fff",
                    font: { weight: "bold" },
                    formatter: (value, ctx) =>
                        ctx.chart.data.labels[ctx.dataIndex]
                },
                tooltip: { enabled: false }
            }
        }
    });
}

// ================= FILTER PANEL =================
function hideFilterPanel() {
    const el = document.getElementById("filterPanel");
    if (!el) return;

    if (window.bootstrap?.Offcanvas) {
        const instance = bootstrap.Offcanvas.getInstance(el);
        if (instance) {
            instance.hide();
            return;
        }
    }

    el.classList.remove("show");
    document.querySelectorAll(".offcanvas-backdrop").forEach(x => x.remove());
    document.body.classList.remove("offcanvas-open");
    document.body.style.overflow = "";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {

    showLoader();

    try {
        await loadCompanyList();

        $("companySelect")?.addEventListener("change", async (e) => {
            await loadFloorList(e.target.value);
        });

        $("btnLoadDashboard")?.addEventListener("click", loadDashboardData);

        const { companyId, floorId, date } = getParams();

        if (isValidParams(companyId, floorId, date)) {

            $("companySelect").value = companyId;

            await loadFloorList(companyId);

            $("floorSelect").value = floorId;
            $("dateSelect").value = date;

            autoRefreshEnabled = true;

            await loadDashboard(companyId, floorId, date);
        }

    } catch (err) {
        console.error(err);
    } finally {
        hideLoader();
    }
});