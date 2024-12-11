// navigation.js

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.content');

// Event listener for each navigation item
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');

        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show the active page
        const activePage = document.getElementById(`${target}-page`);
        activePage.classList.add('active');

        // Show or hide the search bar container based on the target
        if (target === 'home') {
            document.getElementById('search-bar-container').style.display = 'block';

            // Run homeload.js when the homepage is opened
            runHomeLoadScript();
        } else {
            document.getElementById('search-bar-container').style.display = 'none';
        }

        // Toggle active class for navigation items
        navItems.forEach(nav => {
            nav.classList.remove('active');
            nav.querySelector('img').classList.remove('clicked');
        });
        item.classList.add('active');
        item.querySelector('img').classList.add('clicked');
    });
});

// Function to load and run homeload.js script every time the homepage is opened
const runHomeLoadScript = () => {
    // Dynamically load and execute homeload.js
    const script = document.createElement('script');
    script.src = 'js/homeload.js';
    script.onload = () => {
        console.log('homeload.js has been reloaded and executed!');
    };
    script.onerror = () => {
        console.error('Failed to load homeload.js');
    };
    
    // Append the script to the document to execute it
    document.body.appendChild(script);
};
