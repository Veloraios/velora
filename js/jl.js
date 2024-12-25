document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch and parse the .mobileconfig file
    function fetchMobileConfig(filePath, button) {
        // Fetch the .mobileconfig file
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                // Parse the response as XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");

                // Initialize variables for Payload Identifier, Payload UUID, Payload Description, etc.
                let label = 'No Label Found';
                let payloadIdentifier = '';
                let payloadUUID = '';
                let payloadDescription = '';
                let iconBase64 = '';
                let url = '';

                // Fetch the necessary keys from the XML
                const keys = xmlDoc.getElementsByTagName('key');
                for (let i = 0; i < keys.length; i++) {
                    if (keys[i].textContent === 'Label' && keys[i].nextElementSibling) {
                        label = keys[i].nextElementSibling.textContent;
                    }
                    if (keys[i].textContent === 'PayloadIdentifier' && keys[i].nextElementSibling) {
                        payloadIdentifier = keys[i].nextElementSibling.textContent;
                    }
                    if (keys[i].textContent === 'PayloadUUID' && keys[i].nextElementSibling) {
                        payloadUUID = keys[i].nextElementSibling.textContent;
                    }
                    if (keys[i].textContent === 'PayloadDescription' && keys[i].nextElementSibling) {
                        payloadDescription = keys[i].nextElementSibling.textContent;
                    }
                    if (keys[i].textContent === 'Icon' && keys[i].nextElementSibling) {
                        iconBase64 = keys[i].nextElementSibling.textContent;
                    }
                    if (keys[i].textContent === 'URL' && keys[i].nextElementSibling) {
                        url = keys[i].nextElementSibling.textContent;
                    }
                }

                // Store the PayloadIdentifier and PayloadUUID for later use
                button.setAttribute('data-payload-identifier', payloadIdentifier);
                button.setAttribute('data-payload-uuid', payloadUUID);
                button.setAttribute('data-payload-description', payloadDescription);
                button.setAttribute('data-url', url); // Store the URL
                button.setAttribute('data-file', filePath); // Store the file path

                // Now update the button with the correct label and icon
                const labelElement = button.querySelector('.label');
                labelElement.textContent = label;

                // Update the icon if available
                const iconElement = button.querySelector('.icon');
                if (iconBase64) {
                    iconElement.src = `data:image/png;base64,${iconBase64}`;
                }

                // Replace placeholders in the button's innerHTML
                replacePlaceholders(button, { icon: iconBase64, label, url, file: filePath, id: payloadIdentifier });

                // Function to create and show the fullscreen div
                function showFullscreenDiv() {
                    const fullscreenDiv = document.createElement('div');
                    fullscreenDiv.style.position = 'fixed';
                    fullscreenDiv.style.top = '0';
                    fullscreenDiv.style.left = '0';
                    fullscreenDiv.style.width = '100%';
                    fullscreenDiv.style.height = '100%';
                    fullscreenDiv.style.backgroundColor = '#131416';
                    fullscreenDiv.style.zIndex = '9999999999999999999999999999999999999999999';
                    fullscreenDiv.style.color = 'white';
                    fullscreenDiv.style.overflow = 'auto';
                    fullscreenDiv.style.display = 'flex';
                    fullscreenDiv.style.flexDirection = 'column';

                    // Helper function to get the color of the middle pixel of the image
                    function getMiddlePixelColor(img) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Set canvas size to image size
                        canvas.width = img.width;
                        canvas.height = img.height;
                        
                        // Draw image on canvas
                        ctx.drawImage(img, 0, 0);
                        
                        // Calculate the middle pixel coordinates
                        const middleX = Math.floor(img.width / 2);
                        const middleY = Math.floor(img.height / 2);
                        
                        // Get pixel data of the middle pixel
                        const pixel = ctx.getImageData(middleX, middleY, 1, 1).data;
                        
                        // Return the color of the middle pixel as an HTML color string
                        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`; // RGB format
                    }

                    // Create close button
                    const closeButton = `
                        <img src="images/home/chevron_left.png" alt="Close" 
                            style="position: absolute; top: 20px; left: 20px; z-index: 21; cursor: pointer; width: 30px; height: 30px; filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.3));" />
                    `;

                    fullscreenDiv.innerHTML = closeButton;
                    fullscreenDiv.innerHTML += `
                        <div style="position: relative; width: 100%; height: 200px; ">
                            <div style="width: 100%; height: 100%;  position: absolute; display: flex; background-repeat: no-repeat; background-image: none;" id="imageWrapper">
                               <div style="overflow-x: hidden;">
                            <img src="data:image/png;base64,${iconBase64}" style="top: 210px; position: absolute; width: 90px; height: 90px; border-radius: 15px; left: 10px;" id="iconImage">
                                <h1 style="top: 220px; position: absolute; left: 110px; font-size: 18px; font-weight: 1;">[label]</h1>
                                <h1 style="top: 245px; position: absolute; left: 110px; font-size: 16px; font-family: 'apple', sans-serif; opacity: 50%;">[id]</h1>
                                <a href="[file]">
                                    <button style="background-image: none; height: 25px; width: 60px; position: absolute; display: block; margin-top: 20px; top: 210px; right: 20px; color: white; font-weight: 1; font-size: 16px; text-align: center;" id="signButton">
                                        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));">GET</span>
                                    </button>
                                </a>
                             <div style="position: absolute; top: 310px; left: 10px; text-align: left; font-size: 16px; opacity: 80%; font-family: 'apple', sans-serif;" id="des">
                            [des]<br><br>
                            

                            <br><span>More Info:<br><br>UUID: [uuid] <br> File Path: <a style="color: lightblue;" href="${filePath}"> Hold to Copy/Open/Share Tweak</a></span>
                            </div>

                            </div>
                        </div>
                        </div>
                    `;

                    // Replace placeholders with actual values
                    fullscreenDiv.innerHTML = fullscreenDiv.innerHTML
                        .replace('[id]', payloadIdentifier)
                        .replace('[label]', label)
                        .replace('[uuid]', payloadUUID)
                        .replace('[des]', payloadDescription)
                        .replace('[url]', url)
                        .replace('[file]', filePath)
                        .replace('[icon]', `data:image/png;base64,${iconBase64}`);

                    // Wait for the image to load before extracting the color
                    const iconImage = fullscreenDiv.querySelector('#iconImage');

                    iconImage.onload = () => {
                        // Get the middle pixel color from the image
                        const bgColor = getMiddlePixelColor(iconImage);
                        
                        // Apply the color to the image wrapper div (remove background-image, set background color)
                        const imageWrapper = fullscreenDiv.querySelector('#imageWrapper');
                        imageWrapper.style.backgroundColor = bgColor; // Set the background color to the middle pixel's color
                        imageWrapper.style.backgroundImage = 'none';  // Ensure no background image is set
                        
                        // Apply the same color to the SIGN button background
                        const signButton = fullscreenDiv.querySelector('#signButton');
                        signButton.style.backgroundColor = bgColor; // Set SIGN button background color to the middle pixel's color
                    };

                    // Event listener for close button
                    fullscreenDiv.querySelector('img').addEventListener('click', () => {
                        fullscreenDiv.remove();
                    });

                    // Append to body
                    document.body.appendChild(fullscreenDiv);
                }

                // Attach the event listener to the button
                button.addEventListener('click', (e) => {
                    showFullscreenDiv();
                });

            })
            .catch(error => console.error('Error fetching mobileconfig file:', error));
    }

    function replacePlaceholders(element, { icon, label, url, file, id }) {
        // Replace [icon] with the actual icon in the element's src or background-image
        if (element.querySelector('img')) {
            const imgElement = element.querySelector('img');
            imgElement.src = imgElement.src.replace('[icon]', `data:image/png;base64,${icon}`);
        }

        if (element.style.backgroundImage) {
            element.style.backgroundImage = element.style.backgroundImage.replace('[icon]', `url(data:image/png;base64,${icon})`);
        }

        // Replace [url] in anchor tags or any text elements
        const urlElements = element.querySelectorAll('[href]');
        urlElements.forEach(el => {
            el.href = el.href.replace('[url]', url);
        });

        // Replace [label] in text content
        const textElements = element.querySelectorAll('*');
        textElements.forEach(el => {
            if (el.textContent.includes('[label]')) {
                el.textContent = el.textContent.replace('[label]', label);
            }
        });

        // Replace [file] in any text content
        const fileElements = element.querySelectorAll('*');
        fileElements.forEach(el => {
            if (el.textContent.includes('[file]')) {
                el.textContent = el.textContent.replace('[file]', file);
            }
        });

        // Replace [id] in any text content
        const idElements = element.querySelectorAll('*');
        idElements.forEach(el => {
            if (el.textContent.includes('[id]')) {
                el.textContent = el.textContent.replace('[id]', id);
            }
        });

        // Replace placeholders in the button's innerHTML (if they exist in the button's HTML)
        if (element.innerHTML) {
            element.innerHTML = element.innerHTML
                .replace('[icon]', `data:image/png;base64,${icon}`)
                .replace('[label]', label)
                .replace('[url]', url)
                .replace('[file]', file)
                .replace('[id]', id);
        }
    }

    const mobileConfigFiles = [
        'tweaks/jblaunchers/iOS 13.1++.mobileconfig',
        'tweaks/jblaunchers/iOS 13.2++.mobileconfig',
        'tweaks/jblaunchers/iOS 13.3++.mobileconfig',
        'tweaks/jblaunchers/iOS 13.4++.mobileconfig',
        'tweaks/jblaunchers/iOS 13.5.1++.mobileconfig',
        'tweaks/jblaunchers/iOS 13.6++.mobileconfig',
        'tweaks/jblaunchers/iOS 13.7++.mobileconfig',
        'tweaks/jblaunchers/iOS 13++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.1++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.2++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.3++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.4++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.5.1++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.5++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.6++.mobileconfig',
        'tweaks/jblaunchers/iOS 14.7++.mobileconfig',
        'tweaks/jblaunchers/iOS 14++.mobileconfig',
        'tweaks/jblaunchers/iOS 15.1.1++.mobileconfig',
        'tweaks/jblaunchers/iOS 15.2++.mobileconfig',
        'tweaks/jblaunchers/iOS 15.3++.mobileconfig',
        'tweaks/jblaunchers/iOS 15++.mobileconfig'
       
       
    ];

    function createMobileConfigButtons() {
        const virtualJailbreaksDiv = document.getElementById('jb-launchers');
        
        mobileConfigFiles.forEach((filePath, index) => {
            const button = document.createElement('button');
            button.classList.add('nav-button');
            button.setAttribute('data-section', 'jb-launchers');
            button.innerHTML = `
                <img class="icon" src="[icon]" alt="Icon" style="width: 80px; height: 80px; border-radius: 15px; margin-left: 0px;">
                <p class="label" style="position: absolute; left: 100px; top: 20px; color: white; font-weight: 1; font-size: 16px;">Loading...</p>
                <p class="label" style="position: absolute; left: 100px; top: 40px; color: white; font-family: 'apple', sans-serif; opacity: 50%; font-size: 13px;">[id]</p>
                <img class="chevron" src="images/home/chevron.png" alt="Chevron" style="position: absolute; right: 10px; width: 30px; top: 50%; transform: translateY(-50%); height: 30px; opacity: 0.5; pointer-events: none;">
            `;
            // Attach file fetch to each button
            fetchMobileConfig(filePath, button);

            // Append the created button to the virtual-jailbreaks div
            virtualJailbreaksDiv.appendChild(button);
        });
    }

    // Initialize the buttons after the DOM has fully loaded
    createMobileConfigButtons();
});
