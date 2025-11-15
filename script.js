document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN SCREEN LOGIC ---
    const PASSWORD_KEY = 'nyxoraOS_password';
    const loginScreen = document.getElementById('login-screen');
    const loginTitle = document.getElementById('login-title');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const forgotPassword = document.getElementById('forgot-password');
    const loginMessage = document.getElementById('login-message');

    let storedPassword = localStorage.getItem(PASSWORD_KEY);

    function setupLoginUI() {
        storedPassword = localStorage.getItem(PASSWORD_KEY);
        if (storedPassword) {
            // Login Mode
            loginTitle.textContent = 'Enter Password';
            loginButton.textContent = 'Login';
            forgotPassword.style.display = 'block';
        } else {
            // Create Password Mode
            loginTitle.textContent = 'Create Password';
            loginButton.textContent = 'Create';
            forgotPassword.style.display = 'none';
        }
        passwordInput.value = '';
        loginMessage.textContent = '';
    }

    function handleLoginAttempt() {
        const pass = passwordInput.value;
        if (storedPassword) {
            // --- LOGIN MODE ---
            if (pass === storedPassword) {
                // Success
                loginScreen.classList.add('hidden');
            } else {
                // Failure
                loginMessage.textContent = 'Incorrect password. Please try again.';
                passwordInput.value = '';
            }
        } else {
            // --- CREATE MODE ---
            if (pass.length < 4) {
                loginMessage.textContent = 'Password must be at least 4 characters.';
                return;
            }
            // Success
            localStorage.setItem(PASSWORD_KEY, pass);
            storedPassword = pass;
            loginScreen.classList.add('hidden');
        }
    }

    loginButton.addEventListener('click', handleLoginAttempt);

    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleLoginAttempt();
        }
    });

    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        // We can use the existing showModal function
        showModal(
            "Reset Password",
            "Are you sure you want to reset your password? This will remove your saved password and you will need to create a new one.",
            true,
            () => {
                // On Confirm
                localStorage.removeItem(PASSWORD_KEY);
                loginMessage.textContent = 'Password reset. Please create a new one.';
                setupLoginUI();
            }
        );
    });

    // Initialize the Login UI
    setupLoginUI();
    // --- END OF LOGIN LOGIC ---
    const cursorDot = document.getElementById('custom-cursor-dot');
    const cursorOutline = document.getElementById('custom-cursor-outline');
    // Define all elements that should trigger the interaction state
    const interactiveElements = 'button, a, input, textarea, .window-action-btn, .dock-icon, .app-item, .context-menu-item, .email-item, .install-button, .translator-lang-select, select';

    // --- CURSOR FIX ---
    // mousemove now handles positioning AND interaction state.
    document.addEventListener('mousemove', (e) => {
        if (!cursorDot || !cursorOutline) return;

        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';

        // Use requestAnimationFrame for smoother outline movement
        requestAnimationFrame(() => {
            cursorOutline.style.left = e.clientX + 'px';
            cursorOutline.style.top = e.clientY + 'px';
        });

        // New logic: Check on every move
        if (e.target.closest(interactiveElements)) {
            document.body.classList.add('interactive-cursor-state');
        } else {
            document.body.classList.remove('interactive-cursor-state');
        }
    });

    // Removed the old mouseover/mouseout listeners

    // --- Your existing code starts here ---
    const desktopContainer = document.getElementById('desktop-container');
    const startButton = document.getElementById('start-button');
    const appLauncher = document.querySelector('.app-launcher');
    const taskbar = document.querySelector('.taskbar');
    const statusButton = document.querySelector('.status-button'); 
    const quickSettings = document.getElementById('quick-settings');
    const dockIconsContainer = document.querySelector('.taskbar-center');
    const appGrid = document.querySelector('.app-grid');
    const allAppItems = Array.from(appGrid.querySelectorAll('.app-item'));
    const launcherSearchInput = document.getElementById('launcher-search-input');

    let zIndexCounter = 20;
    let draggedIcon = null;

    const INSTALLED_APPS_KEY = 'nyxoraOS_installedApps';
    const PINNED_APPS_KEY = 'nyxoraOS_pinnedApps';
    const DEFAULT_INSTALLED_APPS = ['appstore', 'settings', 'calendar', 'weather', 'files', 'pictures', 'gmail', 'browser', 'translator'];
    const DEFAULT_PINNED_APPS = ['browser', 'gmail', 'files', 'settings', 'appstore'];

    let installedApps = JSON.parse(localStorage.getItem(INSTALLED_APPS_KEY)) || DEFAULT_INSTALLED_APPS;
    let pinnedApps = JSON.parse(localStorage.getItem(PINNED_APPS_KEY)) || DEFAULT_PINNED_APPS;

    function saveInstalledApps() {
        localStorage.setItem(INSTALLED_APPS_KEY, JSON.stringify(installedApps));
    }

    function savePinnedApps() {
        localStorage.setItem(PINNED_APPS_KEY, JSON.stringify(pinnedApps));
    }

    let currentAccentColor = 'blue';
    let currentWallpaper = 'url("https://images.wallpapersden.com/image/download/tree-alone-dark-evening-4k_bWZpam2UmZqaraWkpJRobWllrWdma2U.jpg")';
    let accentColorValue = '#5865F2';

    if (desktopContainer) {
        desktopContainer.style.backgroundImage = currentWallpaper;
        desktopContainer.style.backgroundSize = 'cover';
        desktopContainer.style.backgroundPosition = 'center';
    }

    function getDisplayContent() {
        const isLightMode = document.documentElement.classList.contains('light-mode');
        return `
            <h2>Display & Appearance</h2>
            <div class="settings-section" data-section="display">
                <h3>General</h3>
                <div class="setting-row">
                    <div class="setting-info">
                        <p>Dark Mode</p>
                        <small>Enable dark theme across the system and apps.</small>
                    </div>
                    <div class="setting-control">
                        <label class="switch">
                            <input type="checkbox" id="dark-mode-switch" ${isLightMode ? '' : 'checked'}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <div class="setting-row">
                    <div class="setting-info">
                        <p>Accent Color</p>
                        <small>Choose the highlight color for interactive elements.</small>
                    </div>
                    <div class="setting-control">
                        <select id="accent-color-select">
                            <option value="blue" ${currentAccentColor === 'blue' ? 'selected' : ''}>Blue (Default)</option>
                            <option value="green" ${currentAccentColor === 'green' ? 'selected' : ''}>Green</option>
                            <option value="purple" ${currentAccentColor === 'purple' ? 'selected' : ''}>Purple</option>
                        </select>
                    </div>
                </div>
                <h3>Wallpaper</h3>
                <div class="setting-row">
                    <div class="setting-info">
                        <p>Wallpaper Source</p>
                        <small>Current: Custom Dark Evening</small>
                    </div>
                    <div class="setting-control">
                        <button id="change-wallpaper-btn" style="background: ${accentColorValue}; color: var(--white); padding: 8px 12px; border-radius: 8px;">Change Wallpaper</button>
                    </div>
                </div>
            </div>
        `;
    }

    function setupDisplaySettingsListeners(windowElement) {
        const darkModeSwitch = windowElement.querySelector('#dark-mode-switch');
        const accentColorSelect = windowElement.querySelector('#accent-color-select');
        const changeWallpaperBtn = windowElement.querySelector('#change-wallpaper-btn');

        if (darkModeSwitch) {
            darkModeSwitch.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.documentElement.classList.remove('light-mode');
                } else {
                    document.documentElement.classList.add('light-mode');
                }
            });
        }

        if (accentColorSelect) {
            accentColorSelect.addEventListener('change', (e) => {
                currentAccentColor = e.target.value;

                switch (currentAccentColor) {
                    case 'green':
                        accentColorValue = '#34a853';
                        break;
                    case 'purple':
                        accentColorValue = '#8e44ad';
                        break;
                    case 'blue':
                    default:
                        accentColorValue = '#5865F2';
                        break;
                }

                document.documentElement.style.setProperty('--accent-blue', accentColorValue);
                if (changeWallpaperBtn) changeWallpaperBtn.style.background = accentColorValue;

                const settingsContent = windowElement.querySelector('#settings-content');
                if (settingsContent) settingsContent.innerHTML = getDisplayContent();
                setupDisplaySettingsListeners(windowElement);
            });
        }

        if (changeWallpaperBtn) {
            changeWallpaperBtn.addEventListener('click', () => {
                const currentWallpaperInfo = windowElement.querySelector('.setting-row:nth-child(3) .setting-info small');

                if (currentWallpaper.includes('wallpapersden.com')) {
                    currentWallpaper = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
                    if (currentWallpaperInfo) currentWallpaperInfo.textContent = 'Current: Blue Gradient';
                } else {
                    currentWallpaper = 'url("https://images.wallpapersden.com/image/download/tree-alone-dark-evening-4k_bWZpam2UmZqaraWkpJRobWllrWdma2U.jpg")';
                    if (currentWallpaperInfo) currentWallpaperInfo.textContent = 'Current: Custom Dark Evening';
                }

                desktopContainer.style.backgroundImage = currentWallpaper;
                desktopContainer.style.backgroundSize = 'cover';
                desktopContainer.style.backgroundPosition = 'center';
            });
        }
    }


    function updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('time');
        const dateElement = document.getElementById('date');

        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
        }
    }

    updateTime();
    setInterval(updateTime, 1000);

    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu', 'hidden');
    contextMenu.innerHTML = `
        <div class="menu-item has-submenu" id="context-view">View <i class="fas fa-chevron-right"></i>
            <div class="submenu">
                <div class="menu-item" data-action="view-large">Large icons</div>
                <div class="menu-item" data-action="view-medium">Medium icons</div>
                <div class="menu-item" data-action="view-small">Small icons</div>
            </div>
        </div>
        <div class="menu-item has-submenu" id="context-sort">Sort by <i class="fas fa-chevron-right"></i>
            <div class="submenu">
                <div class="menu-item" data-action="sort-name">Name</div>
                <div class="menu-item" data-action="sort-type">Item type</div>
            </div>
        </div>
        <div class="menu-item" id="context-refresh">Refresh</div>
        <div class="menu-separator" id="context-desktop-sep"></div>
        <div class="menu-item" id="context-display-settings">Display settings</div>
        <div class="menu-item" id="context-personalize">Personalize</div>
        
        <div class="menu-separator" id="context-app-sep"></div>
        <div class="menu-item" id="context-open-app">Open</div>
        <div class="menu-item" id="context-pin">Pin to taskbar</div>
        <div class="menu-item" id="context-unpin">Unpin from taskbar</div>
        <div class="menu-item" id="context-close-app">Close</div>
    `;
    desktopContainer.appendChild(contextMenu);

    
    // --- QUICK SETTINGS FIX ---
    // This function is now correctly implemented
    function hideAllOverlays(event) {
        if (event && startButton.contains(event.target)) return;
        if (event && appLauncher.contains(event.target)) return;
        appLauncher.classList.add('hidden');

        // Add these lines back in
        if (event && statusButton.contains(event.target)) return;
        if (event && quickSettings.contains(event.target)) return;
        quickSettings.classList.add('hidden');

        if (event && contextMenu.contains(event.target)) return;
        contextMenu.classList.add('hidden');
    }

    startButton.addEventListener('click', (event) => {
        event.stopPropagation();
        quickSettings.classList.add('hidden'); // This is correct, start button closes QS
        contextMenu.classList.add('hidden');
        renderInstalledAppsInLauncher();
        appLauncher.classList.toggle('hidden');
        launcherSearchInput.value = '';
        filterAppLauncher('');
    });

    // --- QUICK SETTINGS FIX ---
    // Added the click listener for the status button
    statusButton.addEventListener('click', (event) => {
        event.stopPropagation();
        appLauncher.classList.add('hidden');
        contextMenu.classList.add('hidden');
        quickSettings.classList.toggle('hidden');
    });


    document.addEventListener('click', hideAllOverlays);
    appLauncher.addEventListener('click', (event) => event.stopPropagation());
    quickSettings.addEventListener('click', (event) => event.stopPropagation()); // This is correct

    function filterAppLauncher(searchTerm) {
        const query = searchTerm.toLowerCase();

        allAppItems.forEach(item => {
            const appId = item.getAttribute('data-app-id');
            const appName = item.getAttribute('data-app-name').toLowerCase();
            const isInstalled = installedApps.includes(appId);
            const matchesSearch = appName.includes(query);

            if (isInstalled && matchesSearch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function renderInstalledAppsInLauncher() {
        allAppItems.forEach(item => {
            const appId = item.getAttribute('data-app-id');
            if (installedApps.includes(appId)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    if (launcherSearchInput) {
        launcherSearchInput.addEventListener('input', (event) => {
            filterAppLauncher(event.target.value);
        });
    }

    const openApps = {};

    function createNewWindow(appId, appName) {
        if (!installedApps.includes(appId)) {
            showModal("App Not Installed", `The app "${appName}" is not installed. Please install it via the App Store.`);
            return;
        }

        if (openApps[appId] && openApps[appId].isMinimized === false) {
            focusWindow(openApps[appId].element);
            return;
        }

        if (openApps[appId] && openApps[appId].isMinimized === true) {
            let windowElement = openApps[appId].element;
            windowElement.classList.remove('minimized');
            openApps[appId].isMinimized = false;
            updateDock(appId, true, false);
            focusWindow(windowElement);
            return;
        }

        let windowElement = document.createElement('div');
        windowElement.classList.add('window');
        windowElement.setAttribute('data-app-id', appId);
        windowElement.style.left = `${100 + Object.keys(openApps).length * 20}px`;
        windowElement.style.top = `${50 + Object.keys(openApps).length * 20}px`;

        let initialWidth = '600px';
        let initialHeight = '400px';

        if (appId === 'calendar') {
            initialWidth = '800px';
            initialHeight = '600px';
        } else if (appId === 'weather') {
            initialWidth = '400px';
            initialHeight = '600px';
        } else if (appId === 'settings') {
            initialWidth = '750px';
            initialHeight = '550px';
        } else if (appId === 'appstore') {
            initialWidth = '800px';
            initialHeight = '650px';
        } else if (appId === 'browser') {
            initialWidth = '800px';
            initialHeight = '650px';
        } else if (appId === 'translator') {
            initialWidth = '650px';
            initialHeight = '450px';
        } else if (appId === 'gmail') { // Size for new Gmail app
            initialWidth = '850px';
            initialHeight = '600px';
        }

        windowElement.style.width = initialWidth;
        windowElement.style.height = initialHeight;

        windowElement.innerHTML = `
            <div class="window-header">
                <span class="window-title">${appName}</span>
                <div class="window-controls">
                    <button class="min-btn" title="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="max-btn" title="Maximize"><i class="far fa-square"></i></button>
                    <button class="close-btn" title="Close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="window-body">
                ${getAppContent(appId, appName)}
            </div>
        `;

        desktopContainer.appendChild(windowElement);
        makeWindowDraggable(windowElement);

        openApps[appId] = {
            element: windowElement,
            isMinimized: false,
            isMaximized: false,
            appName: appName,
            initialX: windowElement.style.left,
            initialY: windowElement.style.top,
            initialW: windowElement.style.width,
            initialH: windowElement.style.height
        };

        focusWindow(windowElement);
        updateDock(appId, true);

        if (!windowElement.hasControlsListeners) {
            addWindowControlListeners(windowElement, appId);
            windowElement.hasControlsListeners = true;
        }

        if (appId === 'settings') {
            initializeSettingsListeners(windowElement);
        }
        if (appId === 'calendar') {
            initializeCalendarListeners(windowElement);
        }
        if (appId === 'appstore') {
            initializeAppStoreListeners(windowElement);
        }
        if (appId === 'weather') {
            initializeWeatherListeners(windowElement);
        }
        if (appId === 'translator') {
            initializeTranslatorListeners(windowElement);
        }
        // --- GMAIL APP ---
        // Add listener for the new Gmail app
        if (appId === 'gmail') {
            initializeGmailAppListeners(windowElement);
        }
    }

    function initializeTranslatorListeners(windowElement) {
        const inputLang = windowElement.querySelector('#translator-lang-from');
        const outputLang = windowElement.querySelector('#translator-lang-to');
        const swapBtn = windowElement.querySelector('#translator-swap');
        const inputArea = windowElement.querySelector('#translator-input');
        const outputArea = windowElement.querySelector('#translator-output');
        const translateBtn = windowElement.querySelector('#translator-translate-btn');

        if (!translateBtn) return; // Already initialized or error

        const doTranslate = () => {
            const inputText = inputArea.value;
            if (!inputText) return;

            const inputLanguage = inputLang.value;
            const outputLanguage = outputLang.value;

            outputArea.value = 'Translating...';

            // User's provided fetch logic
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURIComponent(inputText)}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data[0]) {
                        // Join all translated segments
                        const translatedText = data[0].map(segment => segment[0]).join('');
                        outputArea.value = translatedText;
                    } else {
                        outputArea.value = 'Error: Could not translate.';
                    }
                })
                .catch(error => {
                    console.log(error);
                    outputArea.value = 'Error: Could not translate.';
                });
        };

        translateBtn.addEventListener('click', doTranslate);
        inputArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doTranslate();
            }
        });

        swapBtn.addEventListener('click', () => {
            if (inputLang.value === 'auto') {
                inputLang.value = outputLang.value;
                outputLang.value = 'en'; // Default to english if swapping from 'auto'
            } else {
                const temp = inputLang.value;
                inputLang.value = outputLang.value;
                outputLang.value = temp;
            }
        });
    }

  function initializeGmailAppListeners(windowElement) {
        const emailListContainer = windowElement.querySelector('.email-list');
        const emailContentContainer = windowElement.querySelector('.email-content');
        const statusText = windowElement.querySelector('.email-list-status');
        
        // Account UI
        const createBtn = windowElement.querySelector('#mail-create-btn');
        const refreshBtn = windowElement.querySelector('#mail-refresh-btn');
        const usernameInput = windowElement.querySelector('#mail-username-input');
        const domainSelect = windowElement.querySelector('#mail-domain-select');
        const addressDisplay = windowElement.querySelector('#mail-account-address');
        const accountTitle = windowElement.querySelector('#mail-account-title');
        const createForm = windowElement.querySelector('.mail-create-form');

        // App state
        let accountToken = null;
        let userAddress = null;
        let messages = [];

        const API_URL = 'https://api.mail.tm';

        // 1. Fetch available domains for dropdown
        function getDomains() {
            fetch(`${API_URL}/domains`)
                .then(res => res.json())
                .then(data => {
                    if (data && data['hydra:member'] && data['hydra:member'].length > 0) {
                        domainSelect.innerHTML = '';
                        data['hydra:member'].forEach(domain => {
                            domainSelect.innerHTML += `<option value="${domain.domain}">${domain.domain}</option>`;
                        });
                        addressDisplay.textContent = 'Ready to create.';
                    } else {
                        addressDisplay.textContent = 'Error loading domains.';
                    }
                })
                .catch(() => {
                    addressDisplay.textContent = 'Error loading domains.';
                });
        }
        
        // 2. Create a new account
        function createAccount() {
            const username = usernameInput.value;
            const domain = domainSelect.value;
            if (!username) {
                showModal("Error", "Please enter a username.");
                return;
            }
            
            const password = 'password123'; // Mail.tm requires a password, but we'll manage with the token
            userAddress = `${username}@${domain}`;
            
            addressDisplay.textContent = 'Creating account...';
            
            fetch(`${API_URL}/accounts`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    address: userAddress,
                    password: password
                })
            })
            .then(res => res.json())
            .then(accountData => {
                if (accountData.address) {
                    // Account created, now get token
                    return fetch(`${API_URL}/token`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            address: userAddress,
                            password: password
                        })
                    });
                } else {
                    throw new Error(accountData['hydra:description'] || 'Failed to create account.');
                }
            })
            .then(res => res.json())
            .then(tokenData => {
                if (tokenData.token) {
                    accountToken = tokenData.token;
                    // Update UI
                    accountTitle.textContent = "Your Active Inbox";
                    addressDisplay.textContent = userAddress;
                    createForm.classList.add('hidden');
                    createBtn.classList.add('hidden');
                    refreshBtn.classList.remove('hidden');
                    statusText.textContent = 'Fetching emails...';
                    getMessages();
                } else {
                    throw new Error('Failed to get auth token.');
                }
            })
            .catch(err => {
                addressDisplay.textContent = 'Error.';
                showModal("Error", `Could not create account: ${err.message}`);
            });
        }
        
        // 3. Get messages from inbox
        function getMessages() {
            if (!accountToken) return;
            
            statusText.textContent = 'Refreshing...';
            emailListContainer.innerHTML = ''; // Clear list
            
            fetch(`${API_URL}/messages`, {
                headers: { 'Authorization': `Bearer ${accountToken}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data && data['hydra:member']) {
                    messages = data['hydra:member'];
                    if (messages.length === 0) {
                        statusText.textContent = 'Your inbox is empty.';
                    } else {
                        statusText.textContent = '';
                        renderMessageList();
                    }
                } else {
                    throw new Error('Could not fetch messages.');
                }
            })
            .catch(err => {
                 statusText.textContent = `Error: ${err.message}`;
            });
        }
        
        // 4. Render the list of messages
        function renderMessageList() {
            emailListContainer.innerHTML = ''; // Clear
            messages.forEach(msg => {
                const emailItem = document.createElement('div');
                emailItem.className = 'email-item';
                if (msg.seen === false) {
                    emailItem.classList.add('unread');
                }
                emailItem.setAttribute('data-email-id', msg.id);
                emailItem.innerHTML = `
                    <span class="email-item-sender">${msg.from.address}</span>
                    <span class="email-item-subject">${msg.subject}</span>
                `;
                emailItem.addEventListener('click', () => {
                    showMessage(msg.id);
                    // Mark as active
                    emailListContainer.querySelectorAll('.email-item.active').forEach(i => i.classList.remove('active'));
                    emailItem.classList.add('active');
                    emailItem.classList.remove('unread');
                });
                emailListContainer.appendChild(emailItem);
            });
        }
        
        // 5. Show a single message's content
        function showMessage(id) {
            emailContentContainer.innerHTML = '<p>Loading message...</p>';
            
            fetch(`${API_URL}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${accountToken}` }
            })
            .then(res => res.json())
            .then(msg => {
                emailContentContainer.innerHTML = `
                    <div class="email-content-header">
                        <h2 class="content-subject">${msg.subject}</h2>
                        <p class="content-from">From: <strong>${msg.from.address}</strong></p>
                    </div>
                    <div class="content-body">
                        ${msg.html ? msg.html.join('') : `<p>${msg.text}</p>`}
                    </div>
                `;
                // Mark as seen on the server
                fetch(`${API_URL}/messages/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accountToken}`,
                        'Content-Type': 'application/merge-patch+json'
                    },
                    body: JSON.stringify({ seen: true })
                });
            })
            .catch(() => {
                emailContentContainer.innerHTML = '<p>Error loading message.</p>';
            });
        }
        
        // --- Init and Event Listeners ---
        createBtn.addEventListener('click', createAccount);
        refreshBtn.addEventListener('click', getMessages);
        getDomains(); // Start by fetching domains
    }

    function addWindowControlListeners(windowElement, appId) {
        const minimizeBtn = windowElement.querySelector('.min-btn');
        const maximizeBtn = windowElement.querySelector('.max-btn');
        const closeBtn = windowElement.querySelector('.close-btn');

        minimizeBtn.addEventListener('click', () => {
            windowElement.classList.add('minimized');
            openApps[appId].isMinimized = true;
            updateDock(appId, false, true);
        });

        maximizeBtn.addEventListener('click', () => {
            toggleMaximize(windowElement, appId);
        });

        closeBtn.addEventListener('click', () => {
            windowElement.remove();
            delete openApps[appId];
            updateDock(appId, false);
        });
    }

    function toggleMaximize(windowElement, appId) {
        const appState = openApps[appId];

        if (appState.isMaximized) {
            windowElement.style.left = appState.initialX;
            windowElement.style.top = appState.initialY;
            windowElement.style.width = appState.initialW;
            windowElement.style.height = appState.initialH;
            windowElement.classList.remove('maximized');
            appState.isMaximized = false;
        } else {
            appState.initialX = windowElement.style.left;
            appState.initialY = windowElement.style.top;
            appState.initialW = windowElement.style.width;
            appState.initialH = windowElement.style.height;

            windowElement.style.left = '0';
            windowElement.style.top = '0';
            windowElement.style.width = '100vw';
            windowElement.style.height = 'calc(100vh - 66px)';
            windowElement.classList.add('maximized');
            appState.isMaximized = true;
        }
    }

    function focusWindow(windowElement) {
        zIndexCounter++;
        windowElement.style.zIndex = zIndexCounter;

        windowElement.addEventListener('mousedown', () => {
            zIndexCounter++;
            windowElement.style.zIndex = zIndexCounter;
        }, { once: true });
    }

    function makeWindowDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (windowElement.classList.contains('maximized')) return;
            isDragging = true;
            offset.x = e.clientX - windowElement.offsetLeft;
            offset.y = e.clientY - windowElement.offsetTop;
            windowElement.style.cursor = 'grabbing';
            focusWindow(windowElement);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newX = e.clientX - offset.x;
            let newY = e.clientY - offset.y;

            const taskbarHeight = 66;
            newY = Math.max(0, newY);
            newY = Math.min(newY, window.innerHeight - taskbarHeight - header.offsetHeight);
            newX = Math.max(0, newX);
            newX = Math.min(newX, window.innerWidth - windowElement.offsetWidth);

            windowElement.style.left = newX + 'px';
            windowElement.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            windowElement.style.cursor = 'move';
        });
    }

    function updateDock(appId, isOpening, isMinimizing = false) {
        let dockItem = dockIconsContainer.querySelector(`.dock-icon[data-app-id="${appId}"]`);

        if (isOpening) {
            if (!dockItem) {
                const app = appCatalog.find(a => a.id === appId);
                if (!app) return;
                dockItem = createDockIcon(app);
                dockIconsContainer.appendChild(dockItem);
            }
            dockItem.classList.add('active');
        } else if (isMinimizing) {
            if (dockItem) {
                dockItem.classList.remove('active');
            }
        } else {
            if (dockItem && !pinnedApps.includes(appId)) {
                dockItem.remove();
            } else if (dockItem) {
                dockItem.classList.remove('active');
            }
        }
    }

    function createDockIcon(app) {
        const button = document.createElement('button');
        button.className = 'dock-icon';
        button.title = app.name;
        button.setAttribute('data-app-id', app.id);
        button.setAttribute('data-app-name', app.name);
        button.draggable = true;

        button.innerHTML = `
            <i class="${app.icon}"></i>
            <span class="active-indicator"></span>
        `;

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const appId = button.getAttribute('data-app-id');
            const appName = button.getAttribute('data-app-name');
            if (!appId) return;

            if (openApps[appId] && !openApps[appId].isMinimized) {
                const isFocused = parseInt(openApps[appId].element.style.zIndex || 0) === zIndexCounter;
                if (isFocused) {
                    openApps[appId].element.querySelector('.min-btn').click();
                } else {
                    focusWindow(openApps[appId].element);
                }
            } else if (openApps[appId] && openApps[appId].isMinimized) {
                openApps[appId].element.classList.remove('minimized');
                openApps[appId].isMinimized = false;
                updateDock(appId, true, false);
                focusWindow(openApps[appId].element);
            } else {
                createNewWindow(appId, appName);
            }
            appLauncher.classList.add('hidden');
        });

        button.addEventListener('dragstart', handleDragStart);
        button.addEventListener('dragend', handleDragEnd);
        button.addEventListener('dragover', handleDragOver);
        button.addEventListener('drop', handleDrop);
        button.addEventListener('contextmenu', (e) => showAppContextMenu(e, app.id));

        return button;
    }

    function renderTaskbarIcons() {
        dockIconsContainer.innerHTML = '';
        pinnedApps.forEach(appId => {
            const app = appCatalog.find(a => a.id === appId);
            if (app) {
                const icon = createDockIcon(app);
                if (openApps[appId] && !openApps[appId].isMinimized) {
                    icon.classList.add('active');
                }
                dockIconsContainer.appendChild(icon);
            }
        });

        Object.keys(openApps).forEach(appId => {
            if (!pinnedApps.includes(appId) && !openApps[appId].isMinimized) {
                const app = appCatalog.find(a => a.id === appId);
                if (app) {
                    const icon = createDockIcon(app);
                    icon.classList.add('active');
                    dockIconsContainer.appendChild(icon);
                }
            }
        });
    }

    function handleDragStart(e) {
        if (!e.target.classList.contains('dock-icon')) return;
        draggedIcon = e.target;
        const appId = draggedIcon.getAttribute('data-app-id');
        e.dataTransfer.setData('text/plain', appId);
        setTimeout(() => {
            draggedIcon.classList.add('dragging');
        }, 0);
    }

    function handleDragEnd() {
        if (draggedIcon) {
            draggedIcon.classList.remove('dragging');
        }
        draggedIcon = null;
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        const targetIcon = e.target.closest('.dock-icon');
        if (targetIcon && targetIcon !== draggedIcon) {
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            targetIcon.classList.add('drag-over');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        if (!draggedIcon) return;

        const droppedOnIcon = e.target.closest('.dock-icon');
        const draggedAppId = draggedIcon.getAttribute('data-app-id');

        if (!pinnedApps.includes(draggedAppId)) {
            showModal("Pin App", "Please pin this app to the taskbar before reordering it.");
            return;
        }

        if (droppedOnIcon && droppedOnIcon !== draggedIcon) {
            const droppedOnAppId = droppedOnIcon.getAttribute('data-app-id');

            if (!pinnedApps.includes(droppedOnAppId)) {
                showModal("Pin App", "You can only reorder pinned apps.");
                return;
            }

            const fromIndex = pinnedApps.indexOf(draggedAppId);
            const toIndex = pinnedApps.indexOf(droppedOnAppId);

            if (fromIndex !== -1 && toIndex !== -1) {
                pinnedApps.splice(fromIndex, 1);
                pinnedApps.splice(toIndex, 0, draggedAppId);

                savePinnedApps();
                renderTaskbarIcons();
            }
        }
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }

    document.querySelectorAll('.app-item').forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            const appId = icon.getAttribute('data-app-id');
            const appName = icon.getAttribute('data-app-name');
            if (!appId) return;

            createNewWindow(appId, appName);
            appLauncher.classList.add('hidden');
        });
    });

    const appCatalog = [
        { id: 'appstore', name: 'App Store', category: 'System', icon: 'fas fa-store', iconBg: '#5865F2', price: 'Installed', isSystemApp: true, description: 'Discover, install, and manage apps.' },
        { id: 'settings', name: 'Settings', category: 'System', icon: 'fa-solid fa-gear', iconBg: '#808080', price: 'Installed', isSystemApp: true, description: 'Configure system settings.' },
        { id: 'calendar', name: 'Calendar', category: 'Productivity', icon: 'fa-solid fa-calendar-days', iconBg: '#34a853', price: 'Installed', description: 'Organize your schedule.' },
        { id: 'weather', name: 'Weather', category: 'Utilities', icon: 'fa-solid fa-cloud-sun', iconBg: '#fbbc05', price: 'Installed', description: 'Check the latest forecast.' },
        { id: 'files', name: 'Files', category: 'System', icon: 'fa-solid fa-folder', iconBg: '#5865F2', price: 'Installed', description: 'Browse your local files.' },
        { id: 'pictures', name: 'Pictures', category: 'Media', icon: 'fa-solid fa-images', iconBg: '#db4437', price: 'Installed', description: 'View your photos.' },
        { id: 'gmail', name: 'Mail', category: 'Communication', icon: 'fa-solid fa-envelope', iconBg: '#db4437', price: 'Installed', description: 'Connect your email.' },
        { id: 'browser', name: 'Nyxora Browser', category: 'Internet', icon: 'fa-solid fa-globe', iconBg: '#0f9d58', price: 'Installed', description: 'Fast, secure web browsing.' },

        { id: 'sound', name: 'Sound Control', category: 'System', icon: 'fa-solid fa-volume-high', iconBg: '#8e44ad', price: 'Free', description: 'Advanced audio mixing tools.' },
        { id: 'record', name: 'Note Recorder', category: 'Productivity', icon: 'fa-solid fa-pencil', iconBg: '#fbbc05', price: 'Free', description: 'Simple note taking and drawing.' },
        { id: 'system', name: 'System Manager', category: 'Utilities', icon: 'fa-solid fa-display', iconBg: '#5865F2', price: '$1.99', description: 'Monitor system performance.' },
        { id: 'maps', name: 'Map Navigator', category: 'Utilities', icon: 'fa-solid fa-map-location-dot', iconBg: '#34a853', price: 'Free', description: 'Navigation and local exploration.' },
        { id: 'whatsapp', name: 'Chat App', category: 'Communication', icon: 'fa-brands fa-whatsapp', iconBg: '#0f9d58', price: 'Free', description: 'Encrypted messaging service.' },
        { id: 'translator', name: 'Translator', category: 'Utilities', icon: 'fa-solid fa-language', iconBg: '#4285F4', price: 'Free', description: 'Translate text between languages.' }
    ];

    function getAppContent(appId, appName) {
        switch (appId) {
            case 'calendar':
                return `
                    <div class="calendar-app">
                        <div class="calendar-sidebar">
                            <button class="create-event-btn"><i class="fas fa-plus"></i> New Event</button>
                            <div class="create-event-menu hidden">
                                <h3>Create Event</h3>
                                <input type="text" placeholder="Event Title" id="event-title-input">
                                <input type="date" id="event-date-input" value="${new Date().toISOString().substring(0, 10)}">
                                <select id="event-calendar-select">
                                    <option value="blue">Work</option>
                                    <option value="green">Personal</option>
                                    <option value="yellow">Holidays</option>
                                </select>
                                <button id="save-event-btn">Save</button>
                            </div>
                            <div class="calendar-list">
                                <h4>My Calendars</h4>
                                <ul>
                                    <li><span class="calendar-color-dot" style="background-color: var(--accent-blue);"></span>Work</li>
                                    <li><span class="calendar-color-dot" style="background-color: var(--accent-green);"></span>Personal</li>
                                    <li><span class="calendar-color-dot" style="background-color: var(--accent-yellow);"></span>Holidays</li>
                                </ul>
                            </div>
                        </div>
                        <div class="calendar-main">
                            <div class="calendar-header">
                                <div class="nav-controls">
                                    <button class="cal-nav-btn" data-action="prev"><i class="fas fa-chevron-left"></i></button>
                                    <button class="cal-today-btn" data-action="today">Today</button>
                                    <button class="cal-nav-btn" data-action="next"><i class="fas fa-chevron-right"></i></button>
                                </div>
                                <h3 id="calendar-month-year"></h3>
                            </div>
                            <div class="calendar-grid-header month-view-header">
                                <div class="calendar-day-header">Sun</div>
                                <div class="calendar-day-header">Mon</div>
                                <div class="calendar-day-header">Tue</div>
                                <div class="calendar-day-header">Wed</div>
                                <div class="calendar-day-header">Thu</div>
                                <div class="calendar-day-header">Fri</div>
                                <div class="calendar-day-header">Sat</div>
                            </div>
                            <div class="calendar-grid-body" id="calendar-month-view">
                            </div>
                        </div>
                    </div>
                `;
case 'translator':
                return `
                    <div class="translator-app">
                        <div class="translator-header">
                            <select id="translator-lang-from" class="translator-lang-select">
                                <option value="auto">Detect Language</option>
                                <option value="en">🇺🇸 English</option>
                                <option value="es">🇪🇸 Spanish</option>
                                <option value="fr">🇫🇷 French</option>
                                <option value="de">🇩🇪 German</option>
                                <option value="ja">🇯🇵 Japanese</option>
                                <option value="it">🇮🇹 Italian</option>
                                <option value="pt">🇵🇹 Portuguese</option>
                                <option value="ru">🇷🇺 Russian</option>
                                <option value="zh-CN">🇨🇳 Chinese (Simplified)</option>
                                <option value="hi">🇮🇳 Hindi</option>
                                <option value="ar">🇸🇦 Arabic</option>
                            </select>
                            <button id="translator-swap" class="translator-swap-btn" title="Swap languages"><i class="fa-solid fa-right-left"></i></button>
                            <select id="translator-lang-to" class="translator-lang-select">
                                <option value="en">🇺🇸 English</option>
                                <option value="es">🇪🇸 Spanish</option>
                                <option value="fr">🇫🇷 French</option>
                                <option value="de">🇩🇪 German</option>
                                <option value="ja">🇯🇵 Japanese</option>
                                <option value="it">🇮🇹 Italian</option>
                                <option value="pt">🇵🇹 Portuguese</option>
                                <option value="ru">🇷🇺 Russian</option>
                                <option value="zh-CN">🇨🇳 Chinese (Simplified)</option>
                                <option value="hi">🇮🇳 Hindi</option>
                                <option value="ar">🇸🇦 Arabic</option>
                            </select>
                        </div>
                        <div class="translator-body">
                            <textarea id="translator-input" class="translator-textarea" placeholder="Enter text..."></textarea>
                            <textarea id="translator-output" class="translator-textarea" placeholder="Translation..." readonly></textarea>
                        </div>
                        <div class="translator-footer">
                            <button id="translator-translate-btn" class="translator-translate-btn">Translate</button>
                        </div>
                    </div>
                `;
            case 'weather':
                return `
                    <div class="weather-app-container">
                        <div class="weather-input-section">
                            <input type="text" class="city-input" placeholder="Search city...">
                            <button class="search-btn"><i class="fas fa-search"></i></button>
                            <button class="location-btn"><i class="fas fa-location-arrow"></i></button>
                        </div>
                        <div class="weather-status">Loading weather data...</div>
                        
                        <div class="weather-info-box">
                            <h2 class="weather-city"></h2>
                            <img class="weather-icon" src="https://openweathermap.org/img/wn/01d@4x.png" alt="Weather Icon">
                            <div class="temp-section">
                                <span class="weather-temp">--°C</span>
                            </div>
                            <p class="weather-description"></p>

                            <div class="weather-details-grid">
                                <div class="detail-box">
                                    <i class="fas fa-tint"></i>
                                    <span class="weather-humidity">--%</span>
                                    <p>Humidity</p>
                                </div>
                                <div class="detail-box">
                                    <i class="fas fa-wind"></i>
                                    <span class="weather-wind">-- km/h</span>
                                    <p>Wind Speed</p>
                                </div>
                                <div class="detail-box">
                                    <i class="fas fa-thermometer-half"></i>
                                    <span class="weather-feels">--°C</span>
                                    <p>Feels Like</p>
                                </div>
                                <div class="detail-box">
                                    <i class="fas fa-tachometer-alt"></i>
                                    <span class="weather-pressure">-- hPa</span>
                                    <p>Pressure</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            case 'appstore':
                return `
                    <div class="appstore-app-container">
                        <div class="appstore-header">
                            <h1>App Store</h1>
                            <div class="appstore-search">
                                <i class="fas fa-search"></i>
                                <input type="text" placeholder="Search apps, games, and themes...">
                            </div>
                        </div>
                        <div class="appstore-content">
                            <div class="app-list" id="appstore-app-list">
                            </div>
                        </div>
                    </div>
                `;
            case 'browser':
                return `
                    <div class="browser-app">
                        <div class="browser-content">
                            <iframe id="browser-iframe" src="https://browser.rammerhead.org"></iframe>
                        </div>
                    </div>
                `;
            case 'settings':
                return `
                    <div class="settings-app">
                        <div class="settings-sidebar">
                            <div class="settings-nav-item active" data-tab="display">
                                <i class="fas fa-desktop"></i> Display & Appearance
                            </div>
                            <div class="settings-nav-item" data-tab="sound">
                                <i class="fas fa-volume-up"></i> Sound
                            </div>
                            <div class="settings-nav-item" data-tab="network">
                                <i class="fas fa-wifi"></i> Network & Internet
                            </div>
                            <div class="settings-nav-item" data-tab="apps">
                                <i class="fas fa-th-large"></i> Applications
                            </div>
                            <div class="settings-nav-item" data-tab="about">
                                <i class="fas fa-info-circle"></i> About System
                            </div>
                        </div>
                        <div class="settings-main">
                            <div id="settings-content">
                                ${getDisplayContent()} 
                            </div>
                        </div>
                    </div>
                `;
case 'gmail':
                return `
                    <div class="gmail-app">
                        <div class="email-sidebar">
                            <div class="mail-account-box">
                                <h3 id="mail-account-title">Your Temporary Inbox</h3>
                                <p id="mail-account-address">Loading...</p>
                                <div class="mail-create-form">
                                    <input type="text" id="mail-username-input" placeholder="Enter a username">
                                    <select id="mail-domain-select"></select>
                                </div>
                                <button id="mail-create-btn">Create Account</button>
                                <button id="mail-refresh-btn" class="hidden"><i class="fa-solid fa-rotate"></i> Refresh</button>
                            </div>
                            <div class="email-list">
                                <p class="email-list-status">Create an account to see emails.</p>
                            </div>
                        </div>
                        <div class="email-content">
                            <div class="empty-state">
                                <i class="fas fa-envelope-open-text" style="font-size: 48px; margin-bottom: 15px;"></i>
                                <p>Select an email from the list to read it.</p>
                            </div>
                        </div>
                    </div>
                `;
            case 'files':
            case 'pictures':
            case 'sound':
            case 'record':
            case 'system':
            case 'maps':
            case 'whatsapp':
                return `<p>Welcome to the ${appName} app!</p><p>This is a placeholder for a functional application. App ID: ${appId}</p>`;
            default:
                return `<p>Welcome to the ${appName} app!</p><p>This is a placeholder content area. App ID: ${appId}</p>`;
        }
    }

    function renderAppStoreApps(windowElement) {
        const appListContainer = windowElement.querySelector('#appstore-app-list');
        if (!appListContainer) return;

        appListContainer.innerHTML = '<h2>Available Applications</h2>';

        appCatalog
            .filter(app => app.id !== 'appstore')
            .forEach(app => {
                const isInstalled = installedApps.includes(app.id);
                const isSystem = app.isSystemApp;

                let buttonText = 'Get';
                let buttonAction = 'install';
                let buttonStyle = `background: var(--accent-blue); color: var(--white);`;
                let buttonDisabled = false;

                if (isInstalled) {
                    if (isSystem) {
                        buttonText = 'Installed';
                        buttonDisabled = true;
                    } else {
                        buttonText = 'Uninstall';
                        buttonAction = 'uninstall';
                        buttonStyle = `background: var(--accent-red); color: var(--white);`;
                    }
                } else {
                    if (app.price !== 'Free') {
                        buttonText = app.price;
                    }
                }

                const appCard = document.createElement('div');
                appCard.classList.add('app-card');
                appCard.setAttribute('data-app-id', app.id);

                appCard.innerHTML = `
                <div class="app-icon" style="background: ${app.iconBg};"><i class="${app.icon}"></i></div>
                <div class="app-info">
                    <h3>${app.name}</h3>
                    <p>${app.description || app.category + ' App'}</p>
                    <small>${app.category}</small>
                </div>
                <button class="install-btn" data-action="${buttonAction}" style="${buttonStyle}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button>
            `;
                appListContainer.appendChild(appCard);
            });

        windowElement.querySelectorAll('.install-btn').forEach(button => {
            if (button.disabled) return;

            button.addEventListener('click', (e) => {
                const appId = e.target.closest('.app-card').getAttribute('data-app-id');
                const app = appCatalog.find(a => a.id === appId);
                if (!app) return;

                const action = e.target.getAttribute('data-action');

                if (action === 'install') {
                    if (!installedApps.includes(appId)) {
                        installedApps.push(appId);
                        saveInstalledApps();
                        showModal("Installation Complete", `${app.name} has been installed!`);
                        renderAppStoreApps(windowElement);
                        renderInstalledAppsInLauncher();
                    }
                } else if (action === 'uninstall') {
                    uninstallApp(appId, app.name, () => {
                        renderAppStoreApps(windowElement);
                    });
                }
            });
        });
    }

    function uninstallApp(appId, appName, callback = () => { }) {
        const app = appCatalog.find(a => a.id === appId);
        if (app && app.isSystemApp) {
            showModal("Uninstall Blocked", `${appName} is a system app and cannot be uninstalled.`);
            return;
        }

        showModal("Confirm Uninstall", `Are you sure you want to uninstall ${appName}?`, true, () => {
            installedApps = installedApps.filter(id => id !== appId);
            saveInstalledApps();

            if (pinnedApps.includes(appId)) {
                pinnedApps = pinnedApps.filter(id => id !== appId);
                savePinnedApps();
            }

            showModal("Uninstalled", `${appName} has been uninstalled.`);

            renderInstalledAppsInLauncher();
            renderTaskbarIcons();

            if (openApps[appId]) {
                openApps[appId].element.querySelector('.close-btn').click();
            }

            callback();
        });
    }

    function initializeAppStoreListeners(windowElement) {
        renderAppStoreApps(windowElement);

        const searchInput = windowElement.querySelector('.appstore-search input');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = windowElement.querySelectorAll('.app-card');
            cards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                if (name.includes(query) || description.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    const calendarEvents = [
        { title: 'Project Review', date: '2025-11-17', color: 'blue' },
        { title: 'Team Lunch', date: '2025-11-19', color: 'green' },
        { title: 'Holiday', date: '2025-12-25', color: 'yellow' },
    ];

    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getEventsForDay(date) {
        const dateString = date.toISOString().substring(0, 10);
        return calendarEvents.filter(event => event.date === dateString);
    }

    function renderCalendar(windowElement, date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();

        const monthYearDisplay = windowElement.querySelector('#calendar-month-year');
        const gridBody = windowElement.querySelector('#calendar-month-view');

        if (!monthYearDisplay || !gridBody) return;

        monthYearDisplay.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        gridBody.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = getDaysInMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);

        for (let i = 0; i < firstDayOfMonth; i++) {
            const prevDayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'day-dimmed');
            dayElement.innerHTML = prevDayNum;
            gridBody.appendChild(dayElement);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');

            const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            if (isToday) {
                dayElement.classList.add('day-today');
            }

            let events = getEventsForDay(currentDate);
            let eventsHTML = events.map(event => `<div class="calendar-event event-${event.color}">${event.title}</div>`).join('');

            dayElement.innerHTML = `<span class="day-number">${i}</span>${eventsHTML}`;
            gridBody.appendChild(dayElement);
        }

        const totalCells = firstDayOfMonth + daysInMonth;
        let cellsToFill = 42 - totalCells;

        for (let i = 1; i <= cellsToFill; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'day-dimmed');
            dayElement.innerHTML = i;
            gridBody.appendChild(dayElement);
        }
    }


    function initializeCalendarListeners(windowElement) {
        let activeDate = new Date();
        const createEventBtn = windowElement.querySelector('.create-event-btn');
        const createEventMenu = windowElement.querySelector('.create-event-menu');
        const saveEventBtn = windowElement.querySelector('#save-event-btn');

        renderCalendar(windowElement, activeDate);

        windowElement.querySelector('[data-action="prev"]').addEventListener('click', () => {
            activeDate.setMonth(activeDate.getMonth() - 1);
            renderCalendar(windowElement, activeDate);
        });

        windowElement.querySelector('[data-action="next"]').addEventListener('click', () => {
            activeDate.setMonth(activeDate.getMonth() + 1);
            renderCalendar(windowElement, activeDate);
        });

        windowElement.querySelector('[data-action="today"]').addEventListener('click', () => {
            activeDate = new Date();
            renderCalendar(windowElement, activeDate);
        });

        createEventBtn.addEventListener('click', () => {
            createEventMenu.classList.toggle('hidden');
        });

        saveEventBtn.addEventListener('click', () => {
            const titleInput = windowElement.querySelector('#event-title-input');
            const dateInput = windowElement.querySelector('#event-date-input');
            const colorSelect = windowElement.querySelector('#event-calendar-select');

            const newEvent = {
                title: titleInput.value || 'Untitled Event',
                date: dateInput.value,
                color: colorSelect.value
            };

            if (newEvent.title && newEvent.date) {
                calendarEvents.push(newEvent);
                createEventMenu.classList.add('hidden');
                titleInput.value = '';
                renderCalendar(windowElement, activeDate);
                showModal("Event Saved", `Event "${newEvent.title}" saved for ${newEvent.date}!`);
            } else {
                showModal("Error", 'Please provide a title and date for the event.');
            }
        });
    }

    function initializeWeatherListeners(windowElement) {
        const cityInput = windowElement.querySelector('.city-input');
        const searchBtn = windowElement.querySelector('.search-btn');
        const locationBtn = windowElement.querySelector('.location-btn');

        const statusEl = windowElement.querySelector('.weather-status');
        const cityEl = windowElement.querySelector('.weather-city');
        const iconEl = windowElement.querySelector('.weather-icon');
        const tempEl = windowElement.querySelector('.weather-temp');
        const descEl = windowElement.querySelector('.weather-description');
        const humidityEl = windowElement.querySelector('.weather-humidity');
        const windEl = windowElement.querySelector('.weather-wind');
        const feelsEl = windowElement.querySelector('.weather-feels');
        const pressureEl = windowElement.querySelector('.weather-pressure');

        let api;

        function fetchData() {
            statusEl.innerText = "Getting weather details...";
            fetch(api)
                .then(res => res.json())
                .then(result => weatherDetails(result))
                .catch(() => {
                    statusEl.innerText = "Something went wrong";
                });
        }

        function weatherDetails(info) {
            if (info.cod == "404") {
                statusEl.innerText = `${cityInput.value} isn't a valid city name`;
            } else {
                cityEl.innerText = `${info.name}, ${info.sys.country}`;
                tempEl.innerText = `${Math.round(info.main.temp)}°C`;
                descEl.innerText = info.weather[0].description;
                humidityEl.innerText = `${info.main.humidity}%`;
                windEl.innerText = `${info.wind.speed} km/h`;
                feelsEl.innerText = `${Math.round(info.main.feels_like)}°C`;
                pressureEl.innerText = `${info.main.pressure} hPa`;
                iconEl.src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@4x.png`;
                statusEl.innerText = "";
                cityInput.value = "";
            }
        }

        function requestApi(city) {
            api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=7245f93fbbeb72a62a17c68a0bb576e6`;
            fetchData();
        }

        function onSuccess(position) {
            const { latitude, longitude } = position.coords;
            api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=7245f93fbbeb72a62a17c68a0bb576e6`;
            fetchData();
        }

        function onError(error) {
            statusEl.innerText = error.message;
        }

        searchBtn.addEventListener('click', () => {
            if (cityInput.value) {
                requestApi(cityInput.value);
            }
        });

        cityInput.addEventListener('keyup', (e) => {
            if (e.key == "Enter" && cityInput.value) {
                requestApi(cityInput.value);
            }
        });

        locationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
            } else {
                showModal("Error", "Your browser does not support geolocation API");
            }
        });

        requestApi("Mölln");
    }

    function initializeSettingsListeners(windowElement) {
        const navItems = windowElement.querySelectorAll('.settings-nav-item');
        const contentContainer = windowElement.querySelector('#settings-content');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                let contentHTML = '';

                switch (tab) {
                    case 'display':
                        contentHTML = getDisplayContent();
                        break;
                    case 'sound':
                        contentHTML = `
                            <h2>Sound Settings</h2>
                            <div class="settings-section" data-section="sound">
                                <h3>Volume Control</h3>
                                <div class="setting-row">
                                    <div class="setting-info">
                                        <p>Master Volume</p>
                                        <small>Adjust the overall system volume.</small>
                                    </div>
                                    <div class="setting-control" style="width: 150px;">
                                        <input type="range" min="0" max="100" value="75">
                                    </div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'network':
                        contentHTML = `
                            <h2>Network & Internet</h2>
                            <div class="settings-section" data-section="network">
                                <h3>Connections</h3>
                                <div class="setting-row">
                                    <div class="setting-info">
                                        <p>Wi-Fi</p>
                                        <small>Status: Connected (HomeNet 5G)</small>
                                    </div>
                                    <div class="setting-control">
                                        <label class="switch">
                                            <input type="checkbox" checked>
                                            <span class="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'apps':
                        contentHTML = `
                            <h2>Application Management</h2>
                            <div class="settings-section" data-section="apps">
                                <h3>Installed Apps (Total: ${installedApps.length})</h3>
                                ${installedApps.map(appId => {
                            const app = appCatalog.find(a => a.id === appId);
                            if (!app) return '';
                            const isSystem = app.isSystemApp;
                            return `
                                    <div class="setting-row">
                                        <div class="setting-info">
                                            <p>${app.name}</p>
                                            <small>${app.category} App</small>
                                        </div>
                                        <div class="setting-control">
                                            <button class="uninstall-btn" data-app-id="${appId}" style="background: ${isSystem ? 'var(--icon-bg-grey)' : 'var(--accent-red)'}; color: ${isSystem ? 'var(--text-dim)' : 'var(--white)'}; padding: 8px 12px; border-radius: 8px;" ${isSystem ? 'disabled' : ''}>${isSystem ? 'System' : 'Uninstall'}</button>
                                        </div>
                                    </div>
                                    `;
                        }).join('')}
                                <div class="setting-row">
                                    <div class="setting-info">
                                        <p>More Apps</p>
                                        <small>Discover and install new applications.</small>
                                    </div>
                                    <div class="setting-control">
                                        <button id="open-app-store-btn" style="background: var(--accent-blue); color: var(--white); padding: 8px 12px; border-radius: 8px;">Open App Store</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        break;
                    case 'about':
                        contentHTML = `
                            <h2>About This OS</h2>
                            <div class="settings-section" data-section="about">
                                <div class="setting-row">
                                    <div class="setting-info">
                                        <p>Operating System</p>
                                        <small>NyxoraOS (Desktop Environment Simulation)</small>
                                    </div>
                                </div>
                            </div>
                        `;
                        break;
                }

                contentContainer.innerHTML = contentHTML;

                if (tab === 'display') {
                    setupDisplaySettingsListeners(windowElement);
                }

                if (tab === 'apps') {
                    const appStoreBtn = windowElement.querySelector('#open-app-store-btn');
                    if (appStoreBtn) {
                        appStoreBtn.style.background = document.documentElement.style.getPropertyValue('--accent-blue') || accentColorValue;
                        appStoreBtn.addEventListener('click', () => {
                            createNewWindow('appstore', 'App Store');
                        });
                    }

                    windowElement.querySelectorAll('.uninstall-btn').forEach(button => {
                        if (button.disabled) return;
                        button.addEventListener('click', (e) => {
                            const appIdToUninstall = e.target.getAttribute('data-app-id');
                            const appName = appCatalog.find(app => app.id === appIdToUninstall)?.name;

                            uninstallApp(appIdToUninstall, appName, () => {
                                item.click();
                            });
                        });
                    });
                }
            });
        });

        const initialActiveItem = windowElement.querySelector('.settings-nav-item.active');
        if (initialActiveItem) {
            initialActiveItem.click();
        } else {
            setupDisplaySettingsListeners(windowElement);
        }
    }

    const contextDesktopItems = contextMenu.querySelectorAll('#context-view, #context-sort, #context-refresh, #context-desktop-sep, #context-display-settings, #context-personalize');
    const contextAppItems = contextMenu.querySelectorAll('#context-app-sep, #context-open-app, #context-pin, #context-unpin, #context-close-app');

    function showAppContextMenu(event, appId) {
        event.preventDefault();
        event.stopPropagation();
        hideAllOverlays();

        const app = appCatalog.find(a => a.id === appId);
        if (!app) return;

        contextDesktopItems.forEach(item => item.style.display = 'none');
        contextAppItems.forEach(item => item.style.display = 'flex');

        const pinItem = document.getElementById('context-pin');
        const unpinItem = document.getElementById('context-unpin');
        const closeItem = document.getElementById('context-close-app');
        const openItem = document.getElementById('context-open-app');

        if (pinnedApps.includes(appId)) {
            pinItem.style.display = 'none';
            unpinItem.style.display = app.isSystemApp ? 'none' : 'flex';
        } else {
            pinItem.style.display = 'flex';
            unpinItem.style.display = 'none';
        }

        const isRunning = openApps[appId] && !openApps[appId].isMinimized;
        closeItem.style.display = isRunning ? 'flex' : 'none';
        openItem.style.display = isRunning ? 'none' : 'flex';

        pinItem.onclick = () => {
            if (!pinnedApps.includes(appId)) {
                pinnedApps.push(appId);
                savePinnedApps();
                renderTaskbarIcons();
            }
            contextMenu.classList.add('hidden');
        };

        unpinItem.onclick = () => {
            if (!app.isSystemApp) {
                pinnedApps = pinnedApps.filter(id => id !== appId);
                savePinnedApps();
                renderTaskbarIcons();
            }
            contextMenu.classList.add('hidden');
        };

        closeItem.onclick = () => {
            if (openApps[appId]) {
                openApps[appId].element.querySelector('.close-btn').click();
            }
            contextMenu.classList.add('hidden');
        };

        openItem.onclick = () => {
            createNewWindow(appId, app.name);
            contextMenu.classList.add('hidden');
        };

        positionContextMenu(event);
    }

    function positionContextMenu(event) {
        let x = event.clientX;
        let y = event.clientY;

        contextMenu.style.display = 'block';
        let menuWidth = contextMenu.offsetWidth;
        let menuHeight = contextMenu.offsetHeight;
        contextMenu.style.display = '';

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 5;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 5;
        }

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('hidden');
    }



    desktopContainer.addEventListener('contextmenu', (event) => {
        const targetIcon = event.target.closest('.dock-icon');
        const targetWindow = event.target.closest('.window');

        if (targetIcon) {
            const appId = targetIcon.getAttribute('data-app-id');
            showAppContextMenu(event, appId);
        } else if (!targetWindow) {
            event.preventDefault();
            hideAllOverlays();

            contextDesktopItems.forEach(item => item.style.display = 'flex');
            contextAppItems.forEach(item => item.style.display = 'none');

            positionContextMenu(event);
        }
    });

    contextMenu.addEventListener('click', (event) => event.stopPropagation());

    contextMenu.querySelectorAll('.submenu .menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            showModal("Action", `Action: ${e.target.textContent.trim()} selected.`);
            contextMenu.classList.add('hidden');
        });
    });

    document.getElementById('context-refresh').addEventListener('click', () => {
        renderInstalledAppsInLauncher();
        renderTaskbarIcons();
        contextMenu.classList.add('hidden');
    });

    document.getElementById('context-display-settings').addEventListener('click', () => {
        createNewWindow('settings', 'Settings');
        contextMenu.classList.add('hidden');
    });

    document.getElementById('context-personalize').addEventListener('click', () => {
        createNewWindow('settings', 'Settings');
        contextMenu.classList.add('hidden');
    });

    function showModal(title, message, showConfirm = false, onConfirm = () => { }) {
        let modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.remove();
        }

        modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        modalContent.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="modal-buttons">
                ${showConfirm ? '<button class="modal-button secondary" id="modal-cancel">Cancel</button>' : ''}
                <button class="modal-button primary" id="modal-ok">${showConfirm ? 'Confirm' : 'OK'}</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);
        desktopContainer.appendChild(modalOverlay);

        const okBtn = modalContent.querySelector('#modal-ok');
        const cancelBtn = modalContent.querySelector('#modal-cancel');

        const closeModal = () => {
            modalOverlay.remove();
        };

        okBtn.addEventListener('click', () => {
            onConfirm();
            closeModal();
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    renderInstalledAppsInLauncher();
    renderTaskbarIcons();
});