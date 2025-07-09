document.addEventListener("DOMContentLoaded", function () {
  // Authentication and dropdown code remains the same
  const logoutButton = document.querySelector("#logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      sessionStorage.clear();
      localStorage.removeItem("userSession");
      window.location.href = "../login/login.html";
    });
  }

  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      const parentDropdown = toggle.parentElement;
      parentDropdown.classList.toggle("active");

      document.querySelectorAll(".dropdown").forEach((dropdown) => {
        if (dropdown !== parentDropdown) {
          dropdown.classList.remove("active");
        }
      });
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown").forEach((dropdown) => {
        dropdown.classList.remove("active");
      });
    }
  });

  // New Timeline Logic
  async function fetchApplicantStatus() {
    try {
      const response = await fetch("/applicant/auth-status");
      const data = await response.json();

      if (data.authenticated && data.user) {
        updateTimeline(data.user.status);
      } else {
        // Handle unauthenticated user
        window.location.href = "../login/login.html";
      }
    } catch (error) {
      console.error("Error fetching applicant status:", error);
    }
  }

   function updateTimeline(status) {
    const steps = document.querySelectorAll("#progress-bar li");
    const timelineTitle = document.querySelector(".timeline");
    const resultLink = document.getElementById("result-link");

    // Reset all steps
    steps.forEach((step) => {
      step.className = "step-todo";
      step.style.display = ""; // Reset display property
    });

    switch (status) {
      case "Pending Review":
        steps[0].className = "step-active";
        break;

      case "Approved":
        steps[0].className = "step-done";
        steps[1].className = "step-active";
        break;

      case "Under Assessment":
        steps[0].className = "step-done";
        steps[1].className = "step-done";
        steps[2].className = "step-active";
        break;

      case "Evaluated - Passed":
        steps.forEach((step) => (step.className = "step-done"));
        resultLink.href = "result.html";
        resultLink.style.pointerEvents = "auto";
        resultLink.style.color = "";
        break;

     case "Evaluated - Failed":
  steps.forEach((step) => (step.className = "step-done"));

  steps[4].className = "step-failed";
  steps[4].querySelector(".step-title").textContent = "Failed";
  steps[4].querySelector(".sub-text").innerHTML =
    'View Application <a href="result.html">Results</a>';

  timelineTitle.textContent = "Application Timeline (Not Passed)";
  break;

        case "Rejected":
      // Update first step (Application)
      steps[0].className = "step-done";
      
      // Update second step (Approved -> Rejected)
      steps[1].className = "step-rejected";
      const rejectedStep = steps[1];
      
      // Clear existing content and rebuild with proper structure
      rejectedStep.innerHTML = `
        <span class="step-title">Rejected</span>
        <p class="sub-text">Your application was rejected</p>
      `;
      
      // Position the title above for even-numbered steps
       const stepTitle = rejectedStep.querySelector('.step-title');
      stepTitle.style.position = "absolute";
      stepTitle.style.top = "-60px"; // Reduced from -90px
      stepTitle.style.left = "50%";
      stepTitle.style.transform = "translateX(-50%)";
      stepTitle.style.color = "#f44336";
      stepTitle.style.fontWeight = "bold";
      
      // Style the rejection message to appear below the indicator
      const subText = rejectedStep.querySelector('.sub-text');
      subText.style.position = "relative";
      subText.style.top = "0";
      subText.style.left = "0";
      subText.style.transform = "none";
      subText.style.marginTop = "10px";
      subText.style.color = "#f44336";
      subText.style.fontWeight = "bold";
      subText.style.textAlign = "center";
      
      // Hide remaining steps
      for (let i = 2; i < steps.length; i++) {
        steps[i].style.display = "none";
      }
      
      // Update timeline title
      timelineTitle.textContent = "Application Timeline (Rejected)";
      timelineTitle.style.color = "#f44336";
      break;

    default:
      steps[0].className = "step-active";
  }
}

  // Disable scroll
  document.body.style.overflow = 'hidden';

  fetchApplicantStatus();
});