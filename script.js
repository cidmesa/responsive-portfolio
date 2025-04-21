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
    
    // Ensure reCAPTCHA container exists
    const recaptchaContainer = document.querySelector('.g-recaptcha');
    if (!recaptchaContainer && contactForm) {
        console.log("Adding reCAPTCHA container");
        const newRecaptchaDiv = document.createElement('div');
        newRecaptchaDiv.className = 'g-recaptcha';
        newRecaptchaDiv.setAttribute('data-sitekey', '6LfoXB8rAAAAANJrB4Np5-MDP89Bigs6JmKPfC_n');
        
        // Insert it before the submit status div
        const statusElement = document.getElementById('submit-status');
        if (statusElement && statusElement.parentNode) {
            statusElement.parentNode.insertBefore(newRecaptchaDiv, statusElement);
        } else {
            // Add before submit button as fallback
            submitBtn.parentNode.insertBefore(newRecaptchaDiv, submitBtn);
        }
    }
    
    // Track submission attempts
    let submissionCount = parseInt(localStorage.getItem('submissionCount') || '0');
    const lastSubmissionTime = localStorage.getItem('lastSubmissionTime');
    const submissionTimeLimit = 60000; // 1 minute in milliseconds
    
    // Check if user has submitted recently
    if (lastSubmissionTime && Date.now() - parseInt(lastSubmissionTime) < submissionTimeLimit) {
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
        // Important: Add hidden fields directly to the form for Formspree
        // This ensures these fields are always sent regardless of JS execution
        if (!contactForm.querySelector('input[name="_cc"]')) {
            // Add hidden field to enable email receipt (CC approach)
            const ccField = document.createElement('input');
            ccField.type = 'hidden';
            ccField.name = '_cc';
            ccField.id = 'form-cc-field';
            contactForm.appendChild(ccField);
        }
        
        if (!contactForm.querySelector('input[name="_autoresponse"]')) {
            // Add hidden field for autoresponse message
            const autoResponseField = document.createElement('input');
            autoResponseField.type = 'hidden';
            autoResponseField.name = '_autoresponse';
            autoResponseField.value = "Thank you for contacting me. I've received your message and will get back to you soon. - Chriz Ian";
            contactForm.appendChild(autoResponseField);
        }
        
        if (!contactForm.querySelector('input[name="_subject"]')) {
            // Add hidden field for email subject
            const subjectField = document.createElement('input');
            subjectField.type = 'hidden';
            subjectField.name = '_subject';
            subjectField.value = "Thank you for contacting Ian Mesa";
            contactForm.appendChild(subjectField);
        }
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Update the CC field with the user's email before submission
            const userEmail = contactForm.querySelector('input[name="email"]').value;
            const ccField = document.getElementById('form-cc-field');
            if (ccField) {
                ccField.value = userEmail;
            }
            
            // Validate reCAPTCHA
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
            if (lastSubmissionTime && Date.now() - parseInt(lastSubmissionTime) < submissionTimeLimit) {
                statusDiv.textContent = 'Please wait before submitting again';
                statusDiv.className = 'submit-status error';
                statusDiv.style.display = 'block';
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
                    localStorage.setItem('submissionCount', submissionCount.toString());
                    
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