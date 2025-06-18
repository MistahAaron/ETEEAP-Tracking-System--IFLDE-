document.addEventListener("DOMContentLoaded", () => {
    // Common DOM elements
    const wrapper = document.querySelector(".wrapper");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const registerLink = document.querySelector(".register-link");
    const loginLink = document.querySelector(".login-link");
    const forgotLink = document.querySelector(".forgot-link");
    const roleBtns = document.querySelectorAll(".role-btn");
    const notification = document.getElementById("notification");
    let currentRole = "applicant"; // Default role

    // Initialize the page
    if (wrapper) {
        wrapper.classList.add("active-popup");
    }

    // Role selection
    roleBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            roleBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentRole = btn.dataset.role;
        });
    });

    // Toggle between login and register forms
    registerLink?.addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.add("active");
    });

    loginLink?.addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.remove("active");
    });

    // Password visibility toggle
    document.querySelectorAll(".toggle-password").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const input = toggle.parentElement.querySelector("input");
            const icon = toggle.querySelector("ion-icon");

            if (input.type === "password") {
                input.type = "text";
                icon.setAttribute("name", "eye");
            } else {
                input.type = "password";
                icon.setAttribute("name", "eye-off");
            }
        });
    });

    // Login form submission
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const loginBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = loginBtn.textContent;

        // Disable button during request
        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";

        if (!email || !password) {
            showNotification("Please enter both email and password.", "error");
            loginBtn.disabled = false;
            loginBtn.textContent = originalBtnText;
            return;
        }

        try {
            const response = await fetch(`/api/auth/${currentRole}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            showNotification("Login successful!", "success");
            
            // Store user data based on role
            if (currentRole === "applicant") {
                localStorage.setItem("applicantId", data.userId);
                localStorage.setItem("applicantEmail", email);
            } else if (currentRole === "assessor") {
                sessionStorage.setItem("assessorData", JSON.stringify({
                    assessorId: data.userId,
                    email: email,
                    fullName: data.fullName || ""
                }));
            } else if (currentRole === "admin") {
                localStorage.setItem("adminEmail", email);
            }

            // Redirect based on backend response
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                // Fallback redirects
                switch(currentRole) {
                    case "applicant":
                        window.location.href = "../applicant/dashboard.html";
                        break;
                    case "assessor":
                        window.location.href = "../assessor/dashboard.html";
                        break;
                    case "admin":
                        window.location.href = "../admin/dashboard.html";
                        break;
                    default:
                        window.location.href = "../index.html";
                }
            }

        } catch (error) {
            console.error("Login error:", error);
            showNotification(
                error.message.includes("Failed to fetch") 
                    ? "Network error. Please check your connection."
                    : error.message || "Login failed",
                "error"
            );
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = originalBtnText;
        }
    });

    // Registration form submission
    registerForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById("regFullName").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const registerBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = registerBtn.textContent;

        // Disable button during request
        registerBtn.disabled = true;
        registerBtn.textContent = "Registering...";

        // Validation
        if (!fullName || !email || !password || !confirmPassword) {
            showNotification("Please fill in all fields", "error");
            registerBtn.disabled = false;
            registerBtn.textContent = originalBtnText;
            return;
        }

        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            showNotification("Please enter a valid email", "error");
            registerBtn.disabled = false;
            registerBtn.textContent = originalBtnText;
            return;
        }

        if (password !== confirmPassword) {
            showNotification("Passwords do not match", "error");
            registerBtn.disabled = false;
            registerBtn.textContent = originalBtnText;
            return;
        }

        if (password.length < 8) {
            showNotification("Password must be at least 8 characters", "error");
            registerBtn.disabled = false;
            registerBtn.textContent = originalBtnText;
            return;
        }

        try {
            const response = await fetch("/api/auth/applicant/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ fullName, email, password }),
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            showNotification("Registration successful! Please login.", "success");
            wrapper.classList.remove("active"); // Switch back to login form

            // Store registration data
            localStorage.setItem("applicantId", data.userId);
            localStorage.setItem("applicantEmail", email);

        } catch (error) {
            console.error("Registration error:", error);
            showNotification(
                error.message.includes("Failed to fetch")
                    ? "Network error. Please try again."
                    : error.message || "Registration failed",
                "error"
            );
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = originalBtnText;
        }
    });

    // Forgot password link
    forgotLink?.addEventListener("click", (e) => {
        e.preventDefault();
        showNotification("Please contact support to reset your password.", "info");
    });

    // Show notification function
    function showNotification(message, type = "info") {
        // Clear previous notifications
        notification.textContent = "";
        notification.className = "notification";
        notification.style.display = "none";

        // Create new notification
        notification.textContent = message;
        notification.classList.add(type);
        notification.style.display = "block";
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                notification.style.display = "none";
                notification.style.opacity = "1";
            }, 300);
        }, 3000);
    }

    // Check if user is already logged in
    function checkAuthStatus() {
        // Check for applicant
        if (localStorage.getItem("applicantId")) {
            window.location.href = "../applicant/dashboard.html";
            return;
        }

        // Check for assessor
        if (sessionStorage.getItem("assessorData")) {
            window.location.href = "../assessor/dashboard.html";
            return;
        }

        // Check for admin
        if (localStorage.getItem("adminEmail")) {
            // You might want to verify the token is still valid with an API call
            window.location.href = "../admin/dashboard.html";
        }
    }

    // Run auth check on page load
    checkAuthStatus();
});
