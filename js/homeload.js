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

    const appDescription = document.createElement('span');
    appDescription.innerText = app.localizedDescription.trim();
    appDescription.classList.add('app-description');

    infoContainer.appendChild(appName);
    infoContainer.appendChild(appDescription);
    button.appendChild(icon);

    const rightArrow = document.createElement('img');
    rightArrow.src = 'images/home/chevron.png'; 
    rightArrow.classList.add('right-arrow');

    button.appendChild(infoContainer);
    button.appendChild(rightArrow);

    button.onclick = () => openModal(app);

    return button;
};

const fetchData = async () => {
    try {
        const response = await fetch('https://repo.apptesters.org');

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        console.log('Fetched data:', data); 
        return data.apps || [];
    } catch (error) {
        console.error('Error fetching app data:', error);
        return [];
    }
};

const loadApps = async (searchTerm = '') => {
    const appContainer = document.getElementById('home-page');
    appContainer.innerHTML = '<p style="color: gray;">Loading...</p>';
    const apps = await fetchData();
    appContainer.innerHTML = ''; 

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

const openModal = (app) => {
    const modalHtml = `
        <div id="modal" style="left: 0; display: block; width: 100vw; height: 100vh; padding-top: env(safe-area-inset-top); background-color: #131416; position: fixed; top: 0; z-index: 1000000000000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease;">
            <div style="position: relative; top: 0; left: 0; width: 100%; height: 100%; overflow-x: hidden; padding-top: env(safe-area-inset-top);">
                <div class="image-wrapper" style="width: 100%; height: 200px; background-image: url('${app.iconURL}'); background-size: 3500% 3500%; background-position: bottom right; top: -48px; position: absolute; background-repeat: no-repeat;">
                </div>
                <button id="back-button" style="display: block; position: absolute; left: 5px; top: 50px; border-radius: 50%; width: 50px; background-color: #191A1C; height: 50px; border: 2px solid #222325; cursor: pointer;">
                    <img src="images/home/chevron_left.png" style="width: 40px; height: 40px; display: block; margin: auto;">
                </button>
                <img src="${app.iconURL}" alt="${app.name}" style="width: 70px; left: 15px; border-radius: 15px; position: absolute; display: block; top: 200px; height: 70px; margin-top: 20px;">
            </div>
        </div>
    `;

    // Insert modal HTML into the DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('modal');

    // Adjust the modal position for safe areas, especially for iPhone X-like status bars
    const statusBarHeight = (navigator.userAgent.includes("iPhone") && window.innerWidth === 375 && window.innerHeight === 812) ? 44 : 0; // Adjust for iPhone X-like status bar
    modal.style.top = `${statusBarHeight}px`; // Ensure the modal is below the status bar on mobile

    modal.style.visibility = 'visible';
    setTimeout(() => {
        modal.style.opacity = '1'; 
    }, 10);

    // Disable body scrolling when modal is open
    document.body.style.overflow = 'hidden'; 
    const appContainer = document.getElementById('home-page');
    appContainer.style.overflow = 'hidden'; 

    // Set up the back button to close the modal
    document.getElementById('back-button').onclick = closeModal; 
};

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

const setupSearch = async () => {
    const searchBar = document.getElementById('search-bar');
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.classList.add('search-results');

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);
    document.body.appendChild(resultsContainer);

    const apps = await fetchData(); 

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        resultsContainer.innerHTML = ''; 

        if (searchTerm) {
            const filteredApps = apps.filter(app => app.name.toLowerCase().includes(searchTerm));

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
                    appName.innerText = app.name.trim();
                    appName.classList.add('result-name');

                    const appDescription = document.createElement('span');
                    appDescription.innerText = app.localizedDescription.trim();
                    appDescription.classList.add('result-description');

                    resultInfo.appendChild(appName);
                    resultInfo.appendChild(appDescription);

                    resultItem.appendChild(icon);
                    resultItem.appendChild(resultInfo);
                    resultItem.onclick = () => {
                        const appButton = document.querySelector(`button[data-app-name="${app.name.trim()}"]`);
                        if (appButton) {
                            appButton.scrollIntoView({ behavior: 'smooth' }); 
                            openModal(app); 
                        }
                        resultsContainer.innerHTML = ''; 
                        overlay.style.display = 'none'; 
                        resultsContainer.style.display = 'none';
                        document.body.classList.remove('no-scroll');
                    };

                    resultsContainer.appendChild(resultItem);
                });
            } else {
                resultsContainer.innerHTML = '<p style="color: gray;">No apps found. <br>Request Apps in the Settings Category.</p>';
                resultsContainer.style.display = 'block'; 
            }
        } else {
            resultsContainer.innerHTML = ''; 
            overlay.style.display = 'none'; 
            resultsContainer.style.display = 'none'; 
            document.body.classList.remove('no-scroll');
        }
    });

    overlay.onclick = () => {
        resultsContainer.innerHTML = '';
        overlay.style.display = 'none'; 
        resultsContainer.style.display = 'none'; 
        document.body.classList.remove('no-scroll'); 
    };
};

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');

        pages.forEach(page => {
            page.classList.remove('active');
        });

        const activePage = document.getElementById(`${target}-page`);
        activePage.classList.add('active');

        if (target === 'home') {
            document.getElementById('search-bar-container').style.display = 'block'; 
            loadApps(); 
        } else {
            document.getElementById('search-bar-container').style.display = 'none'; 
        }

        navItems.forEach(nav => {
            nav.classList.remove('active');
            nav.querySelector('img').classList.remove('clicked');
        });
        item.classList.add('active');
        item.querySelector('img').classList.add('clicked');
    });
});

setupSearch();
loadApps();
