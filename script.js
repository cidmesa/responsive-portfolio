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