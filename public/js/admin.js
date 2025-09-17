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

    // GitHub API Configuration - HIER ANPASSEN!
    const GITHUB_OWNER = 'noebachofner08'; // Ihr GitHub Username
    const GITHUB_REPO = 'my-own.website';      // Ihr Repository Name
    const ADMIN_PASSWORD_HASH = 'be661754b9988824a7420189d47bbe54c50f582b1a3544646300c94534cac243';

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
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;

        // Hash password and compare
        hashPassword(password).then(hashedPassword => {
            if (hashedPassword === ADMIN_PASSWORD_HASH) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                showAdminSection();
            } else {
                loginError.textContent = 'Falsches Passwort';
            }
        });
    });

    // Password hashing function
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

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
    projectEditForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProject();
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

    // GitHub API Functions
    async function getProjectsFromGitHub() {
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/projects.json`);

            if (response.ok) {
                const data = await response.json();
                const content = atob(data.content);
                return { projects: JSON.parse(content), sha: data.sha };
            } else {
                // File doesn't exist, return default
                const defaultProjects = [
                    {
                        id: 'example-project-1',
                        name: 'Beispiel Projekt',
                        description: 'Dies ist ein Beispielprojekt, um die Funktionalität zu demonstrieren.',
                        github: 'https://github.com/username/example-project',
                        demo: 'https://example-project-demo.netlify.app',
                        createdAt: new Date().toISOString()
                    }
                ];
                return { projects: defaultProjects, sha: null };
            }
        } catch (error) {
            console.error('Error loading projects from GitHub:', error);
            return { projects: [], sha: null };
        }
    }

    async function saveProjectsToGitHub(projects, sha) {
        const GH_TOKEN = prompt('GitHub Personal Access Token eingeben (wird nur für diesen Vorgang verwendet):');
        if (!GH_TOKEN) {
            alert('GitHub Token benötigt für das Speichern.');
            return false;
        }

        try {
            const content = btoa(JSON.stringify(projects, null, 2));

            const body = {
                message: 'Update projects.json via admin panel',
                content: content
            };

            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/projects.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GH_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            return response.ok;
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            return false;
        }
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
            const { projects, sha } = await getProjectsFromGitHub();

            if (projectId) {
                // Update existing project
                const projectIndex = projects.findIndex(p => p.id === projectId);
                if (projectIndex !== -1) {
                    projects[projectIndex] = {
                        ...projects[projectIndex],
                        ...projectData,
                        updatedAt: new Date().toISOString(),
                    };
                }
            } else {
                // Create new project
                const newProject = {
                    id: generateId(),
                    ...projectData,
                    createdAt: new Date().toISOString(),
                };
                projects.push(newProject);
            }

            const success = await saveProjectsToGitHub(projects, sha);
            if (success) {
                hideProjectForm();
                loadAdminProjects();
                alert('Projekt erfolgreich gespeichert! Die Änderungen sind in 1-2 Minuten sichtbar.');
            } else {
                alert('Fehler beim Speichern des Projekts');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Fehler beim Speichern des Projekts');
        }
    }

    async function deleteProject(projectId) {
        if (!confirm('Sind Sie sicher, dass Sie dieses Projekt löschen möchten?')) {
            return;
        }

        try {
            const { projects, sha } = await getProjectsFromGitHub();
            const filteredProjects = projects.filter(p => p.id !== projectId);

            const success = await saveProjectsToGitHub(filteredProjects, sha);
            if (success) {
                loadAdminProjects();
                alert('Projekt erfolgreich gelöscht! Die Änderungen sind in 1-2 Minuten sichtbar.');
            } else {
                alert('Fehler beim Löschen des Projekts');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Fehler beim Löschen des Projekts');
        }
    }

    async function loadAdminProjects() {
        try {
            const { projects } = await getProjectsFromGitHub();
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

    // Helper Functions
    function generateId() {
        return 'project-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Global functions for button clicks
    window.editProject = function(projectId) {
        getProjectsFromGitHub().then(({ projects }) => {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                showProjectForm(project);
            }
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