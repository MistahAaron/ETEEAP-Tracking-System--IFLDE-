class NavProfile {
  constructor() {
    this.userId = localStorage.getItem("userId");
    this.init();
  }

  async init() {
    try {
      await this.loadUserData();
      this.setupEventListeners();
    } catch (error) {
      console.error("Navigation profile initialization error:", error);
    }
  }

  async loadUserData() {
    const authResponse = await fetch("/applicant/auth-status");
    const authData = await authResponse.json();

    if (!authData.authenticated) {
      window.location.href = "../Login/login.html";
      return;
    }

    if (authData.user) {
      await this.loadProfilePicture();
      this.updateProfileName(authData.user.personalInfo || authData.user);
    }
  }

  async loadProfilePicture() {
    try {
      const response = await fetch(`/api/profile-pic/${this.userId}`);
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const navProfilePic = document.getElementById("nav-profile-pic");
        if (navProfilePic) {
          navProfilePic.src = imageUrl;
        }
      }
    } catch (error) {
      console.error("Error loading profile picture:", error);
    }
  }

  updateProfileName(userData) {
    const navProfileName = document.getElementById("nav-profile-name");
    if (navProfileName && userData) {
      const nameParts = [userData.firstname, userData.lastname];
      const displayName = nameParts
        .filter((part) => part && part.trim())
        .join(" ");
      navProfileName.innerText = displayName || "Applicant";
    }
  }
}

// Initialize the nav profile when the script loads
document.addEventListener("DOMContentLoaded", () => {
  new NavProfile();
});
