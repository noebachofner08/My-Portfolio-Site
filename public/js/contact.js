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

    // EmailJS Konfiguration
    // WICHTIG: Ersetzen Sie diese Werte mit Ihren eigenen EmailJS-Daten
    const EMAILJS_SERVICE_ID = 'service_aikor1v';
    const EMAILJS_TEMPLATE_ID = 'template_479bro7';
    const EMAILJS_PUBLIC_KEY = 'm1azVOeFwpN09U08Z';

    // EmailJS initialisieren
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            from_name: document.getElementById('name').value,
            from_email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            to_name: 'Noé Bachofner', // Ihr Name
        };

        // Disable submit button
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';

        try {
            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                formData
            );

            // Success
            formMessage.className = 'success-message';
            formMessage.textContent = 'Vielen Dank für Ihre Nachricht! Ich werde mich bald bei Ihnen melden.';
            formMessage.style.display = 'block';
            contactForm.reset();
            
            console.log('Email sent successfully:', response);
        } catch (error) {
            // Error
            console.error('Error sending email:', error);
            formMessage.className = 'error-message';
            formMessage.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie mich direkt per E-Mail.';
            formMessage.style.display = 'block';
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });

    // Page Animation
    body.classList.add('fade-in');
});
