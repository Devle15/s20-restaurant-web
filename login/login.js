const API_LOGIN = `${window.APP_CONFIG.API_BASE}/auth/login`;
const API_ME = `${window.APP_CONFIG.API_BASE}/auth/me`;

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    message.textContent = "Please enter email and password";
    return;
  }

  message.textContent = "";

  try {
    const btn = form.querySelector("button");
    btn.disabled = true;

    // 1️⃣ LOGIN
    const res = await fetch(API_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      message.textContent = "Invalid email or password";
      btn.disabled = false;
      return;
    }

    const data = await res.json();
    const token = data.access_token;

    localStorage.setItem("access_token", token);

    // 2️⃣ GET ME (LẤY restaurant_id)
    const meRes = await fetch(API_ME, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!meRes.ok) {
      message.textContent = "Cannot get user info";
      btn.disabled = false;
      return;
    }

    const me = await meRes.json();

    // 🔥 LƯU restaurant_id
    localStorage.setItem("restaurant_id", me.restaurant_id);
    localStorage.setItem("role", me.role);

    // 3️⃣ REDIRECT
    window.location.href = "../select_role.html";

  } catch (err) {
    console.error(err);
    message.textContent = "Cannot connect to server";
  }
});
