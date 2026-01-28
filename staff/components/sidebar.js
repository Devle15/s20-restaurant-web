// Load sidebar HTML
fetch("/components/sidebar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar").innerHTML = html;
    initSidebar();
  });
function initSidebar() {
  const routes = {
    dashboard: "/home/dashboard.html",
    table: "/detailtable/detailtable.html",
    menu: "/menu/menu.html",
    order: "/order_list/order_list.html",
    settings: "/settings/settings.html"
  };

  const currentPath = window.location.pathname;

  document.querySelectorAll(".nav-item[data-page]").forEach(item => {
    const page = item.dataset.page;

    if (currentPath.includes(page)) {
      item.classList.add("active");
    }

    item.addEventListener("click", () => {
      if (routes[page]) {
        window.location.href = routes[page];
      }
    });
  });

  // ✅ TOGGLE SIDEBAR — GẮN TRỰC TIẾP
  const toggleBtn = document.getElementById("toggle-sidebar");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.querySelector(".app")
        .classList.toggle("sidebar-collapsed");
    });
  }

  // logout
 const logoutBtn = document.getElementById("logout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // ❌ Xóa toàn bộ thông tin đăng nhập
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("restaurant_id");

      // ✅ Quay về trang login (không quay lại được)
      window.location.replace("/login/login.html");
    });
  }
}

// Toggle sidebar
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#toggle-sidebar");
  if (!btn) return;

  document.querySelector(".app")
    .classList.toggle("sidebar-collapsed");
});
