document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector('.wrapper');
    
    // Role selection handling
    const roleButtons = document.querySelectorAll('.role-btn');
    const roleSelection = document.querySelector('.role-selection');
    const loginForms = document.querySelectorAll('.form-box.login');
    const registerForm = document.querySelector('.register');
    const forgotForm = document.querySelector('.forgot');
    const verificationForm = document.getElementById('verificationForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    
    // Initialize form states
    function initForms() {
        roleSelection.style.display = 'block';
        loginForms.forEach(form => form.style.display = 'none');
        registerForm.style.display = 'none';
        forgotForm.style.display = 'none';
        if (verificationForm) verificationForm.style.display = 'none';
        if (newPasswordForm) newPasswordForm.style.display = 'none';
        wrapper.classList.remove('active', 'active-forgot', 'active-verification', 'active-new-password');
    }
    
    initForms();

    // Main nav login button
    document.querySelector('.btnLogin-popup')?.addEventListener('click', (e) => {
        e.preventDefault();
        initForms();
        wrapper.scrollIntoView({ behavior: 'smooth' });
    });

    // Role selection
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const role = button.dataset.role;
            sessionStorage.setItem('selectedRole', role);
            
            // Hide role selection
            roleSelection.style.display = 'none';
            
            // Hide all forms first
            loginForms.forEach(form => form.style.display = 'none');
            registerForm.style.display = 'none';
            forgotForm.style.display = 'none';
            if (verificationForm) verificationForm.style.display = 'none';
            if (newPasswordForm) newPasswordForm.style.display = 'none';
            
            // Show the selected form
            document.querySelector(`.${role}-form`).style.display = 'block';
            
            // Reset wrapper state
            wrapper.classList.remove('active', 'active-forgot', 'active-verification', 'active-new-password');
        });
    });

    // Back to role selection button
    const backToRoleSelection = () => {
        initForms();
        resetInputs();
    };

    // Add back buttons to each login form
    document.querySelectorAll('.login').forEach(form => {
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'btn back-btn';
        backBtn.innerHTML = '<ion-icon name="arrow-back"></ion-icon> Back to Role Selection';
        backBtn.addEventListener('click', backToRoleSelection);
        form.querySelector('h2').insertAdjacentElement('afterend', backBtn);
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

    document.getElementById("accept-btn")?.addEventListener("click", function() {
        document.getElementById("terms-con").style.display = "none";
        document.getElementById("terms-checkbox").checked = true;
    });

    // Form switching logic (register/login/forgot)
    document.querySelector(".register-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show registration form
        registerForm.style.display = 'block';
        wrapper.classList.add('active');
    });

    document.querySelector(".login-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show applicant login form
        document.querySelector('.applicant-form').style.display = 'block';
        wrapper.classList.remove('active');
    });

    document.querySelector(".forgot-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        // Hide all other forms
        document.querySelectorAll('.form-box').forEach(form => {
            form.style.display = 'none';
        });
        // Show forgot password form
        forgotForm.style.display = 'block';
        wrapper.classList.add('active-forgot');
    });

    // Password reset flow
    document.getElementById("resetForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        forgotForm.style.display = "none";
        verificationForm.style.display = "block";
        wrapper.classList.remove('active-forgot');
        wrapper.classList.add('active-verification');
    });

    document.getElementById("verifyCodeForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        verificationForm.style.display = "none";
        newPasswordForm.style.display = "block";
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
            const role = sessionStorage.getItem('selectedRole') || 'applicant';
            newPasswordForm.style.display = 'none';
            document.querySelector(`.${role}-form`).style.display = 'block';
            wrapper.classList.remove('active-new-password');
        }, 2000);
    });

    // Applicant Registration
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
                window.location.href = "../Timeline/timeline.html";
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

    // Check auth status for admin and assessor
    async function checkAuthStatus(role) {
        try {
            const response = await fetch(`/${role}/auth-status`, {
                credentials: "include"
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    window.location.href = `/client/${role}/dashboard/dashboard.html`;
                }
            }
        } catch (error) {
            console.error(`${role} auth check error:`, error);
        }
    }

    // Check auth status on page load if coming from a role-specific page
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam === 'admin') {
        checkAuthStatus('admin');
    } else if (roleParam === 'assessor') {
        checkAuthStatus('assessor');
    }
});