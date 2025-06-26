// followup.js
(() => {
  document.addEventListener("DOMContentLoaded", () => {

    // --- DROPDOWN TOGGLE ---
    document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
      toggle.addEventListener("click", e => {
        e.preventDefault();
        const parent = toggle.closest(".dropdown");
        parent?.classList.toggle("active");
      });
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown.active")
          .forEach(drop => drop.classList.remove("active"));
      }
    });

    // --- FORM HANDLER & CONFIRMATION ---
    const form = document.getElementById("followupForm");
    const confirmation = document.getElementById("confirmation");
    form?.addEventListener("submit", e => {
      e.preventDefault();
      const name    = document.getElementById("fullName").value.trim();
      const email   = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();
      if (!name || !email || !message) return;
      form.reset();
      confirmation.classList.add("show");
      setTimeout(() => confirmation.classList.remove("show"), 4000);
    });

    // --- LOGOUT REDIRECT ---
    const logoutLink = document.getElementById("logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", e => {
        e.preventDefault();
        // adjust path if login.html is in a different folder
        window.location.href = "../login/login.html";
      });
    } else {
      console.warn("Logout link (#logout) not found");
    }
  });
})();
