const menuIcon = document.querySelector('#menu-icon');
const navLinks = document.querySelector('.nav-links');

menuIcon.onclick = () =>{
    navLinks.classList.toggle('active')
}

// Add this to your script.js file

// Check for saved theme preference or use device preference
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const savedTheme = localStorage.getItem("theme");

// Set initial theme
if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
    document.documentElement.setAttribute("data-theme", "dark");
} else {
    document.documentElement.setAttribute("data-theme", "light");
}

// Theme toggle functionality
document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.querySelector(".theme-toggle");
    
    // Update toggle visual state on load
    updateToggleState();
    
    themeToggle.addEventListener("click", function() {
        // Toggle theme
        if (document.documentElement.getAttribute("data-theme") === "dark") {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
        
        // Update toggle visual state
        updateToggleState();
    });
    
    function updateToggleState() {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const toggleBall = document.querySelector(".toggle-ball");
        
        if (isDark) {
            toggleBall.style.transform = "translateX(30px)";
        } else {
            toggleBall.style.transform = "translateX(0)";
        }
    }
});


// Add this to your script.js file

// Enhanced script with proper reCAPTCHA handling and email receipt
document.addEventListener("DOMContentLoaded", function() {
    // Make sure the reCAPTCHA script is properly loaded
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js';
    recaptchaScript.async = true;
    recaptchaScript.defer = true;
    document.head.appendChild(recaptchaScript);
    
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('submit-status');
    
    // Ensure reCAPTCHA container exists
    const recaptchaContainer = document.querySelector('.g-recaptcha');
    if (!recaptchaContainer) {
        console.error("reCAPTCHA container not found!");
        
        // If the container doesn't exist, create it
        const newRecaptchaDiv = document.createElement('div');
        newRecaptchaDiv.className = 'g-recaptcha';
        newRecaptchaDiv.setAttribute('data-sitekey', '6LfoXB8rAAAAANJrB4Np5-MDP89Bigs6JmKPfC_n');
        
        // Insert it before the submit button
        if (submitBtn && submitBtn.parentNode) {
            submitBtn.parentNode.insertBefore(newRecaptchaDiv, submitBtn);
        }
    }
    
    // Track submission attempts
    let submissionCount = 0;
    const lastSubmissionTime = localStorage.getItem('lastSubmissionTime');
    const submissionTimeLimit = 60000; // 1 minute in milliseconds
    
    // Check if user has submitted recently
    if (lastSubmissionTime && Date.now() - lastSubmissionTime < submissionTimeLimit) {
        const waitTime = Math.ceil((parseInt(lastSubmissionTime) + submissionTimeLimit - Date.now()) / 1000);
        statusDiv.textContent = `Please wait ${waitTime} seconds before submitting again.`;
        statusDiv.className = 'submit-status error';
        statusDiv.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
        
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled');
            statusDiv.style.display = 'none';
        }, parseInt(lastSubmissionTime) + submissionTimeLimit - Date.now());
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate reCAPTCHA
            // Make sure grecaptcha object exists before trying to use it
            if (typeof grecaptcha === 'undefined' || !grecaptcha.getResponse) {
                statusDiv.textContent = 'reCAPTCHA has not loaded properly. Please refresh the page and try again.';
                statusDiv.className = 'submit-status error';
                statusDiv.style.display = 'block';
                return;
            }
            
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                statusDiv.textContent = 'Please complete the captcha';
                statusDiv.className = 'submit-status error';
                statusDiv.style.display = 'block';
                return;
            }
            
            // Check submission frequency
            if (lastSubmissionTime && Date.now() - lastSubmissionTime < submissionTimeLimit) {
                statusDiv.textContent = 'Please wait before submitting again';
                statusDiv.className = 'submit-status error';
                statusDiv.style.display = 'block';
                return;
            }
            
            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled');
            submitBtn.textContent = 'Sending...';
            
            // Get the user's email and name for receipt
            const userEmail = contactForm.querySelector('input[name="email"]').value;
            const userName = contactForm.querySelector('input[name="name"]').value;
            
            // Prepare form data with reCAPTCHA
            const formData = new FormData(contactForm);
            formData.append('g-recaptcha-response', recaptchaResponse);
            
            // Add Formspree fields for email receipt
            formData.append('_replyto', userEmail);
            formData.append('_subject', 'Thank you for contacting Ian Mesa');
            
            const autoresponseMessage = `
Hello ${userName},

Thank you for reaching out to me. I have received your message and will get back to you as soon as possible.

Best regards,
Chriz Ian Mesa
`;
            formData.append('_autoresponse', autoresponseMessage);
            
            // Send form data to Formspree
            fetch('https://formspree.io/f/xwplgkal', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    // Success
                    statusDiv.textContent = 'Message sent successfully! A confirmation email has been sent to your email address.';
                    statusDiv.className = 'submit-status success';
                    statusDiv.style.display = 'block';
                    contactForm.reset();
                    
                    // Reset grecaptcha if it exists
                    if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                        grecaptcha.reset();
                    }
                    
                    // Record submission time
                    localStorage.setItem('lastSubmissionTime', Date.now().toString());
                    submissionCount++;
                    
                    // If too many submissions, add longer delay
                    if (submissionCount > 3) {
                        submitBtn.disabled = true;
                        setTimeout(() => {
                            submitBtn.disabled = false;
                            submitBtn.classList.remove('disabled');
                        }, 120000); // 2 minutes
                    }
                } else {
                    // Error
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                statusDiv.textContent = 'Something went wrong. Please try again.';
                statusDiv.className = 'submit-status error';
                statusDiv.style.display = 'block';
                
                // Reset grecaptcha if it exists
                if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                    grecaptcha.reset();
                }
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.classList.remove('disabled');
                submitBtn.textContent = 'Submit';
                
                // Reset status message after 5 seconds
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 5000);
            });
        });
    }
});