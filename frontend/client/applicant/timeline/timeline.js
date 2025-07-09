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
       timelineTitle.textContent = "Application Timeline (Rejected)";
      timelineTitle.style.color = "#f44336";
      
      // Add mobile-specific styles if needed
      if (window.innerWidth <= 768) {
        const rejectedContainer = steps[1].querySelector('.rejected-container');
        rejectedContainer.style.display = 'flex';
        rejectedContainer.style.flexDirection = 'column';
        rejectedContainer.style.alignItems = 'center';
        rejectedContainer.style.textAlign = 'center';
        
        const stepIndicator = steps[1].querySelector('.step-indicator');
        stepIndicator.style.width = '30px';
        stepIndicator.style.height = '30px';
        stepIndicator.style.borderRadius = '50%';
        stepIndicator.style.backgroundColor = '#f44336';
        stepIndicator.style.display = 'flex';
        stepIndicator.style.justifyContent = 'center';
        stepIndicator.style.alignItems = 'center';
        stepIndicator.style.color = 'white';
        stepIndicator.style.fontWeight = 'bold';
        stepIndicator.style.margin = '5px 0';
        stepIndicator.textContent = '!';
        
        const rejectedMessage = steps[1].querySelector('.rejected-message');
        rejectedMessage.style.color = '#f44336';
        rejectedMessage.style.fontWeight = 'bold';
        rejectedMessage.style.marginTop = '5px';
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