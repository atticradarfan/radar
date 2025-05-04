// Initialize these variables for play button
window.selectedRadarSite = null;
window.selectedRadarProduct = null;


const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

let win

function createWindow() {
    // Create the browser window.
    //win = new BrowserWindow({ width: 800, height: 600 })
    win = new BrowserWindow({
        show: false,
        //icon: path.join(__dirname, 'logo.png'),
    });
    win.maximize();
    win.on('shown', () => { win.focus() });
    win.show();
    //win.webContents.openDevTools()

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
}
app.on('ready', createWindow)

// Play Button
async function startRadarPlayback() {
    const frameCount = 10; // Number of frames to play
    const delayMs = 400;   // Delay between frames in milliseconds

    const site = window.selectedRadarSite;     // Replace with your method of retrieving the current radar site
    const product = window.selectedRadarProduct; // Replace with your method of retrieving the current radar product

    if (!site || !product) {
        console.error("Missing site or product");
        return;
    }

    const timestamps = generateRecentTimestamps(frameCount);

    for (let i = 0; i < timestamps.length; i++) {
        const ts = timestamps[i];
        const tileUrl = `https://radar.weather.gov/ridge/standard/${site}/${product}_${ts}.png`;
        updateRadarTileLayer(tileUrl);

        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
}

document.getElementById('playbackMenuItemDiv').addEventListener('click', startRadarPlayback);

function generateRecentTimestamps(count) {
    const now = new Date();
    const timestamps = [];

    for (let i = 0; i < count; i++) {
        const d = new Date(now.getTime() - i * 5 * 60 * 1000); // 5-minute intervals
        const ts = formatRadarTimestamp(d);
        timestamps.push(ts);
    }

    return timestamps.reverse(); // Oldest to newest
}

function formatRadarTimestamp(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}_${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
}

function updateRadarTileLayer(tileUrl) {
    if (window.radarTileLayer) {
        window.radarTileLayer.setUrl(tileUrl);
    } else {
        window.radarTileLayer = L.tileLayer(tileUrl, {
            opacity: 0.6,
            zIndex: 99
        }).addTo(map);
    }
}

