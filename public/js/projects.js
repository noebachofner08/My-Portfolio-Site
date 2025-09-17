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

    // Back Button
    const backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // Load Projects
    loadProjects();

    async function loadProjects() {
        try {
            const response = await fetch('/.netlify/functions/projects');
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Projekte');
            }

            const projects = await response.json();
            displayProjects(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            document.getElementById('projects-grid').innerHTML =
                '<div class="error-message">Fehler beim Laden der Projekte. Bitte versuchen Sie es später erneut.</div>';
        }
    }

    function displayProjects(projects) {
        const grid = document.getElementById('projects-grid');

        if (projects.length === 0) {
            grid.innerHTML = '<div class="loading">Noch keine Projekte vorhanden.</div>';
            return;
        }

        grid.innerHTML = projects.map(project => `
            <div class="project-card fade-in">
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
            </div>
        `).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Page Animation
    body.classList.add('fade-in');
});