document.addEventListener("DOMContentLoaded", () => {
  /* ================= CONFIG ================= */
  const API_BASE = window.APP_CONFIG.API_BASE;
  const RESTAURANT_ID = localStorage.getItem("restaurant_id");
  const TOKEN = localStorage.getItem("access_token");

  const CATEGORY_API = `${API_BASE}/categories?restaurant_id=${RESTAURANT_ID}`;
  const MENU_API = `${API_BASE}/menus?restaurant_id=${RESTAURANT_ID}`;
  const MENU_WITH_IMAGE_API =
    `${API_BASE}/menus/with-image?restaurant_id=${RESTAURANT_ID}`;
  const MENU_DETAIL_API = (id) => `${API_BASE}/menus/${id}`;

  /* ================= STATE ================= */
  let categories = [];
  let menus = [];
  let activeCategoryId = null;
  let editingMenuId = null;

  /* ================= DOM ================= */
  const categoryContainer = document.querySelector(".categories");
  const menuGrid = document.getElementById("menu-grid");

  // Category modal
  const categoryModal = document.getElementById("category-modal");
  const openCategoryBtn = document.getElementById("add-category-btn");
  const closeCategoryBtn = document.getElementById("close-category-modal");
  const cancelCategoryBtn = document.getElementById("cancel-category");
  const saveCategoryBtn = document.getElementById("save-category");
  const categoryNameInput = document.getElementById("category-name");
  const categoryIconInput = document.getElementById("category-icon");

  // Menu modal
  const menuModal = document.getElementById("menu-modal");
  const openMenuBtn = document.getElementById("add-menu-btn");
  const closeMenuBtn = document.getElementById("close-menu-modal");
  const cancelMenuBtn = document.getElementById("cancel-menu");
  const saveMenuBtn = document.getElementById("save-menu");

  const menuNameInput = document.getElementById("menu-name");
  const menuCategorySelect = document.getElementById("menu-category");
  const menuPriceInput = document.getElementById("menu-price");
  const menuDescriptionInput = document.getElementById("menu-description");
  const menuImageInput = document.getElementById("menu-image");
  const imagePreview = document.getElementById("image-preview");

  /* ================= API ================= */

  async function fetchCategories() {
    const res = await fetch(CATEGORY_API, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    categories = await res.json();
    renderCategories();
  }

  async function fetchMenus() {
    const res = await fetch(MENU_API);
    menus = await res.json();
    renderMenus();
  }

  async function fetchMenuDetail(menuId) {
    const res = await fetch(MENU_DETAIL_API(menuId), {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!res.ok) throw new Error("Fetch menu detail failed");
    return res.json();
  }

  async function createCategory(name, icon) {
    const res = await fetch(CATEGORY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ name, icon })
    });
    if (!res.ok) throw new Error("Create category failed");
  }

  async function createMenuWithImage({ name, category_id, price, description, image }) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category_id", category_id);
    formData.append("price", price);
    formData.append("description", description);
    if (image) formData.append("image", image);

    const res = await fetch(MENU_WITH_IMAGE_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: formData
    });
    if (!res.ok) throw new Error("Create menu failed");
  }

  async function updateMenu(menuId, data) {
    const res = await fetch(MENU_DETAIL_API(menuId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Update menu failed");
  }

  async function updateMenuImage(menuId, image) {
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch(`${API_BASE}/menus/${menuId}/image`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: formData
    });
    if (!res.ok) throw new Error("Update image failed");
  }

  async function deleteMenu(menuId) {
    const res = await fetch(MENU_DETAIL_API(menuId), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!res.ok) throw new Error("Delete menu failed");
  }

  /* ================= RENDER ================= */

  function renderCategories() {
    categoryContainer.innerHTML = "";

    const all = document.createElement("div");
    all.className = "category active";
    all.textContent = "🍽️ Tất cả";
    all.onclick = () => {
      activeCategoryId = null;
      setActiveCategory(all);
      renderMenus();
    };
    categoryContainer.appendChild(all);

    categories.forEach(cat => {
      const el = document.createElement("div");
      el.className = "category";
      el.innerHTML = `${cat.icon || "🍴"} ${cat.name}`;
      el.onclick = () => {
        activeCategoryId = cat.id;
        setActiveCategory(el);
        renderMenus();
      };
      categoryContainer.appendChild(el);
    });
  }

  function renderMenus() {
    menuGrid.innerHTML = "";

    const filtered = activeCategoryId
      ? menus.filter(m => m.category_id === activeCategoryId)
      : menus;

    if (!filtered.length) {
      menuGrid.innerHTML =
        `<p style="opacity:.6;padding:16px">Không có món nào</p>`;
      return;
    }

    filtered.forEach(menu => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="thumb">
          <img src="${API_BASE}${menu.image_url || ""}">
        </div>

        <div class="body">
          <div class="title">${menu.name}</div>
          <div class="price">
            ${Number(menu.price || 0).toLocaleString("vi-VN")} đ
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-edit" data-id="${menu.id}">Chỉnh sửa</button>
          <button class="btn-delete" data-id="${menu.id}">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      `;
      menuGrid.appendChild(card);
    });
  }

  function setActiveCategory(el) {
    document.querySelectorAll(".category")
      .forEach(c => c.classList.remove("active"));
    el.classList.add("active");
  }

  /* ================= CATEGORY SELECT (FIX LỖI ĐÔI LÚC KHÔNG HIỆN) ================= */

  function fillCategorySelect(selectedId = null) {
    menuCategorySelect.innerHTML =
      `<option value="">Select category</option>`;

    categories.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      if (selectedId && c.id === selectedId) {
        opt.selected = true;
      }
      menuCategorySelect.appendChild(opt);
    });
  }

  /* ================= EVENTS ================= */

  document.addEventListener("click", async (e) => {
    // DELETE
    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm("Bạn chắc chắn muốn xóa món này?")) {
        await deleteMenu(id);
        menus = menus.filter(m => m.id !== id);
        renderMenus();
        fetchMenus();
      }
      return;
    }

    // EDIT
    const editBtn = e.target.closest(".btn-edit");
    if (!editBtn) return;

    const id = editBtn.dataset.id;
    const menu = await fetchMenuDetail(id);
    editingMenuId = id;

    // đảm bảo categories đã load
    if (!categories.length) {
      await fetchCategories();
    }

    menuNameInput.value = menu.name;
    menuPriceInput.value = menu.price;
    menuDescriptionInput.value = menu.description || "";

    // FIX category
    fillCategorySelect(menu.category_id);

    imagePreview.innerHTML = menu.image_url
      ? `<img src="${API_BASE}${menu.image_url}">`
      : "Preview";

    menuModal.querySelector("h2").textContent = "Edit item";
    menuModal.classList.remove("hidden");
  });

  /* ================= MODALS ================= */

  openCategoryBtn.onclick = () => categoryModal.classList.remove("hidden");
  closeCategoryBtn.onclick = cancelCategoryBtn.onclick =
    () => categoryModal.classList.add("hidden");

  saveCategoryBtn.onclick = async () => {
    if (!categoryNameInput.value.trim()) return;
    await createCategory(categoryNameInput.value, categoryIconInput.value);
    categoryModal.classList.add("hidden");
    fetchCategories();
  };

  openMenuBtn.onclick = () => {
    editingMenuId = null;
    fillCategorySelect();
    menuModal.querySelector("h2").textContent = "Add item";
    menuModal.classList.remove("hidden");
  };

  closeMenuBtn.onclick = cancelMenuBtn.onclick = closeMenuModal;

  menuImageInput.onchange = () => {
    const file = menuImageInput.files[0];
    if (file) {
      imagePreview.innerHTML =
        `<img src="${URL.createObjectURL(file)}">`;
    }
  };

  function closeMenuModal() {
    menuModal.classList.add("hidden");
    menuNameInput.value = "";
    menuCategorySelect.value = "";
    menuPriceInput.value = "";
    menuDescriptionInput.value = "";
    menuImageInput.value = "";
    imagePreview.innerHTML = "Preview";
    editingMenuId = null;
    menuModal.querySelector("h2").textContent = "Add item";
  }

  saveMenuBtn.onclick = async () => {
    const name = menuNameInput.value.trim();
    const categoryId = menuCategorySelect.value;
    const price = menuPriceInput.value;
    const description = menuDescriptionInput.value;
    const imageFile = menuImageInput.files[0];

    if (!name || !categoryId) {
      alert("Missing required fields");
      return;
    }

    if (editingMenuId) {
      await updateMenu(editingMenuId, {
        name,
        category_id: categoryId,
        price,
        description
      });
      if (imageFile) {
        await updateMenuImage(editingMenuId, imageFile);
      }
    } else {
      await createMenuWithImage({
        name,
        category_id: categoryId,
        price,
        description,
        image: imageFile
      });
    }

    closeMenuModal();
    fetchMenus();
  };

  /* ================= INIT ================= */
  fetchCategories();
  fetchMenus();
});
