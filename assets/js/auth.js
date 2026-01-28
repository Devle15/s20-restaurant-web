(function checkAuth() {
  const token = localStorage.getItem("access_token");
  const publicPages = [
    "/login/login.html",
    "/index.html"
  ];

  const currentPath = window.location.pathname;

  if (!token && !publicPages.includes(currentPath)) {
    window.location.replace("/login/login.html");
  }
})();
