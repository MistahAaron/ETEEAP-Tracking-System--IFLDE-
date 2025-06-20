document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector('.wrapper');
    const loginContainer = document.querySelector('.form-box.login');
    
    // Role tab handling
    const roleTabs = document.querySelectorAll('.role-tab');
    const loginForms = document.querySelectorAll('.login-form');
    
    // Initialize form states
    function initForms() {
        // Show only the active form (applicant by default)
        loginForms.forEach(form => form.classList.remove('active'));
        document.querySelector('.login-form[data-role="applicant"]').classList.add('active');
        
        // Set active tab
        roleTabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector('.role-tab[data-role="applicant"]').classList.add('active');
        
        // Hide other forms
        document.querySelector('.register').style.display = 'none';
        document.querySelector('.admin-register').style.display = 'none';
        document.querySelector('.forgot').style.display = 'none';
        if (document.getElementById('verificationForm')) document.getElementById('verificationForm').style.display = 'none';
        if (document.getElementById('newPasswordForm')) document.getElementById('newPasswordForm').style.display = 'none';
        
        wrapper.classList.remove('active', 'active-forgot', 'active-verification', 'active-new-password');
    }
    
    initForms();

    // Role tab switching
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const role = tab.dataset.role;
            
            // Update active tab
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show the selected form
            loginForms.forEach(form => form.classList.remove('active'));
            document.querySelector(`.login-form[data-role="${role}"]`).classList.add('active');
        });
    });

    // Main nav login button
    document.querySelector('.btnLogin-popup')?.addEventListener('click', (e) => {
        e.preventDefault();
        initForms();
        wrapper.scrollIntoView({ behavior: 'smooth' });
    });

    // Password toggle functionality
    document.querySelectorAll(".toggle-password").forEach((toggle) => {
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

    // Terms and conditions handling
    document.getElementById("terms-link")?.addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("terms-con").style.display = "block";
    });

    document.getElementById("admin-terms-link")?.addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("terms-con").style.display = "block";
    });

    document.getElementById("accept-btn")?.addEventListener("click", function() {
        document.getElementById("terms-con").style.display = "none";
        document.getElementById("terms-checkbox").checked = true;
        document.getElementById("admin-terms-checkbox").checked = true;
    });

    // Form switching logic (register/login/forgot)
    document.querySelector(".register-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show registration form
        document.querySelector('.register').style.display = 'block';
        wrapper.classList.add('active');
    });

    document.querySelector(".admin-register-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show admin registration form
        document.querySelector('.admin-register').style.display = 'block';
        wrapper.classList.add('active');
    });

    document.querySelector(".login-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show login form
        loginContainer.style.display = 'block';
        initForms(); // Reset to applicant login
        wrapper.classList.remove('active');
    });

    document.querySelector(".admin-login-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show login form with admin tab active
        loginContainer.style.display = 'block';
        roleTabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector('.role-tab[data-role="admin"]').classList.add('active');
        loginForms.forEach(form => form.classList.remove('active'));
        document.querySelector('.login-form[data-role="admin"]').classList.add('active');
        wrapper.classList.remove('active');
    });

    document.querySelector(".forgot-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show forgot password form
        document.querySelector('.forgot').style.display = 'block';
        wrapper.classList.add('active-forgot');
    });

    // Common functions
    const resetInputs = () => {
        document.querySelectorAll("input").forEach((input) => {
            if (input.type === "checkbox") {
                input.checked = false;
            } else {
                input.value = "";
            }
        });
    };

    const showNotification = (message, type = "info") => {
        const notification = document.getElementById("notification");
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = "block";
        
        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                notification.style.display = "none";
                notification.style.opacity = "1";
            }, 500);
        }, 3000);
    };

    // Password reset flow
    document.getElementById("resetForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        document.querySelector('.forgot').style.display = "none";
        document.getElementById('verificationForm').style.display = "block";
        wrapper.classList.remove('active-forgot');
        wrapper.classList.add('active-verification');
    });

    document.getElementById("verifyCodeForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        document.getElementById('verificationForm').style.display = "none";
        document.getElementById('newPasswordForm').style.display = "block";
        wrapper.classList.remove('active-verification');
        wrapper.classList.add('active-new-password');
    });

    document.getElementById("newPasswordSubmit")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const newPassword = document.getElementById("newpassword").value;
        const confirmPassword = document.getElementById("confirmNewPassword").value;

        if (newPassword !== confirmPassword) {
            showNotification("Passwords do not match. Please try again.", "error");
            return;
        }

        showNotification("Password successfully reset! Redirecting to login...", "success");
        setTimeout(() => {
            document.getElementById('newPasswordForm').style.display = 'none';
            loginContainer.style.display = 'block';
            initForms(); // Reset to applicant login
            wrapper.classList.remove('active-new-password');
        }, 2000);
    });

    // Applicant Registration (UNCHANGED)
    document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!email || !password || !confirmPassword) {
            showNotification("Please fill in all fields", "error");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            showNotification("Please enter a valid email address", "error");
            return;
        }

        if (password !== confirmPassword) {
            showNotification("Passwords do not match!", "error");
            return;
        }

        if (password.length < 8) {
            showNotification("Password must be at least 8 characters", "error");
            return;
        }

        if (!document.getElementById("terms-checkbox").checked) {
            showNotification("You must accept the terms and conditions", "error");
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Registering...";

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || "Registration failed");
            }

            showNotification("Registration successful! Please fill out your personal information.", "success");
            localStorage.setItem("userId", data.data.userId);
            localStorage.setItem("applicantId", data.data.applicantId);
            window.location.href = "/client/applicant/info/information.html";
        } catch (error) {
            showNotification(`Registration failed: ${error.message}`, "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Admin Registration (NEW)
    document.getElementById("adminRegisterForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fullName = document.getElementById("admin-full-name").value.trim();
        const email = document.getElementById("admin-regEmail").value.trim().toLowerCase();
        const password = document.getElementById("admin-regPassword").value;
        const confirmPassword = document.getElementById("admin-confirmPassword").value;
        const errorElement = document.getElementById("admin-register-error-message");

        errorElement.style.display = "none";

        // Client-side validation
        if (!fullName || !email || !password || !confirmPassword) {
            errorElement.textContent = "All fields are required";
            errorElement.style.display = "block";
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            errorElement.textContent = "Please enter a valid email address";
            errorElement.style.display = "block";
            return;
        }

        if (password !== confirmPassword) {
            errorElement.textContent = "Passwords do not match!";
            errorElement.style.display = "block";
            return;
        }

        if (password.length < 8 || password.length > 16) {
            errorElement.textContent = "Password must be 8-16 characters";
            errorElement.style.display = "block";
            return;
        }

        if (!document.getElementById("admin-terms-checkbox").checked) {
            errorElement.textContent = "You must accept the terms and conditions";
            errorElement.style.display = "block";
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Registering...";

        try {
            const response = await fetch("/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, password }),
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            // Always redirect to login page after successful registration
            errorElement.textContent = "Registration successful! Redirecting to login...";
            errorElement.style.color = "green";
            errorElement.style.display = "block";
            
            setTimeout(() => {
                // Show login form with admin tab active
                document.querySelector('.admin-register').style.display = 'none';
                loginContainer.style.display = 'block';
                roleTabs.forEach(tab => tab.classList.remove('active'));
                document.querySelector('.role-tab[data-role="admin"]').classList.add('active');
                loginForms.forEach(form => form.classList.remove('active'));
                document.querySelector('.login-form[data-role="admin"]').classList.add('active');
                wrapper.classList.remove('active');
            }, 1500);
        } catch (error) {
            errorElement.textContent = `Registration failed: ${error.message}`;
            errorElement.style.display = "block";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Applicant Login
    document.getElementById("applicantLoginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("applicantEmail").value.trim().toLowerCase();
        const password = document.getElementById("applicantPassword").value;

        if (!email || !password) {
            showNotification("Please enter both email and password", "error");
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                showNotification("Login successful!", "success");
                localStorage.setItem("userId", data.data.userId);
                localStorage.setItem("userEmail", data.data.email);
                window.location.href = "/client/applicant/timeline/timeline.html";
            } else {
                throw new Error(data.error || "Login failed");
            }
        } catch (error) {
            showNotification(`Login failed: ${error.message}`, "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Admin Login
    document.getElementById("adminLoginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value;
        const rememberMe = document.getElementById("rememberMe").checked;
        const errorElement = document.getElementById("admin-error-message");

        errorElement.style.display = "none";

        if (!email || !password) {
            errorElement.textContent = "Email and password are required";
            errorElement.style.display = "block";
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        try {
            const response = await fetch("/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                if (rememberMe) {
                    localStorage.setItem("adminEmail", email);
                } else {
                    localStorage.removeItem("adminEmail");
                }

                window.location.href = data.redirectTo || "/client/admin/dashboard/dashboard.html";
            } else {
                throw new Error(data.error || "Login failed");
            }
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = "block";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Assessor Login
    document.getElementById("assessorLoginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("assessorEmail").value.trim();
        const password = document.getElementById("assessorPassword").value;
        const errorElement = document.getElementById("assessor-error-message");

        errorElement.style.display = "none";

        if (!email || !password) {
            errorElement.textContent = "Email and password are required";
            errorElement.style.display = "block";
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        try {
            const response = await fetch("http://localhost:3000/assessor/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem("assessorData", JSON.stringify({
                    assessorId: data.data.assessorId,
                    email: data.data.email,
                    fullName: data.data.fullName
                }));

                window.location.href = data.redirectTo || "/client/assessor/dashboard/dashboard.html";
            } else {
                throw new Error(data.error || "Login failed");
            }
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = "block";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Check if admin email is remembered
    const savedAdminEmail = localStorage.getItem("adminEmail");
    if (savedAdminEmail) {
        document.getElementById("adminEmail").value = savedAdminEmail;
        document.getElementById("rememberMe").checked = true;
    }
});

