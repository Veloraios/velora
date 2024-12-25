document.addEventListener('DOMContentLoaded', () => {
    // Get all buttons and content divs
    const buttons = document.querySelectorAll('.nav-button');
    const contentDivs = document.querySelectorAll('.content-div');

    // Function to handle button click and switch content
    function handleButtonClick(event) {
        const targetSection = event.target.closest('.nav-button').getAttribute('data-section');

        // Remove active class from all buttons (only inside #navButtonParadise)
        if (event.target.closest('#navButtonParadise')) {
            buttons.forEach(button => {
                button.style.backgroundColor = ''; // Remove the grey background
            });
            event.target.closest('.nav-button').style.backgroundColor = 'rgba(150, 150, 150, 0.25)'; // Add transparent grey background
        }

        // Hide all content divs
        contentDivs.forEach(div => {
            div.style.display = 'none';
            div.style.opacity = '0';
        });

        // Show the corresponding content div based on target
        const targetContentDiv = document.getElementById(targetSection);
        if (targetContentDiv) {
            targetContentDiv.style.display = 'block';
            setTimeout(() => {
                targetContentDiv.style.opacity = '1';
            }, 10);
        } else {
            console.error(`No content div found for target: ${targetSection}`);
        }
    }

    // Add event listeners for each button
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    // Optional: Initialize the first button and div as active by default
    const firstButton = document.querySelector('.nav-button');
    firstButton.style.backgroundColor = 'rgba(150, 150, 150, 0.25)';
    const firstDiv = document.querySelector('.content-div');
    firstDiv.style.display = 'block';
    firstDiv.style.opacity = '1';
});
