// /layout/sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();

  document.querySelectorAll(".nav-item").forEach(link => {
    link.classList.remove("active");

    const href = link.getAttribute("href").toLowerCase();

    if (path.includes("/pending") && href.includes("/pending")) {
      link.classList.add("active");
    }

    if (path.includes("/activeorders") && href.includes("/activeorders")) {
      link.classList.add("active");
    }

    if (path.includes("/inprogress") && href.includes("/inprogress")) {
      link.classList.add("active");
    }

    if (path.includes("/completed") && href.includes("/completed")) {
      link.classList.add("active");
    }
  });
});
