   // DOM Elements
        const loadingSpinner = document.getElementById("loadingSpinner");
        const notification = document.getElementById("notification");
        const searchInput = document.getElementById("searchInput");
        const messagesContainer = document.getElementById("messagesContainer");
        const messageInput = document.getElementById("messageInput");
        const sendButton = document.getElementById("sendButton");
        const navItems = document.querySelectorAll(".nav-item");
        const sections = document.querySelectorAll(".section");
        const viewFilesButton = document.getElementById("viewFilesButton");
        const filesPanel = document.getElementById("filesPanel");
        const closeFilesButton = document.getElementById("closeFilesButton");
        const filesList = document.getElementById("filesList");
        const applicantInfo = document.getElementById("applicantInfo");

        // Initialize the messaging system
        document.addEventListener("DOMContentLoaded", async () => {
            initializeEventListeners();
            await loadAdminInfo();
            
            // Set the active section based on URL or default
            showSection('followups');
        });

        // Initialize all event listeners
        function initializeEventListeners() {
            // Initialize dropdown and logout
            initializeDropdown();
            initializeLogout();
            
            // Navigation items click handler
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    const section = this.getAttribute('data-section');
                    showSection(section);
                });
            });
            
            // Search functionality
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('.conversation-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(searchTerm) ? 'block' : 'none';
                });
            });
            
            // View files button
            viewFilesButton.addEventListener('click', function() {
                filesPanel.style.display = 'block';
                messagesContainer.style.display = 'none';
            });
            
            // Close files panel
            closeFilesButton.addEventListener('click', function() {
                filesPanel.style.display = 'none';
                messagesContainer.style.display = 'block';
            });
        }

        function updateHeader(conversationItem) {
            const applicantName = conversationItem.querySelector('.conversation-user span').textContent;
            const applicantId = conversationItem.getAttribute('data-applicant');
            
            applicantInfo.textContent = `${applicantName} (Applicant ID: ${applicantId})`;
        }

        function showSection(sectionId) {
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected section
            const sectionToShow = document.getElementById(`${sectionId}Section`);
            if (sectionToShow) {
                sectionToShow.classList.add('active');
            }
            
            // Update active nav item
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-section') === sectionId) {
                    item.classList.add('active');
                }
            });
        }

        function initializeDropdown() {
            const profileDropdown = document.querySelector('.profile-dropdown');
            const dropdownMenu = document.querySelector('.dropdown-menu');
            
            if (!profileDropdown || !dropdownMenu) return;

            // Toggle dropdown
            profileDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = dropdownMenu.style.opacity === '1';
                
                // Close all other dropdowns first
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.style.opacity = '0';
                        menu.style.visibility = 'hidden';
                        menu.style.transform = 'translateY(10px)';
                    }
                });
                
                // Toggle current dropdown
                dropdownMenu.style.opacity = isOpen ? '0' : '1';
                dropdownMenu.style.visibility = isOpen ? 'hidden' : 'visible';
                dropdownMenu.style.transform = isOpen ? 'translateY(10px)' : 'translateY(0)';
            });

            // Close when clicking outside
            document.addEventListener('click', function() {
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.visibility = 'hidden';
                dropdownMenu.style.transform = 'translateY(10px)';
            });

            // Prevent closing when clicking inside dropdown
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
                // Simulate API call to get admin info
                showLoading();
                setTimeout(() => {
                    hideLoading();
                    updateUserDisplay({ fullName: "Admin User" });
                }, 1000);
            } catch (error) {
                console.error('Error loading admin info:', error);
                hideLoading();
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
            }
        }

        async function handleLogout() {
            showLoading();
            try {
                // Simulate logout API call
                setTimeout(() => {
                    showNotification('Logout successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/frontend/AdminSide/1.adminLogin/adminlogin.html';
                    }, 1500);
                }, 1000);
            } catch (error) {
                console.error('Logout error:', error);
                showNotification('Logout failed. Please try again.', 'error');
                hideLoading();
            }
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
            const notification = document.getElementById("notification");
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove("show");
            }, 3000);
        }

        // Functions to be called by backend integration
        function populateConversations(conversations) {
            const conversationList = document.querySelector('.conversation-list');
            conversationList.innerHTML = '<div class="conversation-header">Follow-Up</div>';
            
            conversations.forEach(conv => {
                const conversationItem = document.createElement('div');
                conversationItem.className = 'conversation-item';
                conversationItem.setAttribute('data-applicant', conv.applicantId);
                
                conversationItem.innerHTML = `
                    <div class="conversation-user">
                        <span>${conv.applicantName} (Applicant)</span>
                        <span class="conversation-time">${conv.lastMessageTime}</span>
                    </div>
                    <div class="conversation-preview">${conv.lastMessagePreview}</div>
                `;
                
                conversationItem.addEventListener('click', function() {
                    document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    updateHeader(this);
                    // Call backend to load messages for this conversation
                    loadConversationMessages(conv.applicantId);
                });
                
                conversationList.appendChild(conversationItem);
            });
        }

        function loadConversationMessages(applicantId) {
            showLoading();
            // This function should be implemented to fetch messages from backend
            // and call populateMessages() with the response
        }

        function populateMessages(messages) {
            messagesContainer.innerHTML = '';
            
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender === 'admin' ? 'sent' : 'received'}`;
                
                messageDiv.innerHTML = `
                    <div class="message-content">${msg.content}</div>
                    <div class="message-time">${msg.time}</div>
                `;
                
                messagesContainer.appendChild(messageDiv);
            });
            
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                hideLoading();
            }, 100);
        }

        function populateFiles(files) {
            filesList.innerHTML = '';
            
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                const fileIcon = getFileIcon(file.type);
                
                fileItem.innerHTML = `
                    ${fileIcon}
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-date">Uploaded: ${file.uploadDate}</span>
                    </div>
                    <a href="${file.downloadUrl}" class="download-file" download>
                        <i class="fas fa-download"></i>
                    </a>
                `;
                
                filesList.appendChild(fileItem);
            });
        }

        function getFileIcon(fileType) {
            const type = fileType.toLowerCase();
            if (type.includes('pdf')) return '<i class="fas fa-file-pdf"></i>';
            if (type.includes('word') || type.includes('doc')) return '<i class="fas fa-file-word"></i>';
            if (type.includes('excel') || type.includes('xls')) return '<i class="fas fa-file-excel"></i>';
            if (type.includes('image')) return '<i class="fas fa-file-image"></i>';
            if (type.includes('zip') || type.includes('rar')) return '<i class="fas fa-file-archive"></i>';
            return '<i class="fas fa-file"></i>';
        }