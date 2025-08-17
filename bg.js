const loadScript = (src) =>
    new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });

// Add these module-scoped variables at the top of your bg.js
let vantaEffect = null;
let currentWallpaperType = localStorage.getItem("wallpaper") || "fog";
let currentWallpaperColor = localStorage.getItem("wallpaper_color") || "#bb00ff"; // Default color, includes #
let vantaLoaded = false; // Add this flag to track if VANTA is loaded

let originalVantaRender = null;
let lastRenderTime = 0;
const frameSkip = 2;
const perfSettings = { fps: 60 }; // Default FPS setting
const frameInterval = 1000 / perfSettings.fps; // Dynamically computed frame interval
// Ensure isLowPowerDevice function is defined (using the one from your snippets)
function isLowPowerDevice() {
    // This function might be defined elsewhere in your bg.js or globally.
    // Using the definition from your provided snippets:
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Basic check for mobile devices or data saver mode
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
        (navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType?.includes('2g'))) ||
        (localStorage.getItem('performance_mode') === 'low');
}

// Ensure darkenColor function is defined (using the one from your snippets)
const darkenColor = (color, amount) => {
    const r = Math.max(0, (color >> 16) - amount);
    const g = Math.max(0, ((color >> 8) & 0xff) - amount);
    const b = Math.max(0, (color & 0xff) - amount);
    return (r << 16) | (g << 8) | b;
};

// Only load what we need based on selected wallpaper
function loadRequiredScripts() {
    const wallpaper = localStorage.getItem("wallpaper") || "fog";
    const scripts = ["https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"];

    // Add specific effect script based on wallpaper selection
    if (wallpaper === "waves") {
        scripts.push("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js");
    } else if (wallpaper === "birds") {
        scripts.push("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js");
    } else if (wallpaper === "net") {
        scripts.push("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js");
    } else if (wallpaper === "globe") {
        scripts.push("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js");
    } else {
        scripts.push("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js");
    }

    return scripts;
}

// Replace the existing initializeVanta function with this updated version
function initializeVanta() {
    // Check if VANTA is available - if not, show fallback
    if (typeof VANTA === 'undefined') {
        console.error("VANTA library not loaded yet");
        document.getElementById("bg").style.background = "linear-gradient(to bottom, #000000, #240033)";
        document.getElementById("bg").style.opacity = 1;
        return;
    }

    if (vantaEffect) {
        vantaEffect.destroy();
        vantaEffect = null;
    }

    const wallpaperColorForVanta = currentWallpaperColor.startsWith("#")
        ? currentWallpaperColor.substring(1)
        : currentWallpaperColor;

    const lowPower = isLowPowerDevice();
    const perfSettings = lowPower ? {
        fps: 20, scale: 0.75, density: 0.5
    } : {
        fps: 60, scale: 1.0, density: 1.0
    };

    try {
        const vantaOptionsBase = {
            el: "#bg",
            mouseControls: !lowPower,
            touchControls: !lowPower,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
        };

        // Determine the integer color value for Vanta
        const vantaColorInt = parseInt(wallpaperColorForVanta, 16);

        // Use the proper VANTA effect based on current wallpaper type
        switch (currentWallpaperType) {
            case "waves":
                vantaEffect = VANTA.WAVES({
                    ...vantaOptionsBase,
                    scale: perfSettings.scale,
                    scaleMobile: perfSettings.scale * 0.75,
                    color: darkenColor(vantaColorInt, 150),
                    waveHeight: lowPower ? 12 : 22.5,
                    waveSpeed: lowPower ? 0.5 : 1.05,
                    zoom: lowPower ? 0.8 : 0.94,
                    shininess: lowPower ? 10 : 20.0,
                });
                break;
            case "birds":
                vantaEffect = VANTA.BIRDS({
                    ...vantaOptionsBase,
                    scale: perfSettings.scale,
                    scaleMobile: perfSettings.scale * 0.75,
                    backgroundColor: 0x0,
                    color1: vantaColorInt,
                    color2: 0xffffff,
                    colorMode: "lerp",
                    quantity: lowPower ? 2 : 4,
                    backgroundAlpha: 0,
                });
                break;
            case "net":
                vantaEffect = VANTA.NET({
                    ...vantaOptionsBase,
                    scale: perfSettings.scale,
                    scaleMobile: perfSettings.scale * 0.75,
                    color: vantaColorInt,
                    backgroundColor: 0x0,
                    points: lowPower ? 5 : 10, // Adjusted from snippets
                    maxDistance: lowPower ? 15 : 20, // Adjusted from snippets
                    spacing: lowPower ? 18 : 15, // Adjusted from snippets
                });
                break;
            case "globe":
                vantaEffect = VANTA.GLOBE({
                    ...vantaOptionsBase,
                    scale: perfSettings.scale,
                    scaleMobile: perfSettings.scale * 0.75,
                    color: vantaColorInt,
                    backgroundColor: 0x0,
                    size: lowPower ? 0.8 : 1.0, // Adjusted from snippets
                    points: lowPower ? 3 : 6, // Adjusted from snippets
                });
                break;
            case "fog":
            default:
                // Check if FOG effect is available, if not, load it dynamically
                if (typeof VANTA.FOG !== 'function') {
                    console.log("Loading FOG effect dynamically...");
                    document.getElementById("bg").style.background = "linear-gradient(to bottom, #000000, #240033)";
                    document.getElementById("bg").style.opacity = 1;

                    // Load the FOG script dynamically
                    loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js")
                        .then(() => {
                            // Try initializing again after script loads
                            setTimeout(initializeVanta, 100);
                        })
                        .catch(err => {
                            console.error("Failed to load FOG effect:", err);
                        });
                    return;
                }

                vantaEffect = VANTA.FOG({
                    ...vantaOptionsBase,
                    highlightColor: 0x0,
                    midtoneColor: vantaColorInt,
                    lowlightColor: 0x000000,
                    baseColor: 0x000000,
                    blurFactor: lowPower ? 0.4 : 0.6,
                    speed: lowPower ? 1 : 2,
                    zoom: lowPower ? 0.3 : 0.5,
                    pixelRatio: lowPower ? 0.5 : 1
                });
                break;
        }

        if (vantaEffect && vantaEffect.renderer && typeof vantaEffect.renderer.render === 'function') {
            originalVantaRender = vantaEffect.renderer.render.bind(vantaEffect.renderer);
            let frameCount = 0;
            lastRenderTime = performance.now();

            vantaEffect.renderer.render = function () {
                const now = performance.now();
                frameCount++;
                if (frameCount % frameSkip === 0 && now - lastRenderTime >= frameInterval) {
                    lastRenderTime = now;
                    originalVantaRender.apply(vantaEffect.renderer, arguments);
                }
            };
        }

        // Properly handle visibility changes (from snippet line 205)
        // This listener should be managed carefully if initializeVanta is called multiple times.
        // For simplicity, we assume it's okay to re-add or that VANTA handles multiple listeners on document.
        // A more robust solution would remove the old listener before adding a new one if necessary.
        document.removeEventListener('visibilitychange', handleVisibilityChange); // Remove previous if any
        document.addEventListener('visibilitychange', handleVisibilityChange);

        document.getElementById("bg").style.opacity = 1;

    } catch (error) {
        console.error("Error initializing Vanta effect:", error);
        document.getElementById("bg").style.background = "linear-gradient(to bottom, #000000, #240033)";
        document.getElementById("bg").style.opacity = 1;
    }
}

// Extracted visibility change handler
function handleVisibilityChange() {
    if (!vantaEffect || !vantaEffect.options) return;

    const lowPower = isLowPowerDevice(); // Recalculate or use stored
    // Store original speeds/values when effect is created or use defaults
    const originalSpeeds = {
        waves: { waveSpeed: lowPower ? 0.5 : 1.05 },
        fog: { speed: lowPower ? 1 : 2 },
        net: { spacing: lowPower ? 18 : 15 },
        birds: { quantity: lowPower ? 2 : 4 },
        globe: { points: lowPower ? 3 : 6 }
    };

    if (document.hidden) {
        if (currentWallpaperType === "waves" && vantaEffect.options.waveSpeed !== undefined) vantaEffect.options.waveSpeed = 0;
        else if (currentWallpaperType === "fog" && vantaEffect.options.speed !== undefined) vantaEffect.options.speed = 0;
        else if (currentWallpaperType === "net" && vantaEffect.options.spacing !== undefined) vantaEffect.options.spacing = 999999; // Effectively freeze
        else if (currentWallpaperType === "birds" && vantaEffect.options.quantity !== undefined) vantaEffect.options.quantity = 0;
        else if (currentWallpaperType === "globe" && vantaEffect.options.points !== undefined) vantaEffect.options.points = 0;
    } else { // document visible
        const speeds = originalSpeeds[currentWallpaperType];
        if (speeds) {
            for (const key in speeds) {
                if (vantaEffect.options[key] !== undefined) {
                    vantaEffect.options[key] = speeds[key];
                }
            }
        }
        // Some Vanta effects might need a manual update after changing options
        if (typeof vantaEffect.applyOptions === 'function') {
            vantaEffect.applyOptions();
        } else if (typeof vantaEffect.resize === 'function') { // Or trigger a resize
            vantaEffect.resize();
        }
    }
}


// This function will be called by index.js's updateSettings
window.updateWallpaperColor = function (newColorWithHash) {
    if (newColorWithHash && newColorWithHash !== currentWallpaperColor) {
        currentWallpaperColor = newColorWithHash;
        localStorage.setItem("wallpaper_color", newColorWithHash); // Keep localStorage in sync
        if (vantaLoaded) { // Only initialize if VANTA is loaded
            initializeVanta();
        }
    }
};

// Optional: if wallpaper type can also be changed dynamically without reload
window.updateWallpaperType = function (newType) {
    if (newType && newType !== currentWallpaperType) {
        currentWallpaperType = newType;
        localStorage.setItem("wallpaper", newType); // Keep localStorage in sync
        if (vantaLoaded) { // Only initialize if VANTA is loaded
            initializeVanta();
        }
    }
};

// Start loading required scripts
loadRequiredScripts()
    .reduce(
        (promiseChain, script) => promiseChain.then(() => loadScript(script)),
        Promise.resolve()
    )
    .then(() => {
        vantaLoaded = true; // Mark VANTA as loaded
        initializeVanta(); // Initialize once scripts are loaded
    })
    .catch(error => {
        console.error("Failed to load background:", error);
        document.getElementById("bg").style.background = "linear-gradient(to bottom, #000000, #240033)";
        document.getElementById("bg").style.opacity = 1;
    });

// Initial setup on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Don't call initializeVanta() here, wait for scripts to load

    // Performance toggle setup (from snippet line 243)
    // This part should run once.
    if (!document.getElementById('performance-toggle')) {
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer) { // Check if the container exists on the current page
            const perfToggleHTML = `
              <h3>Background Performance</h3>
              <select id="performance-toggle">
                <option value="auto" ${!localStorage.getItem('performance_mode') || localStorage.getItem('performance_mode') === 'auto' ? 'selected' : ''}>Auto Detect</option>
                <option value="high" ${localStorage.getItem('performance_mode') === 'high' ? 'selected' : ''}>High Quality</option>
                <option value="low" ${localStorage.getItem('performance_mode') === 'low' ? 'selected' : ''}>Performance Mode</option>
              </select>
            `;
            // Check if a similar toggle already exists to prevent duplicates if script runs multiple times
            if (!settingsContainer.querySelector('#performance-toggle')) {
                const perfToggleDiv = document.createElement('div');
                perfToggleDiv.innerHTML = perfToggleHTML;
                settingsContainer.appendChild(perfToggleDiv.firstElementChild); // Append the select itself or its container
                settingsContainer.appendChild(perfToggleDiv.children[1]);


                document.getElementById('performance-toggle').addEventListener('change', (e) => {
                    localStorage.setItem('performance_mode', e.target.value);
                    window.location.reload(); // Reloading is the simplest way to apply performance changes
                });
            }
        }
    }
});
