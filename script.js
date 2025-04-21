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

document.addEventListener("DOMContentLoaded", function() {
    // Add reCAPTCHA script
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js';
    recaptchaScript.async = true;
    recaptchaScript.defer = true;
    document.head.appendChild(recaptchaScript);
    
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('submit-status');
    
    // Track submission attempts
    let submissionCount = 0;
    const lastSubmissionTime = localStorage.getItem('lastSubmissionTime');
    const submissionTimeLimit = 60000; // 1 minute in milliseconds
    
    // Check if user has submitted recently
    if (lastSubmissionTime && Date.now() - lastSubmissionTime < submissionTimeLimit) {
        const waitTime = Math.ceil((parseInt(lastSubmissionTime) + submissionTimeLimit - Date.now()) / 1000);
        statusDiv.textContent = `Please wait ${waitTime} seconds before submitting again.`;
        statusDiv.className = 'submit-status error';
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
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                statusDiv.textContent = 'Please complete the captcha';
                statusDiv.className = 'submit-status error';
                return;
            }
            
            // Check submission frequency
            if (Date.now() - lastSubmissionTime < submissionTimeLimit) {
                statusDiv.textContent = 'Please wait before submitting again';
                statusDiv.className = 'submit-status error';
                return;
            }
            
            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled');
            submitBtn.textContent = 'Sending...';
            
            // Prepare form data with reCAPTCHA
            const formData = new FormData(contactForm);
            formData.append('g-recaptcha-response', recaptchaResponse);
            
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
                    statusDiv.textContent = 'Message sent successfully!';
                    statusDiv.className = 'submit-status success';
                    contactForm.reset();
                    grecaptcha.reset();
                    
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
                grecaptcha.reset();
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