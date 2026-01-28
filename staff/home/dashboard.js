let dashboardLoaded = false;
let salesChart = null;
let isLoadingOverview = false;

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", async () => {
  if (dashboardLoaded) return;
  dashboardLoaded = true;

  await loadDashboardPoints();
  await loadDashboardReviews();
  await loadReportsOverview("day");
});

/* ===== POINTS SUMMARY ===== */
async function loadDashboardPoints() {
  try {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) return;

    const res = await fetch(
      `${window.APP_CONFIG.API_BASE}/dashboard/points/summary`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!res.ok) return;

    const data = await res.json();
    document.getElementById("total-points").textContent =
      data.total_points_issued.toLocaleString();
  } catch (e) {
    console.error("Points error", e);
  }
}

/* ===== REVIEWS SUMMARY ===== */
async function loadDashboardReviews() {
  try {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) return;

    const res = await fetch(
      `${window.APP_CONFIG.API_BASE}/dashboard/reviews/summary`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!res.ok) return;

    const data = await res.json();
    document.getElementById("total-reviews").textContent = data.total_reviews;
    document.getElementById("avg-rating").textContent =
      data.avg_rating.toFixed(1);
    document.getElementById("bad-reviews").textContent = data.bad_reviews;
  } catch (e) {
    console.error("Reviews error", e);
  }
}

/* ===== REPORTS + CHART ===== */
async function loadReportsOverview(type = "hour") {
  if (isLoadingOverview) return;
  isLoadingOverview = true;

  try {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) return;

    const res = await fetch(
      `${window.APP_CONFIG.API_BASE}/reports/overview?type=${type}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (res.status === 429) {
      console.warn("Rate limited");
      return;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    renderSalesChart(data.chart);

  } catch (err) {
    console.error("Overview error", err);
  } finally {
    isLoadingOverview = false;
  }
}

/* ===== RENDER CHART ===== */
function renderSalesChart(chartData) {
  const ctx = document.getElementById("salesChart");
  if (!ctx || !chartData?.length) return;

  const labels = chartData.map(i =>
  new Date(i.time).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
);


  const revenueData = chartData.map(i => i.total_revenue);

  if (salesChart) salesChart.destroy();

  salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: revenueData,
        borderColor: "#4c7dff",
        backgroundColor: "rgba(76,125,255,.25)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: v => v.toLocaleString(),
            color: "#94a3b8",
          },
          grid: { color: "rgba(148,163,184,.15)" },
        },
        x: {
          ticks: { color: "#94a3b8" },
          grid: { display: false },
        },
      },
    },
  });
}