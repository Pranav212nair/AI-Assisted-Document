// auth.js — unified simple client-side auth for the demo
document.addEventListener("DOMContentLoaded", () => {
  // Helpers
  const setLoggedIn = (userObj) => {
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("isLoggedIn", "true");
  };
  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    // keep user data for demo convenience
    window.location.href = "index.html";
  };

  // SIGN UP / REGISTER
  const registerBtn = document.getElementById("btnRegister");
  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const fullname = document.getElementById("fullname")?.value?.trim() || "";
      const email = document.getElementById("email")?.value?.trim() || "";
      const password = document.getElementById("password")?.value?.trim() || "";

      if (!fullname || !email || !password) {
        alert("Please fill all fields.");
        return;
      }

      const user = { fullname, email, password, createdAt: new Date().toISOString() };
      setLoggedIn(user);
      alert("Account created successfully!");
      window.location.href = "home.html";
    });
  }

  // LOGIN
  const loginBtn = document.getElementById("btnLogin");
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const email = document.getElementById("email")?.value?.trim() || "";
      const password = document.getElementById("password")?.value?.trim() || "";
      const loginMsg = document.getElementById("loginMsg");

      const savedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (!savedUser) {
        if (loginMsg) {
          loginMsg.style.color = "#c00";
          loginMsg.innerText = "No account found. Please sign up.";
        } else {
          alert("No account found. Please sign up.");
        }
        return;
      }

      if (email === savedUser.email && password === savedUser.password) {
        setLoggedIn(savedUser);
        if (loginMsg) {
          loginMsg.style.color = "#0a8a0a";
          loginMsg.innerText = "Login successful — redirecting...";
        }
        setTimeout(() => { window.location.href = "home.html"; }, 350);
      } else {
        if (loginMsg) {
          loginMsg.style.color = "#c00";
          loginMsg.innerText = "Invalid email or password.";
        } else {
          alert("Invalid email or password.");
        }
      }
    });
  }

  // LOGOUT button action (present on pages with btnLogout)
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Show welcome name in pages that have #welcomeName
  const welcomeTag = document.getElementById("welcomeName");
  if (welcomeTag) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      window.location.href = "login.html";
      return;
    }
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    welcomeTag.innerText = savedUser?.fullname || savedUser?.email || "User";
  }

  // Toggle nav buttons (show Login or Logout depending on state)
  const showNavButtons = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    document.querySelectorAll(".nav-login").forEach(el => el.style.display = isLoggedIn ? "none" : "");
    document.querySelectorAll(".nav-logout").forEach(el => el.style.display = isLoggedIn ? "" : "none");
    // fill username in any span.nav-username elements
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    document.querySelectorAll(".nav-username").forEach(el => {
      el.innerText = savedUser?.fullname ? `Welcome, ${savedUser.fullname}` : "";
    });
  };
  showNavButtons();

  // Action buttons: if not logged in -> go to login, else go to target (placeholder)
  document.querySelectorAll(".action-btn, .card.action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target || "login.html";
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        window.location.href = "login.html";
        return;
      }
      // If logged in, navigate to the target page (e.g., saved.html)
      window.location.href = target;
    });
  });

  // Smooth scrolling for top nav anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      e.preventDefault();
      const id = this.getAttribute('href').slice(1);
      document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
    });
  });
});
