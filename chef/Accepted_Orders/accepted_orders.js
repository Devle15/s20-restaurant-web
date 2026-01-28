/* ======================================================
   Kitchen – Accepted Orders (HTTP only, no WebSocket)
   ====================================================== */

console.log("Accepted Orders JS loaded");

const grid = document.getElementById("grid");
const clock = document.getElementById("clock");

const API_BASE = window.APP_CONFIG.API_BASE;
const TOKEN_KEY = "access_token";

/* ================= AUTH GUARD ================= */
function ensureAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const restaurantId = localStorage.getItem("restaurant_id");

  if (!token || !restaurantId) {
    alert("Please login as staff/owner first");
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }
}

/* ================= CLOCK ================= */
function setClock() {
  const d = new Date();
  clock.textContent =
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0");
}
setClock();
setInterval(setClock, 10000);

/* ================= FETCH ORDERS ================= */
async function fetchOrders() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);

    const res = await fetch(`${API_BASE}/orders/kitchen`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Fetch failed:", res.status);
      return;
    }

    const orders = await res.json();

    // ✅ CHỈ LẤY confirmed
    const confirmedOrders = orders.filter(
      o => o.status === "confirmed"
    );

    console.table(
      confirmedOrders.map(o => ({
        id: o.order_id,
        status: o.status,
      }))
    );

    renderOrders(confirmedOrders);
  } catch (err) {
    console.error("Fetch orders error", err);
  }
}

/* ================= RENDER ================= */
function renderOrders(orders) {
  grid.innerHTML = "";

  if (!orders.length) {
    grid.innerHTML = `<div class="muted">No accepted orders</div>`;
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
        <div class="status confirmed">Accepted</div>
      </div>

      <div class="items">
        ${o.lines.map(l => `
          <div class="item">
            <img
              class="thumb"
              src="${API_BASE}${l.image_url}"
              alt="${l.item_name}"
            />
            <div class="item-body">
              <div class="name">${l.item_name}</div>
              ${l.note ? `<div class="note">${l.note}</div>` : ""}
            </div>
            <div class="qty">${l.qty}</div>
          </div>
        `).join("")}
      </div>

      <button class="btn primary">
        <i class="ri-fire-line"></i>
        Start Cooking
      </button>
    `;

    card.querySelector(".btn").onclick = async () => {
      await startPreparing(o.order_id);
      fetchOrders(); // refresh lại list
    };

    grid.appendChild(card);
  });
}

/* ================= ACTION ================= */
async function startPreparing(orderId) {
  const token = localStorage.getItem(TOKEN_KEY);

  await fetch(`${API_BASE}/orders/${orderId}/preparing`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ================= INIT ================= */
function init() {
  ensureAuth();
  fetchOrders();
  setInterval(fetchOrders, 15000); // poll mỗi 15s
}

init();
