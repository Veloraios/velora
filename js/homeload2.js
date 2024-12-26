// Check if screenshotURLs array exists and is not empty
if (Array.isArray(app.screenshotURLs) && app.screenshotURLs.length > 0) {
    // Create the screenshot HTML content
    const screenshotHTML = `
    <div style="display: flex; flex-direction: row; flex-wrap: nowrap; overflow-x: auto; margin-top: 20px; padding-left: 5px; padding-right: 5px;">
        ${app.screenshotURLs.map(url =>
            `<img src="${url}" alt="Screenshot" style="max-width: 100%; object-fit: contain; height: auto; max-height: 400px; margin-right: 10px; border-radius: 10px;" onclick=" 
                var modal = document.createElement('div');
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                modal.style.display = 'flex';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
                modal.style.zIndex = '100000000099';
                modal.style.opacity = '0'; // Start with hidden modal
                modal.style.transition = 'opacity 0.3s ease-in-out'; // Fade-in transition
                
                setTimeout(function() {
                    modal.style.opacity = '1'; // Fade in after a short delay
                }, 0);

                var img = document.createElement('img');
                img.src = '${url}';
                img.style.maxWidth = '90%';
                img.style.maxHeight = '90%';
                img.style.objectFit = 'contain';
                img.style.margin = 'auto';
                img.style.borderRadius = '15px';
                
                var closeBtn = document.createElement('img');
                closeBtn.src = 'https://icon-library.com/images/cancel-icon-transparent/cancel-icon-transparent-3.jpg'; // Use the image for the close button
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '40px';
                closeBtn.style.right = '20px';
                closeBtn.style.width = '30px'; // Adjust size of the close button image if needed
                closeBtn.style.height = '30px'; // Adjust height if needed
                closeBtn.style.cursor = 'pointer';
                closeBtn.onclick = function() { 
                    modal.style.opacity = '0'; // Fade out before removing
                    setTimeout(function() {
                        document.body.removeChild(modal);
                    }, 300); // Wait for fade-out animation before removing the modal
                };
                
                modal.appendChild(closeBtn);
                modal.appendChild(img);
                document.body.appendChild(modal);
            ">`
        ).join('')}
    </div>
    `;

    // Ensure modalHTML contains the div with id "ss" that is empty
    if (modalHTML.includes('<div id="ss"> </div>')) {
        // Insert the screenshotHTML into the modalHTML string inside the div with id "ss"
        modalHTML = modalHTML.replace(
            /(<div id="ss">)(.*?)(<\/div>)/, 
            `$1${screenshotHTML}$3`
        );
    } else {
        console.error('The modalHTML string does not contain the element with id="ss"');
    }
}
