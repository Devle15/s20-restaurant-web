console.log("Pending Orders JS loaded");

const grid = document.getElementById("grid");
const clock = document.getElementById("clock");

const API_BASE = window.APP_CONFIG.API_BASE;
const TOKEN_KEY = "access_token";

/* ================= CLOCK ================= */
function setClock() {
  const d = new Date();
  clock.textContent =
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0");
}
setClock();
setInterval(setClock, 10000);

/* ================= FETCH ================= */
async function fetchOrders() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);

    const res = await fetch(`${API_BASE}/orders/kitchen`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const orders = await res.json();

    // ✅ PENDING ONLY
    const pendingOrders = orders.filter(o => o.status === "pending");

    renderOrders(pendingOrders);
  } catch (err) {
    console.error("Fetch pending orders error", err);
  }
}

/* ================= RENDER ================= */
function renderOrders(orders) {
  grid.innerHTML = "";

  if (!orders.length) {
    grid.innerHTML = `<div class="muted">No pending orders</div>`;
    return;
  }

  orders.forEach(o => {
    const card = document.createElement("article");
    card.className = "order";

    card.innerHTML = `
      <div class="order-head">
        <div>
          <div class="id">#${o.order_id.slice(0, 6)}</div>
          <div class="sub">Table ${o.table_name || "--"}</div>
        </div>
        <div class="status pending">Pending</div>
      </div>

      <div class="items">
        ${o.lines.map(l => `
          <div class="item">
            <img class="thumb"
                 src="${API_BASE}${l.image_url}"
                 alt="${l.item_name}" />

            <div class="item-body">
              <div class="name">${l.item_name}</div>
              ${l.note ? `<div class="note">${l.note}</div>` : ""}
            </div>

            <div class="qty">${l.qty}</div>
          </div>
        `).join("")}
      </div>

      <button class="btn accept">
        <i class="ri-check-line"></i>
        Accept Order
      </button>
    `;

    const btn = card.querySelector(".btn");
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "Accepting...";

      await acceptOrder(o.order_id);
      fetchOrders();
    };

    grid.appendChild(card);
  });
}

/* ================= ACTION ================= */
async function acceptOrder(orderId) {
  const token = localStorage.getItem(TOKEN_KEY);

  await fetch(`${API_BASE}/orders/${orderId}/accept`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ================= INIT ================= */
fetchOrders();
setInterval(fetchOrders, 60000);
