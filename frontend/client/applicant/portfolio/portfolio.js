document.addEventListener("DOMContentLoaded", async function () {
  // Initialize the file viewer immediately
  initializeFileViewer();

  try {
    // Check authentication status
    const authResponse = await fetch("/applicant/auth-status");
    const authData = await authResponse.json();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      showAlert("Session expired. Please login again.", "error");
      setTimeout(() => {
        window.location.href = "/client/Applicant/Login/login.html";
      }, 2000);
      return;
    }

    if (!authData.authenticated) {
      window.location.href = "../Login/login.html";
      return;
    }

    // If authenticated, use the user data from auth response
    if (authData.user) {
      console.log("User data from auth:", authData.user);
      setupEventListeners();
      fetchAndDisplayFiles(); // Add this line
    } else {
      showNotification("No user data found. Please log in again.");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Failed to load profile data. Please try again.");
  }

  async function logoutUser() {
    try {
      const response = await fetch("/applicant/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (response.ok) {
        // Clear frontend storage
        sessionStorage.clear();
        localStorage.clear();

        // Redirect to login page
        window.location.href = "../Login/login.html";
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      showErrorMessage("Failed to logout. Please try again.");
    }
  }

  function setupEventListeners() {
    const logoutButton = document.querySelector("#logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        logoutUser();
      });
    }

    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        const parentDropdown = toggle.parentElement;
        parentDropdown.classList.toggle("active");

        // Close other dropdowns
        document.querySelectorAll(".dropdown").forEach((dropdown) => {
          if (dropdown !== parentDropdown) {
            dropdown.classList.remove("active");
          }
        });
      });
    });

    // Close dropdowns if clicked outside
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown").forEach((dropdown) => {
          dropdown.classList.remove("active");
        });
      }
    });

    document.querySelectorAll(".top-section").forEach((section) => {
      section.addEventListener("click", function () {
        document
          .querySelectorAll(".dropdown-section")
          .forEach((otherSection) => {
            if (otherSection !== this.closest(".dropdown-section")) {
              otherSection.classList.remove("expanded");
              otherSection.querySelector(".arrow").classList.remove("rotated");
              otherSection.querySelector(".file-table").classList.add("hidden");
              otherSection.querySelector(".upload-btn").classList.add("hidden");
            }
          });

        const parent = this.closest(".dropdown-section");
        parent.classList.toggle("expanded"); // Toggle expand class to control height
        parent.querySelector(".arrow").classList.toggle("rotated"); // Rotate arrow
        parent.querySelector(".file-table").classList.toggle("hidden");
        parent.querySelector(".upload-btn").classList.toggle("hidden");
      });
    });

    document.querySelectorAll(".upload-btn").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.closest(".dropdown-section").querySelector(".file-input").click();
      });
    });

    document.querySelectorAll(".file-input").forEach((input) => {
      input.addEventListener("change", function () {
        const parent = this.closest(".dropdown-section");
        const fileTableBody = parent.querySelector(".file-table tbody");
        const fileCountSpan = parent.querySelector(".file-count");

        Array.from(this.files).forEach((file) => {
          const documentId = Math.floor(Math.random() * 10000);
          const row = document.createElement("tr");
          row.innerHTML = `
                    <td title="${file.name}">${file.name}</td>
                    <td>Uploaded</td>
                    <td>${new Date().toLocaleDateString()}</td>
                    <td>${documentId}</td>
                    <td>
                        <button class="view-btn"(
                          file
                        )}">
                        <i class="fas fa-eye"></i>
                        </button>
                        <button class="delete-btn"> <i class="fas fa-trash"></i></button>
                    </td>
                `;
          fileTableBody.appendChild(row);
        });
        fileCountSpan.textContent = fileTableBody.children.length;
        this.value = "";
      });
    });

    document.addEventListener("click", function (event) {
      if (event.target.classList.contains("delete-btn")) {
        const row = event.target.closest("tr");
        const parent = row.closest(".dropdown-section");
        row.remove();
        parent.querySelector(".file-count").textContent =
          parent.querySelector(".file-table tbody").children.length;
      }

      if (event.target.classList.contains("view-btn")) {
      }
    });

    const searchBar = document.querySelector(".search-bar");
    const clearSearchBtn = document.querySelector(".clear-search");

    // Show/hide the X icon based on input value
    searchBar.addEventListener("input", function () {
      const searchText = searchBar.value.toLowerCase();
      if (searchText.length > 0) {
        clearSearchBtn.style.display = "block"; // Show X icon
      } else {
        clearSearchBtn.style.display = "none"; // Hide X icon when the input is empty
      }

      document.querySelectorAll(".dropdown-section").forEach((section) => {
        const fileRows = section.querySelectorAll("tbody tr");
        let fileMatch = false;

        fileRows.forEach((row) => {
          const fileName = row.querySelector("td").textContent.toLowerCase();
          if (fileName.includes(searchText)) {
            row.style.display = "table-row";
            fileMatch = true;
          } else {
            row.style.display = "none";
          }
        });

        if (fileMatch) {
          section.classList.add("expanded");
          section.querySelector(".arrow").classList.add("rotated");
          section.querySelector(".file-table").classList.remove("hidden");
          section.querySelector(".upload-btn").classList.remove("hidden");
        } else {
          section.classList.remove("expanded");
          section.querySelector(".arrow").classList.remove("rotated");
          section.querySelector(".file-table").classList.add("hidden");
          section.querySelector(".upload-btn").classList.add("hidden");
        }
      });
    });

    // Clear the search bar when the X icon is clicked
    clearSearchBtn.addEventListener("click", function () {
      searchBar.value = ""; // Clear the input
      clearSearchBtn.style.display = "none"; // Hide the X icon
      searchBar.dispatchEvent(new Event("input")); // Trigger input event to update file display
    });
  }

  async function fetchAndDisplayFiles() {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        showNotification(
          "User session not found. Please login again.",
          "error"
        );
        setTimeout(() => {
          window.location.href = "../Login/login.html";
        }, 2000);
        return;
      }

      const response = await fetchWithTimeout(
        `/api/fetch-user-files/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            credentials: "same-origin",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch files");
      }

      if (!data.files || Object.keys(data.files).length === 0) {
        Object.entries(sections).forEach(([label, sectionTitle]) => {
          const section = findSectionByTitle(sectionTitle);
          if (section) {
            const tbody = section.querySelector("tbody");
            const fileCountSpan = section.querySelector(".file-count");
            tbody.innerHTML =
              '<tr><td colspan="5">No files uploaded yet</td></tr>';
            fileCountSpan.textContent = "0";
          }
        });
        return;
      }

      // Update each section with its files
      const sections = {
        "initial-submission": "Initial Submissions",
        resume: "Updated Resume / CV",
        training: "Certificate of Training",
        awards: "Awards",
        interview: "Interview Form",
        others: "Others",
      };

      function findSectionByTitle(sectionTitle) {
        const sections = document.querySelectorAll(".dropdown-section");
        return Array.from(sections).find((section) => {
          const h4 = section.querySelector("h4");
          return h4 && h4.textContent.trim() === sectionTitle;
        });
      }

      Object.entries(sections).forEach(([label, sectionTitle]) => {
        const files = data.files[label] || [];
        const section = findSectionByTitle(sectionTitle);
        if (section) {
          const tbody = section.querySelector("tbody");
          const fileCountSpan = section.querySelector(".file-count");

          // Clear existing rows
          tbody.innerHTML = "";

          // Add files to table
          files.forEach((file) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td title="${file.filename}">${file.filename}</td>
                <td>${file.contentType}</td>
                <td>${new Date(file.uploadDate).toLocaleDateString()}</td>
                <td>${file._id}</td>
                <td class="action-buttons">
                    <button class="view-btn" data-file-id="${file._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-btn" data-file-id="${file._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
          });

          // Update file count
          fileCountSpan.textContent = files.length;
        }
      });
    } catch (error) {
      console.error("Error fetching files:", error);
      showNotification(
        `Failed to load files: ${error.message}. Please try again.`,
        "error"
      );
    }
  }

  function showNotification(message, type = "info") {
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  async function fetchWithTimeout(url, options, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw error;
    }
  }

  let currentFiles = [];
  let currentFileIndex = 0;

  // Replace the existing initializeFileViewer function
  function initializeFileViewer() {
    const modal = document.getElementById("fileModal");
    const closeBtn = document.querySelector(".close-modal");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const fileViewer = document.getElementById("fileViewer");
    const imageViewer = document.getElementById("imageViewer");

    function closeModal() {
      if (modal) {
        modal.style.display = "none";
        if (fileViewer) fileViewer.src = "";
        if (imageViewer) imageViewer.style.display = "none";
        currentFiles = [];
        currentFileIndex = 0;
      }
    }

    // Close button event
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    // Click outside modal to close
    document.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (currentFileIndex > 0) {
          showFile(currentFileIndex - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (currentFileIndex < currentFiles.length - 1) {
          showFile(currentFileIndex + 1);
        }
      });
    }

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (modal && modal.style.display === "block") {
        if (e.key === "ArrowLeft" && currentFileIndex > 0) {
          showFile(currentFileIndex - 1);
        }
        if (
          e.key === "ArrowRight" &&
          currentFileIndex < currentFiles.length - 1
        ) {
          showFile(currentFileIndex + 1);
        }
        if (e.key === "Escape") {
          closeModal();
        }
      }
    });
  }

  async function viewFile(fileId, sectionFiles) {
    try {
      if (!fileId || !sectionFiles || !sectionFiles.length) {
        throw new Error("Invalid file data");
      }

      currentFiles = sectionFiles;
      currentFileIndex = currentFiles.findIndex((file) => file._id === fileId);

      if (currentFileIndex === -1) {
        throw new Error("File not found in section");
      }

      const modal = document.getElementById("fileModal");
      if (!modal) {
        throw new Error("Modal element not found");
      }

      modal.style.display = "block";
      await showFile(currentFileIndex);
    } catch (error) {
      console.error("Error viewing file:", error);
      showNotification("Error loading file: " + error.message, "error");
    }
  }

  async function showFile(index) {
    try {
      if (index < 0 || index >= currentFiles.length) return;

      currentFileIndex = index;
      const file = currentFiles[index];

      // Update navigation buttons
      const prevBtn = document.querySelector(".prev-btn");
      const nextBtn = document.querySelector(".next-btn");

      if (prevBtn) {
        prevBtn.disabled = index === 0;
        prevBtn.style.opacity = index === 0 ? "0.5" : "1";
      }
      if (nextBtn) {
        nextBtn.disabled = index === currentFiles.length - 1;
        nextBtn.style.opacity = index === currentFiles.length - 1 ? "0.5" : "1";
      }

      // Update file info
      const currentFileText = document.getElementById("currentFileText");
      const fileName = document.getElementById("fileName");

      if (currentFileText) {
        currentFileText.textContent = `File ${index + 1} of ${
          currentFiles.length
        }`;
      }
      if (fileName) {
        fileName.textContent = file.filename;
      }

      const response = await fetch(`/api/fetch-documents/${file._id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const fileViewer = document.getElementById("fileViewer");
      const imageViewer = document.getElementById("imageViewer");

      // Reset viewers
      if (fileViewer) {
        fileViewer.style.display = "none";
        fileViewer.src = "";
      }
      if (imageViewer) {
        imageViewer.style.display = "none";
        imageViewer.src = "";
      }

      // Display appropriate viewer based on file type
      if (file.contentType.startsWith("image/")) {
        if (imageViewer) {
          imageViewer.src = url;
          imageViewer.style.display = "block";
        }
      } else if (file.contentType === "application/pdf") {
        if (fileViewer) {
          fileViewer.src = url;
          fileViewer.style.display = "block";
        }
      } else {
        showNotification("File type not supported for preview", "info");
      }
    } catch (error) {
      console.error("Error displaying file:", error);
      showNotification("Error loading file: " + error.message, "error");
    }
  }

  // Update the event listener for view buttons
  document.addEventListener("click", async function (event) {
    const viewBtn = event.target.closest(".view-btn");
    if (!viewBtn) return;

    event.preventDefault();
    event.stopPropagation();

    try {
      const fileId = viewBtn.getAttribute("data-file-id");
      const section = viewBtn.closest(".dropdown-section");

      if (!section || !fileId) {
        throw new Error("Invalid file or section");
      }

      const sectionFiles = Array.from(section.querySelectorAll("tbody tr")).map(
        (row) => ({
          _id: row.querySelector(".view-btn").getAttribute("data-file-id"),
          filename: row.querySelector("td:first-child").textContent,
          contentType: row.querySelector("td:nth-child(2)").textContent,
        })
      );

      await viewFile(fileId, sectionFiles);
    } catch (error) {
      console.error("Error handling view button click:", error);
      showNotification("Error loading file viewer", "error");
    }
  });
});
