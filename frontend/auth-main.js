// auth-main.js — clean auth handlers
document.addEventListener("DOMContentLoaded", function () {

  // SIGN UP
  const btnRegister = document.getElementById("btnRegister");
  if (btnRegister) {
    btnRegister.addEventListener("click", function () {
      const name = document.getElementById("fullname").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (name === "" || email === "" || password === "") {
        alert("Please fill all fields.");
        return;
      }

      // Save in localStorage (demo only)
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userPassword", password);
      localStorage.setItem("userName", name);

      alert("Account created successfully!");
      // Redirect to dashboard/home page
      window.location.href = "home.html";
    });
  }

  // LOGIN
  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.addEventListener("click", function () {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const storedEmail = localStorage.getItem("userEmail");
      const storedPassword = localStorage.getItem("userPassword");

      // Prefer inline messages on the login page (no alert pop-ups)
      const loginMsg = document.getElementById("loginMsg");
      if (email === storedEmail && password === storedPassword) {
        if (loginMsg) {
          loginMsg.style.color = '#0a8a0a';
          loginMsg.innerText = 'Login successful — redirecting...';
        }
        // small timeout so the user can see the message before redirect
        setTimeout(() => { window.location.href = "home.html"; }, 400);
      } else {
        if (loginMsg) {
          loginMsg.style.color = '#c00';
          loginMsg.innerText = 'Invalid email or password.';
        } else {
          // fallback to alert if page doesn't include the message element
          alert('Invalid email or password.');
        }
      }
    });
  }

});
