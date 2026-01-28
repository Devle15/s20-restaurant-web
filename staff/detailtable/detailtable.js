const token = localStorage.getItem("access_token");
const restaurantId = localStorage.getItem("restaurant_id");

if (!token || !restaurantId) {
  alert("Unauthorized");
  window.location.href = "/login/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("detailtable.js READY");

  const API = window.APP_CONFIG.API_BASE;

  let currentTableId = null;

  // ===== ELEMENTS =====
  const modal = document.getElementById("table-modal");
  const overlay = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("close-modal");
  const btnAdd = document.getElementById("btn-add-table");
  const btnSave = document.getElementById("save-table");

  const tableName = document.getElementById("table-name");
  const tableSeats = document.getElementById("table-seats");
  const modalTitle = document.getElementById("modal-title");

  const cardsContainer = document.querySelector(".cards");

  // ===== MODAL =====
  function openModal() {
    modal.classList.add("active");
    overlay.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
    overlay.classList.remove("active");
    currentTableId = null;
  }

  // ===== LOAD TABLES =====
  function loadTables() {
    fetch(`${API}/tables`)
      .then(res => res.json())
      .then(renderTables)
      .catch(err => console.error("Load tables error:", err));
  }
function renderTables(tables) {
  cardsContainer.innerHTML = "";

  tables.forEach(t => {
    cardsContainer.insertAdjacentHTML("beforeend", `
      <article class="card table-card">
        <div class="card-tools">
          <button
            class="tool btn-edit"
            data-id="${t.id}"
            data-name="${t.name}"
            data-seats="${t.seats}"
          >
            <i class="ri-edit-line"></i>
          </button>
          <button
            class="tool danger btn-delete"
            data-id="${t.id}"
          >
            <i class="ri-delete-bin-6-line"></i>
          </button>
        </div>

        <div class="table-icon">
          <img src="/assets/table.png" class="table-image">
        </div>

        <div class="row-bottom">
          <div class="left-info">
            <div class="tname">${t.name}</div>
            <div class="tmeta">
              <i class="ri-user-3-line"></i> ${t.seats}
            </div>
          </div>

          <div class="qr">
  <img
    src="${API}/media/qrs/table-${t.id}.png"
    class="qr-image"
    onclick="window.open(this.src, '_blank')"
    onerror="this.style.display='none'"
  />
</div>

        </div>
      </article>
    `);
  });
}


  // ===== ADD TABLE =====
  btnAdd.addEventListener("click", () => {
     currentTableId = null; 
    modalTitle.innerText = "Add Table";
    tableName.value = "";
    tableSeats.value = 0;
    openModal();
  });

  // ===== SAVE (ADD / EDIT) =====
  btnSave.addEventListener("click", async () => {
  const name = tableName.value.trim();
  const seats = Number(tableSeats.value);

  if (!name) {
    alert("Table name is required");
    return;
  }

  if (seats < 0) {
    alert("Seats must be >= 0");
    return;
  }

  const isEdit = Boolean(currentTableId);

  const url = isEdit
    ? `${API}/tables/${currentTableId}`
    : `${API}/tables`;

  const method = isEdit ? "PUT" : "POST";

  const payload = isEdit
    ? { name, seats }
    : { restaurant_id: restaurantId, name, seats };

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    closeModal();
    loadTables();
  } catch (err) {
    console.error("Save table error:", err);
    alert("Save table failed");
  }
});

  // ===== EDIT / DELETE (EVENT DELEGATION) =====
  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    const deleteBtn = e.target.closest(".btn-delete");

    if (editBtn) {
      currentTableId = editBtn.dataset.id;
      modalTitle.innerText = "Edit Table";
      tableName.value = editBtn.dataset.name;
      tableSeats.value = editBtn.dataset.seats;
      openModal();
    }

    if (deleteBtn) {
  const tableId = deleteBtn.dataset.id;

  if (!confirm("Are you sure you want to delete this table?")) return;

  fetch(`${API}/tables/${tableId}`, {
    
    method: "DELETE",
    headers: {
    Authorization: `Bearer ${token}`,
  },
  })
    .then(res => {
      if (!res.ok) throw new Error("Delete failed");
    })
    .then(() => {
      currentTableId = null; 
      closeModal();         
      loadTables();
    })
    .catch(err => {
      console.error("Delete error:", err);
      alert("Delete table failed");
    });
}


  });

  // ===== CLOSE =====
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // INIT
  loadTables();
});
