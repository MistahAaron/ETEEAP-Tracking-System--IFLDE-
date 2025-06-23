const API_BASE_URL = "http://localhost:3000";
let students = [];
let currentFilter = 'all';

// DOM Elements
const studentTableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
const loadingSpinner = document.getElementById("loadingSpinner");
const navItems = document.querySelectorAll(".nav-item");

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", async () => {
  initializeEventListeners();
  await loadAssessorInfo();
  await loadAssignedApplicants();
});

function initializeEventListeners() {
  // Search functionality with debounce
  searchInput.addEventListener("input", debounce(handleSearch, 300));

  // Initialize filter cards
  const filterCards = document.querySelectorAll('.status-filter');
  filterCards.forEach(card => {
    card.addEventListener('click', function() {
      filterCards.forEach(c => c.classList.remove('active-filter'));
      this.classList.add('active-filter');
      currentFilter = this.dataset.status;
      updateTableTitle();
      filterStudents();
    });
  });

  // Navigation
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      navigateToSection(section);
    });
  });

  // Logout functionality
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async function(e) {
      e.preventDefault();
      await handleLogout();
    });
  }
}

// Handle search functionality
function handleSearch(e) {
  const searchTerm = e.target.value.trim().toLowerCase();
  
  if (!searchTerm) {
    filterStudents(); // Show all students when search is empty
    return;
  }

  const filteredStudents = students.filter(student => 
    (student.name && student.name.toLowerCase().includes(searchTerm)) ||
    (student.email && student.email.toLowerCase().includes(searchTerm)) ||
    (student.course && student.course.toLowerCase().includes(searchTerm)) ||
    (student.applicantId && student.applicantId.toLowerCase().includes(searchTerm))
  );
  
  renderStudentTable(filteredStudents);
  document.getElementById('currentFilterTitle').textContent = 'Search Results';
}

// Filter students based on current filter
function filterStudents() {
  let filteredStudents = [];
  
  switch(currentFilter) {
    case 'assigned':
      filteredStudents = students;
      break;
    case 'in-progress':
      filteredStudents = students.filter(s => 
        s.status && (s.status.toLowerCase().includes("progress") || 
        s.status.toLowerCase().includes("assessment"))
      );
      break;
    case 'evaluated':
      filteredStudents = students.filter(s => 
        s.status && (s.status.toLowerCase().includes("approved") || 
        s.status.toLowerCase().includes("completed"))
      );
      break;
    case 'failed':
      filteredStudents = students.filter(s => 
        s.status && (s.status.toLowerCase().includes("rejected") || 
        s.status.toLowerCase().includes("failed"))
      );
      break;
    default:
      filteredStudents = students;
  }
  
  renderStudentTable(filteredStudents);
}

// Render students table
function renderStudentTable(studentsToRender) {
  studentTableBody.innerHTML = "";

  if (studentsToRender.length === 0) {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <i class="fas fa-users"></i>
          <h3>No Applicants Found</h3>
          <p>No applicants match the current criteria</p>
        </td>
      </tr>
    `;
    return;
  }

  studentsToRender.forEach(student => {
    const statusClass = student.status.toLowerCase().replace(' ', '-');
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.applicantId || student._id}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>
        <span class="status-badge status-${statusClass}">
          ${formatStatus(student.status)}
        </span>
      </td>
      <td>${student.score || student.score === 0 ? student.score : '0'}</td>
      <td>${formatDate(student.applicationDate)}</td>
      <td class="action-buttons">
        <button class="action-btn view-btn" onclick="viewStudent('${student._id}')">
          <i class="fas fa-eye"></i> View
        </button>
        <button class="action-btn reject-btn" onclick="rejectStudent('${student._id}')">
          <i class="fas fa-times"></i> Reject
        </button>
      </td>
    `;
    studentTableBody.appendChild(row);
  });
}

// Update table title based on current filter
function updateTableTitle() {
  const titleMap = {
    'assigned': 'Assigned Applicants',
    'in-progress': 'In-Progress Applicants',
    'evaluated': 'Evaluated Applicants',
    'failed': 'Failed Applicants',
    'all': 'Recent Students'
  };
  document.getElementById('currentFilterTitle').textContent = titleMap[currentFilter] || 'Recent Students';
}

// Navigate between sections
function navigateToSection(section) {
  currentSection = section;

  // Update active nav item
  navItems.forEach(item => {
    item.classList.remove("active");
    if (item.dataset.section === section) {
      item.classList.add("active");
    }
  });

  // Hide all sections
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  // Show selected section
  document.getElementById(`${section}Section`).classList.add("active");
}

// Load assigned applicants
async function loadAssignedApplicants() {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/assessor/applicants`, {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch applicants');
    
    const data = await response.json();
    
    if (data.success) {
      students = data.data || [];
      updateDashboardStats();
      filterStudents();
    } else {
      throw new Error(data.error || 'No applicants found');
    }
  } catch (error) {
    console.error('Error loading applicants:', error);
    showNotification(error.message, 'error');
    students = [];
    renderStudentTable([]);
  } finally {
    hideLoading();
  }
}

// Update dashboard statistics
function updateDashboardStats() {
  document.getElementById("totalStudents").textContent = students.length;
  
  const inProgressCount = students.filter(s => 
    s.status && (s.status.toLowerCase().includes("progress") || 
    s.status.toLowerCase().includes("assessment"))
  ).length;
  document.getElementById("activeCourses").textContent = inProgressCount;
  
  const evaluatedCount = students.filter(s => 
    s.status && (s.status.toLowerCase().includes("approved") || 
    s.status.toLowerCase().includes("completed"))
  ).length;
  document.getElementById("totalGraduates").textContent = evaluatedCount;
  
  const failedCount = students.filter(s => 
    s.status && (s.status.toLowerCase().includes("rejected") || 
    s.status.toLowerCase().includes("failed"))
  ).length;
  
  const failureRate = students.length > 0 
    ? Math.round((failedCount / students.length) * 100) 
    : 0;
  document.getElementById("successRate").textContent = `${failureRate}%`;
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

function formatStatus(status) {
  if (!status) return 'N/A';
  return status.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showLoading() {
  loadingSpinner.classList.add("active");
}

function hideLoading() {
  loadingSpinner.classList.remove("active");
}

function showNotification(message, type = "info") {
  // Remove existing notifications
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

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Load assessor info and handle logout
async function loadAssessorInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/assessor/auth-status`, {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch assessor info');
    
    const data = await response.json();
    
    if (data.authenticated && data.user) {
      updateUserDisplay(data.user);
    } else {
      window.location.href = '/client/assessor/login/login.html';
    }
  } catch (error) {
    console.error('Error loading assessor info:', error);
    window.location.href = '/client/assessor/login/login.html';
  }
}

function updateUserDisplay(user) {
  const usernameElement = document.querySelector('.username');
  if (usernameElement) {
    usernameElement.textContent = user.fullName || 'Assessor';
  }
  
  const avatarElement = document.querySelector('.user-avatar');
  if (avatarElement) {
    avatarElement.textContent = user.fullName 
      ? user.fullName.charAt(0).toUpperCase() 
      : 'A';
  }
}

// View student details
function viewStudent(applicantId) {
  const student = students.find(s => s._id === applicantId);
  const url = `/client/assessor/evaluation/evaluation.html?id=${applicantId}`;
  
  if (student && student.applicantId) {
    window.location.href = `${url}&applicantId=${student.applicantId}`;
  } else {
    window.location.href = url;
  }
}

// Reject student
async function rejectStudent(applicantId) {
  if (!confirm('Are you sure you want to reject this applicant?')) return;
  
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/assessor/applicants/${applicantId}/reject`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('Applicant rejected successfully', 'success');
      await loadAssignedApplicants();
    } else {
      throw new Error(data.error || 'Failed to reject applicant');
    }
  } catch (error) {
    console.error('Error rejecting applicant:', error);
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle logout
async function handleLogout() {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/assessor/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const data = await response.json();
    if (data.success) {
      showNotification('Logout successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/client/assessor/login/login.html';
      }, 1500);
    } else {
      throw new Error(data.error || 'Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Logout failed. Please try again.', 'error');
    hideLoading();
  }
}

// Make functions available globally
window.viewStudent = viewStudent;
window.rejectStudent = rejectStudent;
window.handleLogout = handleLogout;