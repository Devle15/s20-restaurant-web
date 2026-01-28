document.addEventListener("DOMContentLoaded", () => {
  // =======================
  // Config
  // =======================
  const API_BASE = window.APP_CONFIG.API_BASE;
  const API_LIST_URL = `${API_BASE}/orders/kitchen`;
  const API_SERVED = id => `${API_BASE}/orders/${id}/served`;

  const TOKEN = localStorage.getItem("access_token");
  const grid = document.getElementById("order-grid");

  let allOrders = [];
  let currentStatus = "ready";

  if (!TOKEN) {
    console.error("❌ Không có access_token");
    return;
  }

  // =======================
  // Fetch orders
  // =======================
  async function fetchOrders() {
    try {
      const res = await fetch(API_LIST_URL, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      if (!res.ok) throw new Error(res.status);

      allOrders = await res.json();
      renderByStatus(currentStatus);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  // =======================
  // Render theo status
  // =======================
  function renderByStatus(status) {
    const filtered = allOrders.filter(
      o => o.status && o.status.toLowerCase() === status
    );

    renderOrders(filtered, status === "served");
  }

  // =======================
  // Render UI
  // =======================
  function renderOrders(orders, isServedView) {
    grid.innerHTML = "";

    if (orders.length === 0) {
      grid.innerHTML = `<p style="opacity:.6">Không có đơn nào.</p>`;
      return;
    }

    orders.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
        <h3>${order.table_name || "Không rõ bàn"}</h3>

        ${order.lines
          .map(
            item => `
          <div class="order-item">
            <img src="${API_BASE}${item.image_url}" />
            <span>${item.item_name} × ${item.qty}</span>
          </div>
        `
          )
          .join("")}

        ${
          isServedView
            ? `<small style="opacity:.6">Đã phục vụ</small>`
            : `<button class="btn-finish" data-id="${order.order_id}">
                 Hoàn thành đơn
               </button>`
        }
      `;

      grid.appendChild(card);
    });

    if (!isServedView) bindFinishEvents();
  }

  // =======================
  // PATCH served
  // =======================
  function bindFinishEvents() {
    document.querySelectorAll(".btn-finish").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = "Đang xử lý...";

        try {
          const res = await fetch(API_SERVED(id), {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${TOKEN}`
            }
          });

          if (!res.ok) throw new Error(res.status);

          // update local state
          const order = allOrders.find(o => o.order_id === id);
          if (order) order.status = "served";

          renderByStatus(currentStatus);
        } catch (err) {
          console.error("Serve failed:", err);
          btn.disabled = false;
          btn.textContent = "Hoàn thành đơn";
        }
      };
    });
  }

  // =======================
  // Tabs logic
  // =======================
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");
      currentStatus = tab.dataset.status;
      renderByStatus(currentStatus);
    });
  });

  // =======================
  // Init
  // =======================
  fetchOrders();
});
