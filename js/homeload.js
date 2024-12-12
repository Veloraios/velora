let repoData = null; // Store fetched data globally

// Function to load data from a given source URL
const fetchData = async (sourceURL) => {
    try {
        if (repoData) {
            // If data is already loaded, return the cached data
            console.log('Using cached repo data');
            return repoData;
        }

        const response = await fetch(sourceURL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Fetched data:', data); // Debugging to verify fetched data
        repoData = data; // Store data in global variable
        return data;
    } catch (error) {
        console.error('Error fetching repo data:', error);
        return null; // Return null if there is an error
    }
};

// Load apps from the repo data
const loadApps = async (repoData, searchTerm = '') => {
    const appContainer = document.getElementById('home-page');
    appContainer.innerHTML = '<p style="color: gray;">Loading...</p>';
    const apps = repoData?.apps || [];
    appContainer.innerHTML = ''; // Clear previous apps

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    filteredApps.forEach(app => {
        const button = createButton(app);
        appContainer.appendChild(button);
    });

    if (filteredApps.length === 0) {
        appContainer.innerHTML = '<p style="color: gray;">No apps found.<br>Request an App/Update in Settings</p>';
    }
};

// Helper function to create an app button
const createButton = (app) => {
    const button = document.createElement('button');
    button.classList.add('app-button');
    button.setAttribute('data-app-name', app.name.trim());

    const icon = document.createElement('img');
    icon.src = app.iconURL;
    icon.classList.add('icon');

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info');

    const appName = document.createElement('span');
    appName.innerText = app.name.trim();
    appName.classList.add('app-name');

    // Display the version instead of the description
    const appVersion = document.createElement('span');
    appVersion.innerText = `Version: ${app.version || 'Unknown'}`; // Handle missing version
    appVersion.classList.add('app-description'); // Add version-specific class

    infoContainer.appendChild(appName);
    infoContainer.appendChild(appVersion);  // Append version to the info container
    button.appendChild(icon);

    const rightArrow = document.createElement('img');
    rightArrow.src = 'images/home/chevron.png'; // Arrow image
    rightArrow.classList.add('right-arrow');

    button.appendChild(infoContainer);
    button.appendChild(rightArrow);

    button.onclick = () => openModal(app);

    return button;
};

// Open modal to display app details with versions
const openModal = (app) => {
    const versionDate = app.versionDate ? `Version Date: ${app.versionDate}` : 'Version Date: Unknown';
    
    // Fallback if description or subtitle is missing
    const description = app.localizedDescription || 'No description available';
    const subtitle = app.subtitle || 'No subtitle available';  // Check if subtitle exists

    let modalHtml = `
<div id="modal" style="left: 0; display: block; width: 100vw; height: 100vh; background-color: #131416; position: fixed; top: 0; z-index: 1000000000000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease;">
    <div style="position: relative; width: 100%; height: 100%; overflow-x: hidden;">
        <div class="image-wrapper" style="width: 100%; bottom-border: #ffffff40 1px solid; height: 200px; background-image: url('${app.iconURL}'); background-size: 3500% 3500%; background-position: bottom right; top: -48px; position: absolute; background-repeat: no-repeat;">
        </div>
        <img src="images/home/chevron_left.png" style="width: 40px; height: 40px; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3)); position: absolute; top: 40px; left: 15px; display: block;" id="back">
        
        <img src="${app.iconURL}" alt="${app.name}" style="width: 70px; left: 15px; border-radius: 15px; position: absolute; display: block; top: 150px; height: 70px; margin-top: 20px;">
        <img src="images/home/arrow_down_doc_fill.png" style="top: 167.5px; position: absolute; margin-top: 20px; width: 30px; height: 30px; display: block; right: 25px;" onclick="document.getElementById('ipaBG').style.visibility='visible'; document.getElementById('ipaBG').style.opacity='1'; document.getElementById('ipaBG').style.transition='opacity 0.3s ease';">
        
        <p style="top: 175px; position: absolute; left: 100px; font-size: 18.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 140px);"> ${app.name}</p>
        <p style="top: 200px; position: absolute; left: 100px; font-size: 15.5px; font-family: 'apple'; opacity: 50%; max-width: calc(100% - 90px); word-wrap: break-word; white-space: normal;"> ${subtitle}</p>
        
        <button style="background-image: url('${app.iconURL}'); background-size: 3500% 3500%; background-position: bottom right; height: 25px; width: 60px; position: absolute; display: block; margin-top: 20px; top: 170px; right: 50px; color: white; font-weight: 1; font-size: 16px; text-align: center;">
            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));">SIGN</span>
        </button>

     <div id="ipaBG" style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 2; position: fixed; top: 0; left: 0; visibility: hidden; opacity: 0; transition: opacity 0.3s ease;" onclick="if(event.target === this) { this.style.opacity='0'; setTimeout(() => { this.style.visibility='hidden'; }, 300); }">
    <div style="background-color: rgba(28, 28, 28, 0.65); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); height: 120px; width: 240px; position: absolute; display: block; top: 190px; right: 55px; border-radius: 15px; font-size: 16px; color: white;  z-index: 3;">
    <div style="top: 50%; transform: translateY(-50%); position: absolute; height: 1px; width: 100%; background-color: #ffffff40;"></div>
       
    <div style="background: transparent; width: 100%; height: 58px; position: absolute; top: 0; left: 0;" onclick="window.location.href='${app.downloadURL}';">  
    <img src="images/home/arrow_down_doc_fill.png" style="width: 30px; height: 30px; left: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
      <img src="images/home/chevron.png" style="width: 20px; height: 20px; opacity: 50%; right: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
   
    <h1 style="left: 45px; position: absolute; color: white; font-size: 15px; font-weight: 1; top: 16px;">Install .ipa</h1>
        <h1 style="left: 45px; position: absolute; color: white; opacity: 50%; font-family: 'apple', sans-serif; font-size: 14.5px; font-weight: 1; top: 30px;">Install .ipa In Web Browser</h1>
     </div>  
     
       <div style="background: transparent; width: 100%; height: 58px; position: absolute; bottom: 0; left: 0;">  
    <img src="images/home/arrow_up_doc_fill.png" style="width: 30px; height: 30px; left: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
      <img src="images/home/chevron.png" style="width: 20px; height: 20px; opacity: 50%; right: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
   
    <h1 style="left: 45px; position: absolute; color: white; font-size: 15px; font-weight: 1; top: 16px;">Import to...</h1>
        <h1 style="left: 45px; position: absolute; color: white; opacity: 50%; font-family: 'apple', sans-serif; font-size: 14.5px; font-weight: 1; top: 30px;">Import .ipa To Other Apps</h1>
     </div>  
    </div>
</div>
</div>



    `;

    // Add versions to the modal
    if (app.versions && app.versions.length > 0) {
        modalHtml += '<div style="color: white; margin-top: 20px;">';
        app.versions.forEach((version, index) => {
            modalHtml += `
             
            `;
        });
        modalHtml += '</div>';
    } else {
        modalHtml += '<p>No versions available.</p>';
    }

    modalHtml += `
            </div>
        </div>
    `;

    // Insert modal HTML into the DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('modal');

    modal.style.visibility = 'visible';
    setTimeout(() => {
        modal.style.opacity = '1'; 
    }, 10);

    // Disable body scrolling when modal is open
    document.body.style.overflow = 'hidden'; 
    const appContainer = document.getElementById('home-page');
    appContainer.style.overflow = 'hidden'; 

    // Set up the back button to close the modal
    document.getElementById('back').onclick = closeModal; 
};

// Close modal
const closeModal = () => {
    const modal = document.getElementById('modal');
    modal.style.opacity = '0'; 
    setTimeout(() => {
        modal.style.visibility = 'hidden'; 
        modal.remove(); 
    }, 300); 

    // Re-enable body scrolling after modal is closed
    document.body.style.overflow = 'auto'; 

    const appContainer = document.getElementById('home-page');
    appContainer.style.overflow = 'auto'; 
};

// Convert size from bytes to MB
const bytesToMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2); // Convert bytes to MB and limit to 2 decimal places
};

// Setup search functionality
const setupSearch = async () => {
    const searchBar = document.getElementById('search-bar');
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.classList.add('search-results');

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);
    document.body.appendChild(resultsContainer);

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        resultsContainer.innerHTML = ''; 

        if (searchTerm) {
            const filteredApps = repoData.apps.filter(app => app.name.toLowerCase().includes(searchTerm));

            if (filteredApps.length > 0) {
                overlay.style.display = 'block'; 
                resultsContainer.style.display = 'block'; 
                document.body.classList.add('no-scroll'); 

                filteredApps.forEach(app => {
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('result-item');

                    const icon = document.createElement('img');
                    icon.src = app.iconURL;
                    icon.classList.add('result-icon');

                    const resultInfo = document.createElement('div');
                    resultInfo.classList.add('result-info');

                    const appName = document.createElement('span');
                    appName.innerText = app.name;
                    resultInfo.appendChild(appName);
                    resultItem.appendChild(icon);
                    resultItem.appendChild(resultInfo);

                    resultItem.onclick = () => openModal(app);
                    resultsContainer.appendChild(resultItem);
                });
            } else {
                resultsContainer.innerHTML = '<p>No results found</p>';
            }
        } else {
            overlay.style.display = 'none'; 
            resultsContainer.style.display = 'none'; 
            document.body.classList.remove('no-scroll'); 
        }
    });
};

// Initialize on page load
window.onload = async () => {
    const repoData = await fetchData('https://wuxu1.github.io/wuxu-complete-plus.json');
    if (repoData) {
        loadApps(repoData);
        setupSearch();
    }
};
