document.addEventListener('DOMContentLoaded', function() {
    // Theme Management
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.className = savedTheme + '-mode';

    themeToggle.addEventListener('click', function() {
        if (body.classList.contains('light-mode')) {
            body.className = 'dark-mode';
            localStorage.setItem('theme', 'dark');
        } else {
            body.className = 'light-mode';
            localStorage.setItem('theme', 'light');
        }
    });

    // Elements
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectForm = document.getElementById('project-form');
    const projectEditForm = document.getElementById('project-edit-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const adminProjectsGrid = document.getElementById('admin-projects-grid');

    // Check if already logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
        showAdminSection();
    }

    // Login Form
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/.netlify/functions/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                showAdminSection();
            } else {
                loginError.textContent = 'Falsches Passwort';
            }
        } catch (error) {
            loginError.textContent = 'Verbindungsfehler. Bitte versuchen Sie es erneut.';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        showLoginSection();
    });

    // Add Project Button
    addProjectBtn.addEventListener('click', function() {
        showProjectForm();
    });

    // Cancel Form
    cancelBtn.addEventListener('click', function() {
        hideProjectForm();
    });

    // Project Form Submit
    projectEditForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveProject();
    });

    function showLoginSection() {
        loginSection.style.display = 'flex';
        adminSection.style.display = 'none';
        document.getElementById('password').value = '';
        loginError.textContent = '';
    }

    function showAdminSection() {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        loadAdminProjects();
    }

    function showProjectForm(project = null) {
        const formTitle = document.getElementById('form-title');
        const projectIdInput = document.getElementById('project-id');
        const projectNameInput = document.getElementById('project-name');
        const projectDescriptionInput = document.getElementById('project-description');
        const projectGithubInput = document.getElementById('project-github');
        const projectDemoInput = document.getElementById('project-demo');

        if (project) {
            formTitle.textContent = 'Projekt bearbeiten';
            projectIdInput.value = project.id;
            projectNameInput.value = project.name;
            projectDescriptionInput.value = project.description;
            projectGithubInput.value = project.github;
            projectDemoInput.value = project.demo || '';
        } else {
            formTitle.textContent = 'Neues Projekt hinzufügen';
            projectIdInput.value = '';
            projectNameInput.value = '';
            projectDescriptionInput.value = '';
            projectGithubInput.value = '';
            projectDemoInput.value = '';
        }

        projectForm.style.display = 'block';
        projectNameInput.focus();
    }

    function hideProjectForm() {
        projectForm.style.display = 'none';
    }

    async function saveProject() {
        const projectId = document.getElementById('project-id').value;
        const projectData = {
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            github: document.getElementById('project-github').value,
            demo: document.getElementById('project-demo').value || null,
        };

        try {
            const url = '/.netlify/functions/admin-projects';
            const method = projectId ? 'PUT' : 'POST';
            const body = projectId
                ? JSON.stringify({ id: projectId, ...projectData })
                : JSON.stringify(projectData);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });

            if (response.ok) {
                hideProjectForm();
                loadAdminProjects();
            } else {
                alert('Fehler beim Speichern des Projekts');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Verbindungsfehler beim Speichern');
        }
    }

    async function deleteProject(projectId) {
        if (!confirm('Sind Sie sicher, dass Sie dieses Projekt löschen möchten?')) {
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/admin-projects', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: projectId }),
            });

            if (response.ok) {
                loadAdminProjects();
            } else {
                alert('Fehler beim Löschen des Projekts');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Verbindungsfehler beim Löschen');
        }
    }

    async function loadAdminProjects() {
        try {
            const response = await fetch('/.netlify/functions/projects');
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Projekte');
            }

            const projects = await response.json();
            displayAdminProjects(projects);
        } catch (error) {
            console.error('Error loading admin projects:', error);
            adminProjectsGrid.innerHTML =
                '<div class="error-message">Fehler beim Laden der Projekte.</div>';
        }
    }

    function displayAdminProjects(projects) {
        if (projects.length === 0) {
            adminProjectsGrid.innerHTML = '<div class="loading">Noch keine Projekte vorhanden.</div>';
            return;
        }

        adminProjectsGrid.innerHTML = projects.map(project => `
            <div class="admin-project-card">
                <h3 class="project-title">${escapeHtml(project.name)}</h3>
                <p class="project-description">${escapeHtml(project.description)}</p>
                <div class="project-links">
                    <a href="${escapeHtml(project.github)}" target="_blank" rel="noopener" class="project-link">
                        <span>📦</span> GitHub
                    </a>
                    ${project.demo ? `
                        <a href="${escapeHtml(project.demo)}" target="_blank" rel="noopener" class="project-link">
                            <span>🚀</span> Demo
                        </a>
                    ` : ''}
                </div>
                <div class="admin-project-actions">
                    <button onclick="editProject('${project.id}')" class="edit-button">Bearbeiten</button>
                    <button onclick="deleteProject('${project.id}')" class="delete-button">Löschen</button>
                </div>
            </div>
        `).join('');
    }

    // Global functions for button clicks
    window.editProject = function(projectId) {
        fetch('/.netlify/functions/projects')
            .then(response => response.json())
            .then(projects => {
                const project = projects.find(p => p.id === projectId);
                if (project) {
                    showProjectForm(project);
                }
            })
            .catch(error => {
                console.error('Error loading project for editing:', error);
            });
    };

    window.deleteProject = deleteProject;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Page Animation
    body.classList.add('fade-in');
});