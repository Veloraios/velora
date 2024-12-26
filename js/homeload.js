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

    // Check if the version exists; if not, fallback to the latest version from the versions array
    const latestVersion = app.versions && app.versions.length > 0
        ? app.versions.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date) ? current : latest;
        }).version
        : 'Unknown'; // Default if no versions are available
    
    appVersion.innerText = `Version: ${app.version || latestVersion}`; // Display either the app version or the latest version
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

const openModal = (app) => {
    const versionDate = app.versionDate 
    ? `Version Date: ${app.versionDate}` 
    : (app.versions && app.versions.length > 0 
        ? `Version Date: ${app.versions.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date) ? current : latest;
        }).date}` 
        : 'Version Date: Unknown');

    // Fallback if description or subtitle is missing
    const description = app.localizedDescription || app.description || 'No description available';
    const subtitle = app.subtitle || 'No subtitle available';
    
    

    // Find the latest version if no version exists
    let version = app.version || 'Unknown version';
    if (version === 'Unknown version' && app.versions && app.versions.length > 0) {
        const latestVersion = app.versions.reduce((latest, current) => {
            return (current.version > latest.version) ? current : latest;
        });
        version = latestVersion.version;
    }

    // Fallback for downloadURL if missing
    const downloadURL = app.downloadURL || (app.versions && app.versions.length > 0 
        ? app.versions[0].downloadURL  // Using the first version as fallback for download URL
        : 'No download URL available');

    console.log(versionDate);
    console.log(description);
    console.log(subtitle);
    console.log(version);
    console.log(downloadURL);

    // Function to format the date to a human-readable string (e.g., "December 14, 2024")
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }
  
 // Add the latestVersionDate property to the app object
app.latestVersionDate = (() => {
    // Extract the latest version's date (based on the most recent date)
    const latestVersion = app.versions && app.versions.length > 0
      ? app.versions.reduce((latest, current) => {
          return new Date(current.date) > new Date(latest.date) ? current : latest;
        }, app.versions[0])
      : null;
  
    // If the latest version date is defined, format and return it
    if (latestVersion && latestVersion.date) {
      return formatDate(latestVersion.date);
    } else if (app.versionDate) {
      // Fallback to app.versionDate if latestVersion date is undefined
      return formatDate(app.versionDate);
    } else if (app.fullDate) {
      // If both versionDate and fullDate are defined, return fullDate
      return formatDate(app.fullDate);
    } else {
      // If none are defined, return a default message
      return "Date not defined";
    }
  })();

  // Add the formattedBundle property to the app object
app.formattedBundle = (() => {
    // Check for each property in order and return the first defined one
    const bundle = app.bundleIdentifier || app.bundleID;
  
    // If a bundle is found, return it, otherwise return the fallback message
    return bundle || "undefined bundle id";
  })();

 





  
  
  // Now you can use app.latestVersionDate wherever you need to display the latest version date
  console.log("Latest version date:", app.latestVersionDate); // This will output something like "October 9, 2024"
  

   // Function to convert size from bytes to MB
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`; // For sizes less than 1 KB
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`; // For sizes less than 1 MB
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`; // Convert to MB
  }
  
 // Assuming `app` is your app object, add the latestSize property to the app object
app.latestSize = (() => {
    // Extract the latest version's size
    const latestVersion = app.versions && app.versions.length > 0
      ? app.versions.reduce((latest, current) => {
          return new Date(current.date) > new Date(latest.date) ? current : latest;
        }, app.versions[0])
      : null;
  
    // If there's a latest version and its size is defined, format and return the size
    if (latestVersion && latestVersion.size) {
      return formatSize(latestVersion.size);
    } else if (app.size) {
      // Fallback to app.size if latestVersion size is undefined
      return formatSize(app.size);
    } else {
      // If neither is defined, return a default message
      return "Size not defined";
    }
  })();
  
  
  // Now you can use `app.latestSize` wherever needed
  const formattedDescription = description
    .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold;">$1</span>')  // Bold replacement
    .replace(/\n/g, '<br>')  // Newline replacement
    .replace('${app.latestSize}', app.latestSize);  // Insert the latest size in the description
  
  console.log(formattedDescription); // Example output showing formatted size
  
      

    const finalDownloadURL = app.downloadURL || 
        (app.versions && app.versions.length > 0 ? 
            app.versions.reduce((latest, version) => new Date(version.date) > new Date(latest.date) ? version : latest, app.versions[0]).downloadURL 
            : null);

    let modalHtml = `
      <div id="modal" style="left: 0; display: block; width: 100vw; height: 100vh; background-color: #131416; position: fixed; top: 0; z-index: 1000000000000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease;">
        <div style="position: relative; width: 100%; height: 100%; overflow-x: hidden; overflow-y: auto; flex-direction: column; padding-top: 200px; padding-bottom: 20px; box-sizing: border-box;">
            
            <!-- Image Wrapper (App Icon) -->
            <div class="image-wrapper" style="width: 100%; height: 200px; background-image: url('${app.iconURL}'); background-size: 3500% 3500%; background-position: bottom right; top: -48px; position: absolute; background-repeat: no-repeat;"></div>

            <!-- Back Button -->
            <img src="images/home/chevron_left.png" style="width: 35px; height: 35px; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3)); position: absolute; top: 40px; left: 15px; display: block;" id="back">

            <!-- App Icon -->
            <img src="${app.iconURL}" alt="${app.name}" style="width: 70px; left: 15px; border-radius: 15px; position: absolute; display: block; top: 150px; height: 70px; margin-top: 20px;">

            <!-- Arrow Down Icon (for showing IPA BG) -->
            <img src="images/home/ellipsis.png" style="top: 40px; position: absolute; filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3)); width: 30px; height: 30px; display: block; right: 30px;" onclick="document.getElementById('ipaBG').style.visibility='visible'; document.getElementById('ipaBG').style.opacity='1'; document.getElementById('ipaBG').style.transition='opacity 0.3s ease';">

            <!-- App Name -->
            <p style="top: 175px; position: absolute; left: 100px; font-size: 18.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 140px); max-width: calc(100% - 190px);"> ${app.name}</p>

            <!-- Subtitle -->
            <p style="top: 200px; position: absolute; left: 100px; font-size: 15.5px; font-family: 'apple'; opacity: 50%; max-width: calc(100% - 190px); word-wrap: break-word; white-space: normal;"> ${subtitle}</p>

            <!-- Sign Button -->
            <button style="background-image: url('${app.iconURL}'); background-size: 3500% 3500%; background-position: bottom right; height: 25px; width: 60px; position: absolute; display: block; margin-top: 20px; top: 170px; right: 20px; color: white; font-weight: 1; font-size: 16px; text-align: center;">
                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));">SIGN</span>
            </button>

 <div style="display: flex; overflow-x: auto; overflow-y: hidden; flex-direction: row; margin-top: 70px; background: transparent; border-top: #ffffff40 1px solid; border-bottom: #ffffff40 1px solid; height: 85px; padding-left: 5px; padding-right: 5px;">
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 85px; min-width: 140px; background: transparent; position: relative;">
        <h1 style="color: white; font-size: 16px; font-weight: 1;">Bundle ID</h1>
        <h1 style="color: white; font-size: 13px; font-family: 'apple', sans-serif;">${app.formattedBundle}</h1>
        <!-- Vertical line between divs -->
        <div style="position: absolute; right: -5px; top: 50%; transform: translateY(-50%); height: 60%; width: 1px; background-color: rgba(255, 255, 255, 0.25);"></div>
    </div>

    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 85px; min-width: 140px; background: transparent; position: relative;">
        <h1 style="color: white; font-size: 16px; font-weight: 1;">Size</h1>
        <h1 style="color: white; font-size: 13px; font-family: 'apple', sans-serif;">${app.latestSize}</h1>
        <!-- Vertical line between divs -->
        <div style="position: absolute; right: -5px; top: 50%; transform: translateY(-50%); height: 60%; width: 1px; background-color: rgba(255, 255, 255, 0.25);"></div>
    </div>

    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 85px; min-width: 140px; background: transparent; position: relative;">
        <h1 style="color: white; font-size: 16px; font-weight: 1;">Developer</h1>
        <h1 style="color: white; font-size: 13px; font-family: 'apple', sans-serif;">${app.developerName}</h1>
        <!-- Vertical line between divs -->
        <div style="position: absolute; right: -5px; top: 50%; transform: translateY(-50%); height: 60%; width: 1px; background-color: rgba(255, 255, 255, 0.25);"></div>
    </div>

    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 85px; min-width: 140px; background: transparent; position: relative;">
        <h1 style="color: white; font-size: 16px; font-weight: 1;">Last Updated</h1>
        <h1 style="color: white; font-size: 13px; font-family: 'apple', sans-serif;">${app.latestVersionDate}</h1>
        <!-- Vertical line between divs -->
        <div style="position: absolute; right: -5px; top: 50%; transform: translateY(-50%); height: 60%; width: 1px; background-color: rgba(255, 255, 255, 0.25);"></div>
    </div>
</div>



<div id="ss"></div>


            <div style="color: white; font-size: 16px; font-family: 'apple', sans-serif; margin-top: 50px; margin-left: 15px; margin-right: 15px;">
                ${formattedDescription}
            </div>








          
            <div style="background-color: transparent; width: 100%; height: 200px; top: 400px;"></div>

            <!-- IPA Background Modal -->
            <div id="ipaBG" style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 2; position: fixed; top: 0; left: 0; visibility: hidden; opacity: 0; transition: opacity 0.3s ease;" onclick="if(event.target === this) { this.style.opacity='0'; setTimeout(() => { this.style.visibility='hidden'; }, 300); }">
                <div style="background-color: rgba(28, 28, 28, 0.65); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); height: 120px; width: 240px; position: absolute; display: block; top: 50px; right: 55px; border-radius: 15px; font-size: 16px; color: white; z-index: 99;">
                    <div style="top: 50%; transform: translateY(-50%); position: absolute; height: 1px; width: 100%; background-color: #ffffff40;"></div>

                    <!-- Install IPA Option -->
                    <div style="background: transparent; width: 100%; height: 58px; position: absolute; top: 0; left: 0;" onclick="window.location.href='${finalDownloadURL}';">  
                        <img src="images/home/arrow_down_doc_fill.png" style="width: 30px; height: 30px; left: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
                        <img src="images/home/chevron.png" style="width: 20px; height: 20px; opacity: 50%; right: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
                        <h1 style="left: 45px; position: absolute; color: white; font-size: 15px; font-weight: 1; top: 16px;">Install .ipa</h1>
                        <h1 style="left: 45px; position: absolute; color: white; opacity: 50%; font-family: 'apple', sans-serif; font-size: 14.5px; font-weight: 1; top: 30px;">Install .ipa In Web Browser</h1>
                    </div>  

                    <div style="background: transparent; width: 100%; height: 58px; position: absolute; bottom: 0; left: 0;" onclick="
                      var optionsDiv = document.getElementById('optionsDiv');
                      var isVisible = optionsDiv.style.display === 'block';
                      optionsDiv.style.display = isVisible ? 'none' : 'block';
                      
                      if (!isVisible) {
                        // Close the optionsDiv when clicking anywhere outside
                        document.addEventListener('click', function(event) {
                          if (!optionsDiv.contains(event.target) && !event.target.closest('div[onclick]')) {
                            optionsDiv.style.display = 'none';
                          }
                        });
                      }
                    ">
                        <img src="images/home/arrow_up_doc_fill.png" style="width: 30px; height: 30px; left: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
                        <img src="images/home/chevron.png" style="width: 20px; height: 20px; opacity: 50%; right: 10px; top: 50%; transform: translateY(-50%); position: absolute; display: block;">
                        <h1 style="left: 45px; position: absolute; color: white; font-size: 15px; font-weight: 1; top: 16px;">Import to...</h1>
                        <h1 style="left: 45px; position: absolute; color: white; opacity: 50%; font-family: 'apple', sans-serif; font-size: 14.5px; font-weight: 1; top: 30px;">Import .ipa To Other Apps</h1>
                    </div>

                   <div id="optionsDiv" style="display: none; border-radius: 15px; position: absolute; top: 135px; background-color: rgba(28, 28, 28, 0.95);  backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);  color: white; width: 240px; height: 240px; padding: 20px; z-index: 100;">
  <h1 style="color: white; font-size: 14.5px; opacity: 50%; margin-top: -15px; font-family: 'apple', sans-serif; margin-left: -10px; ">Import Unsigned Ipa to:</h1>
<div style=" width: 100%; height: 35px;" onclick="window.location.href='scarlet://install=${finalDownloadURL}';">
<h1 style="position: absolute; color: white; font-size: 16px;  font-weight: 1; margin-left: 40px; margin-top: 2.5px;  margin-right: -10px;">Scarlet</h1>
  <img src="https://it-tehnik.ru/wp-content/uploads/4-484.jpg" style=" width: 35px; height: 35px;  border-radius: 10px; margin-top: 4px; margin-left: -10px; ">
</div>
  <div style="width: 100%; height: 35px;" onclick="window.location.href='sidestore://install?url=${finalDownloadURL}';">
<h1 style="position: absolute; color: white; font-size: 16px;  font-weight: 1; margin-left: 40px; margin-top: 2.5px;  margin-right: -10px;">SideStore</h1>
  <img src="https://connect.sidestore.io/public/apps/com.stossy11.SideJIT/icon.png" style=" width: 35px; height: 35px; border-radius: 10px; margin-top: 4px; margin-left: -10px;">
</div>
  <div style="width: 100%; height: 35px;" onclick="window.location.href='opium://install=${finalDownloadURL}';">
<h1 style="position: absolute; color: white; font-size: 16px;  font-weight: 1; margin-left: 40px; margin-top: 2.5px; margin-right: -10px; ">TanaraSign</h1>
  <img src="https://raw.githubusercontent.com/Veloraios/ipa-signer/refs/heads/main/IMG_2872.png" style=" width: 35px; height: 35px; border-radius: 10px;  margin-top: 4px; margin-left: -10px;">
</div>
  <div style="width: 100%; height: 35px;" onclick="window.location.href='altstore://install?url=${finalDownloadURL}';">
<h1 style="position: absolute; color: white; font-size: 16px;  font-weight: 1; margin-left: 40px; margin-top: 2.5px; margin-right: -10px; ">Altstore</h1>
  <img src="https://tech-latest.com/wp-content/uploads/2022/06/11-1.jpg" style=" width: 35px; height: 35px; border-radius: 10px; margin-top: 4px; margin-left: -10px;">
</div>
 <div style="width: 100%; height: 35px; " onclick="window.location.href='apple-magnifier://install?url=${finalDownloadURL}';">
<h1 style="position: absolute; color: white; font-size: 16px;  font-weight: 1; margin-left: 40px; margin-top: 2.5px;  margin-right: -10px;">TrollStore</h1>
  <img src="https://media.idownloadblog.com/wp-content/uploads/2022/09/TrollStore-Logo.jpg" style=" width: 35px; height: 35px; border-radius: 10px; margin-top: 4px; margin-left: -10px;">
</div>
  </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // Check if app.screenshotURLs exists
if (app.screenshotURLs && app.screenshotURLs.length > 0) {
    const screenshotGallery = `
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
                    modal.style.opacity = '0';
                    modal.style.transition = 'opacity 0.3s ease-in-out';
                    
                    setTimeout(function() {
                        modal.style.opacity = '1';
                    }, 0);

                    var img = document.createElement('img');
                    img.src = '${url}';
                    img.style.maxWidth = '90%';
                    img.style.maxHeight = '90%';
                    img.style.objectFit = 'contain';
                    img.style.margin = 'auto';
                    img.style.borderRadius = '15px';
                    
                    var closeBtn = document.createElement('img');
                    closeBtn.src = 'https://icon-library.com/images/cancel-icon-transparent/cancel-icon-transparent-3.jpg';
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.top = '40px';
                    closeBtn.style.right = '20px';
                    closeBtn.style.width = '30px';
                    closeBtn.style.height = '30px';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.onclick = function() { 
                        modal.style.opacity = '0';
                        setTimeout(function() {
                            document.body.removeChild(modal);
                        }, 300);
                    };
                    
                    modal.appendChild(closeBtn);
                    modal.appendChild(img);
                    document.body.appendChild(modal);
                ">`
            ).join('')}
        </div>
    `;
    
    // Inject the screenshot gallery HTML into the #ss div in modalHtml
    modalHtml = modalHtml.replace('<div id="ss"></div>', `<div id="ss">${screenshotGallery}</div>`);
}


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
                overlay.style.display = 'block';  // Show the overlay
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
            overlay.style.display = 'none'; // Hide overlay immediately if no results
            resultsContainer.style.display = 'none'; 
            document.body.classList.remove('no-scroll'); 
        }
    });

    // Close overlay when clicking on the background (overlay)
    overlay.addEventListener('click', () => {
        // Hide the overlay with a delay to simulate a fade-out effect
        overlay.style.transition = 'background 0s ease'; // Optional transition effect
        setTimeout(() => {
            overlay.style.display = 'none'; // Hide overlay after a brief delay
            resultsContainer.style.display = 'none'; // Hide the results container
            document.body.classList.remove('no-scroll');
        }, 0); // Delay should match the transition time
    });

    // Prevent the overlay from being closed when clicking inside the results container
    resultsContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling up to the overlay
    });
};




window.onload = async () => {
    // Get the repositories from localStorage
    const repos = JSON.parse(localStorage.getItem('repos'));

    if (repos && repos.length > 0) {
        // Find the repository that has isGreenEnabled set to true (the one with the green check)
        const selectedRepo = repos.find(repo => repo.isGreenEnabled);

        if (selectedRepo) {
            const repoURL = selectedRepo.url;  // Use the selected repo's URL

            // Fetch data from the repository URL
            const repoData = await fetchData(repoURL);

            if (repoData) {
                loadApps(repoData);  // Call the function to load the apps with fetched data
                setupSearch();       // Set up the search functionality
            }
        } else {
            console.log('No repository with a green check found.');
        }
    } else {
        console.log('No repositories found in localStorage.');
    }
};

