document.addEventListener('DOMContentLoaded', function() {
    // Theme Management
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Load saved theme or default to light
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

    // Projects Button
    const projectsBtn = document.getElementById('projects-btn');
    projectsBtn.addEventListener('click', function() {
        window.location.href = 'projects.html';
    });

    // Contact Button
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            window.location.href = 'contact.html';
        });
    }

    // Page Animation
    body.classList.add('fade-in');
});
