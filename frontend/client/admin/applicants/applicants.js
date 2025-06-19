// DOM Elements
const loadingSpinner = document.getElementById("loadingSpinner");
const allStudentsTableBody = document.getElementById("allStudentsTableBody");

// Store applicants data globally for sorting
let applicants = [];

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", async () => {
  initializeEventListeners();
  await loadAdminInfo();
  await fetchApplicants(); // Load applicants data when page loads
});

// Fetch applicants data from server
async function fetchApplicants() {
  showLoading();
  try {
    const response = await fetch('/api/admin/applicants', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch applicants');
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // Store applicants locally for search and sorting
      applicants = data.data;
      
      // Update the total applicants counter in sessionStorage
      sessionStorage.setItem('totalApplicants', applicants.length);
      
      // Update the counter in the dashboard if it exists on this page
      updateTotalApplicantsCounter(applicants.length);
      
      renderApplicantsTable(applicants);
    } else {
      showNotification('No applicants found', 'info');
      sessionStorage.setItem('totalApplicants', '0');
      updateTotalApplicantsCounter(0);
      renderEmptyState();
    }
  } catch (error) {
    console.error('Error fetching applicants:', error);
    showNotification('Failed to load applicants', 'error');
    sessionStorage.setItem('totalApplicants', '0');
    updateTotalApplicantsCounter(0);
    renderEmptyState();
  } finally {
    hideLoading();
  }
}

// Update total applicants counter
function updateTotalApplicantsCounter(count) {
  const dashboardCounter = document.getElementById('totalStudents');
  if (dashboardCounter) {
    dashboardCounter.textContent = count;
  }
  
  const listPageCounter = document.getElementById('totalApplicants');
  if (listPageCounter) {
    listPageCounter.textContent = count;
  }
  
  sessionStorage.setItem('totalApplicants', count);
}

// Render applicants data in the table
function renderApplicantsTable(applicants) {
  if (!allStudentsTableBody) return;
  
  allStudentsTableBody.innerHTML = '';
  
  if (applicants.length === 0) {
    renderEmptyState();
    return;
  }
  
  applicants.forEach(applicant => {
    const row = document.createElement('tr');
    
    const appDate = new Date(applicant.applicationDate);
    const formattedDate = appDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    row.innerHTML = `
      <td>${applicant.applicantId || 'N/A'}</td>
      <td>${applicant.name || 'No name provided'}</td>
      <td>${applicant.course || 'Not specified'}</td>
      <td>${formattedDate}</td>
      <td>${applicant.currentScore || 0}</td>
      <td>
        <span class="status-badge status-${applicant.status.toLowerCase().replace(' ', '-')}">
          ${applicant.status}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view-btn" data-id="${applicant._id}">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="action-btn reject-btn" data-id="${applicant._id}">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </td>
    `;
    
    allStudentsTableBody.appendChild(row);
  });
  
  addActionButtonListeners();
}

// View applicant details
function viewApplicantDetails(applicantId) {
  sessionStorage.setItem('currentApplicantId', applicantId);
  window.location.href = `/client/admin/applicantprofile/applicantprofile.html?id=${applicantId}`;
}

// Reject applicant
async function rejectApplicant(applicantId) {
  if (!confirm('Are you sure you want to reject this applicant?')) {
    return;
  }
  
  showLoading();
  try {
    const response = await fetch(`/api/admin/applicants/${applicantId}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('Applicant rejected successfully', 'success');
      await fetchApplicants();
    } else {
      showNotification(data.error || 'Failed to reject applicant', 'error');
    }
  } catch (error) {
    console.error('Error rejecting applicant:', error);
    showNotification('Failed to reject applicant', 'error');
  } finally {
    hideLoading();
  }
}

// Render empty state
function renderEmptyState() {
  if (!allStudentsTableBody) return;
  
  allStudentsTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="empty-state">
        <i class="fas fa-users-slash"></i>
        <h3>No Applicants Found</h3>
        <p>There are currently no applicants in the system.</p>
      </td>
    </tr>
  `;
}

// Add event listeners to action buttons
function addActionButtonListeners() {
  const viewButtons = document.querySelectorAll('.view-btn');
  const rejectButtons = document.querySelectorAll('.reject-btn');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const applicantId = e.currentTarget.getAttribute('data-id');
      viewApplicantDetails(applicantId);
    });
  });
  
  rejectButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const applicantId = e.currentTarget.getAttribute('data-id');
      rejectApplicant(applicantId);
    });
  });
}

// Initialize all event listeners
function initializeEventListeners() {
  initializeDropdown();
  initializeLogout();
  initializeSortDropdown();
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
}

function initializeSortDropdown() {
  const sortBtn = document.querySelector('.sort-btn');
  const sortOptions = document.querySelector('.sort-options');

  if (sortBtn && sortOptions) {
    sortBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sortOptions.style.display = sortOptions.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      sortOptions.style.display = 'none';
    });

    document.querySelectorAll('.sort-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const sortType = e.target.getAttribute('data-sort');
        handleSort(sortType);
        sortOptions.style.display = 'none';
      });
    });
  }
}

function handleSort(sortType) {
  if (!applicants || applicants.length === 0) return;

  let sortedApplicants = [...applicants];

  switch (sortType) {
    case 'name-asc':
      sortedApplicants.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'name-desc':
      sortedApplicants.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      break;
    case 'id-asc':
      sortedApplicants.sort((a, b) => (a.applicantId || '').localeCompare(b.applicantId || ''));
      break;
    case 'id-desc':
      sortedApplicants.sort((a, b) => (b.applicantId || '').localeCompare(a.applicantId || ''));
      break;
    case 'status-pending':
      sortedApplicants = sortedApplicants.filter(app => 
        app.status.toLowerCase().includes('pending'));
      break;
    case 'status-under-assessment':
      sortedApplicants = sortedApplicants.filter(app => 
        app.status.toLowerCase().includes('under assessment'));
      break;
    case 'status-evaluated-pass':
      sortedApplicants = sortedApplicants.filter(app => 
        app.status.toLowerCase().includes('evaluated-pass') || 
        app.status.toLowerCase().includes('evaluated pass'));
      break;
    default:
      break;
  }

  renderApplicantsTable(sortedApplicants);
  
  let sortMessage = '';
  switch (sortType) {
    case 'name-asc': sortMessage = 'Sorted by name (A-Z)'; break;
    case 'name-desc': sortMessage = 'Sorted by name (Z-A)'; break;
    case 'id-asc': sortMessage = 'Sorted by ID (ascending)'; break;
    case 'id-desc': sortMessage = 'Sorted by ID (descending)'; break;
    case 'status-pending': sortMessage = 'Showing Pending Review applicants'; break;
    case 'status-under-assessment': sortMessage = 'Showing Under Assessment applicants'; break;
    case 'status-evaluated-pass': sortMessage = 'Showing Evaluated-Pass applicants'; break;
  }
  
  if (sortMessage) {
    showNotification(sortMessage, 'info');
  }
}

// Handle search functionality
async function handleSearch(e) {
  const searchTerm = e.target.value.trim().toLowerCase();
  
  if (!searchTerm) {
    await fetchApplicants();
    return;
  }

  showLoading();
  try {
    const localResults = applicants.filter(applicant => 
      (applicant.name && applicant.name.toLowerCase().includes(searchTerm)) ||
      (applicant.applicantId && applicant.applicantId.toLowerCase().includes(searchTerm)) ||
      (applicant.course && applicant.course.toLowerCase().includes(searchTerm))
    );
    
    if (localResults.length > 0) {
      renderApplicantsTable(localResults);
      hideLoading();
      return;
    }
    
    const response = await fetch(`/api/admin/applicants/search?term=${encodeURIComponent(searchTerm)}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Search failed');
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      renderApplicantsTable(data.data);
    } else {
      renderEmptyState();
      showNotification('No matching applicants found', 'info');
    }
  } catch (error) {
    console.error('Search error:', error);
    showNotification(error.message || 'Search failed', 'error');
    renderEmptyState();
  } finally {
    hideLoading();
  }
}

// ======================
// DROPDOWN & LOGOUT SYSTEM
// ======================

function initializeDropdown() {
  const profileDropdown = document.querySelector('.profile-dropdown');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (!profileDropdown || !dropdownMenu) return;

  profileDropdown.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = dropdownMenu.style.opacity === '1';
    
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdownMenu) {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(10px)';
      }
    });
    
    dropdownMenu.style.opacity = isOpen ? '0' : '1';
    dropdownMenu.style.visibility = isOpen ? 'hidden' : 'visible';
    dropdownMenu.style.transform = isOpen ? 'translateY(10px)' : 'translateY(0)';
  });

  document.addEventListener('click', function() {
    dropdownMenu.style.opacity = '0';
    dropdownMenu.style.visibility = 'hidden';
    dropdownMenu.style.transform = 'translateY(10px)';
  });

  dropdownMenu.addEventListener('click', function(e) {
    e.stopPropagation();
  });
}

function initializeLogout() {
  const logoutLink = document.getElementById('logoutLink');
  if (!logoutLink) return;

  logoutLink.addEventListener('click', async function(e) {
    e.preventDefault();
    await handleLogout();
  });
}

async function loadAdminInfo() {
  try {
    const response = await fetch('http://localhost:3000/admin/auth-status', {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch admin info');
    
    const data = await response.json();
    
    if (data.authenticated && data.user) {
      updateUserDisplay(data.user);
      sessionStorage.setItem('adminData', JSON.stringify(data.user));
    } else {
      redirectToLogin();
    }
  } catch (error) {
    console.error('Error loading admin info:', error);
    const storedData = sessionStorage.getItem('adminData');
    if (storedData) {
      updateUserDisplay(JSON.parse(storedData));
    } else {
      redirectToLogin();
    }
  }
}

function updateUserDisplay(user) {
  const usernameElement = document.querySelector('.username');
  const avatarElement = document.querySelector('.user-avatar');
  
  if (usernameElement && user) {
    usernameElement.textContent = user.fullName || user.email || 'Admin';
  }
  
  if (avatarElement) {
    const displayName = user?.fullName || user?.email || 'A';
    avatarElement.textContent = displayName.charAt(0).toUpperCase();
    avatarElement.style.fontFamily = 'Arial, sans-serif';
  }
}

async function handleLogout() {
  showLoading();
  try {
    const authCheck = await fetch('http://localhost:3000/admin/auth-status', {
      credentials: 'include'
    });
    
    if (!authCheck.ok) {
      clearAuthData();
      redirectToLogin();
      return;
    }

    const response = await fetch('http://localhost:3000/admin/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    const data = await response.json();
    if (data.success) {
      showNotification('Logout successful! Redirecting...', 'success');
      clearAuthData();
      setTimeout(redirectToLogin, 1500);
    } else {
      showNotification('Logout failed. Please try again.', 'error');
      hideLoading();
    }
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Logout failed. Please try again.', 'error');
    hideLoading();
  }
}

function redirectToLogin() {
  window.location.href = '/login/login.html';
}

function clearAuthData() {
  sessionStorage.removeItem('adminData');
}

// Utility Functions
function showLoading() {
  if (loadingSpinner) loadingSpinner.classList.add("active");
  document.body.style.overflow = "hidden";
}

function hideLoading() {
  if (loadingSpinner) loadingSpinner.classList.remove("active");
  document.body.style.overflow = "";
}

function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Export functionality
document.addEventListener("DOMContentLoaded", function() {
  const exportBtn = document.getElementById("export-btn");
  
  exportBtn.addEventListener("click", function() {
    const table = document.querySelector("#studentsSection table");
    const clonedTable = table.cloneNode(true);
    
    const rows = clonedTable.querySelectorAll("tr");
    rows.forEach((row) => {
      if (row.lastElementChild) {
        row.removeChild(row.lastElementChild);
      }
    });
    
    const ws = XLSX.utils.table_to_sheet(clonedTable);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applicants");
    XLSX.writeFile(wb, "applicants.xlsx");
    
    const notification = document.getElementById("notification");
    notification.textContent = "Export successful!";
    notification.style.display = "block";
    notification.style.backgroundColor = "#4CAF50";
    
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  });
});

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Make logout function available globally
window.handleLogout = handleLogout;