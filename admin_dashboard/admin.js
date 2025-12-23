// Configuration
const API_BASE_URL = 'http://localhost:5000';
const ADMIN_SECRET_KEY = 'anything-secret'; // Change this!

// DOM Elements
const songsListEl = document.getElementById('songsList');
const songFolderSelect = document.getElementById('songFolder');

// Initialize Admin Dashboard
async function initAdminDashboard() {
    await loadFolders();
    await loadSongs();
}

// Load Folders
async function loadFolders() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/get_folders`);
        const data = await response.json();
        
        songFolderSelect.innerHTML = '<option value="">Select Folder</option>';
        
        data.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            songFolderSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading folders:', error);
    }
}

// Load Songs
async function loadSongs() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/get_songs`);
        const data = await response.json();
        
        renderSongsList(data.songs || []);
    } catch (error) {
        console.error('Error loading songs:', error);
        songsListEl.innerHTML = '<div class="error">Error loading songs</div>';
    }
}

// Render Songs List
function renderSongsList(songs) {
    if (songs.length === 0) {
        songsListEl.innerHTML = '<div class="no-songs">No songs added yet</div>';
        return;
    }
    
    songsListEl.innerHTML = songs.map(song => `
        <div class="song-item">
            <div class="song-thumb">
                <img src="${song.thumbnail_url || 'https://img.youtube.com/vi/default/mqdefault.jpg'}" alt="${song.title}">
            </div>
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>Duration: ${song.duration} | Folder: ${song.folder_id || 'None'}</p>
                <p>Bitrates: ${song.audio_url_64kbps ? '64kbps ' : ''} ${song.audio_url_128kbps ? '128kbps' : ''}</p>
            </div>
        </div>
    `).join('');
}

// Create Folder
async function createFolder() {
    const folderNameInput = document.getElementById('folderName');
    const folderName = folderNameInput.value.trim();
    
    if (!folderName) {
        alert('Please enter a folder name');
        return;
    }
    
    try {
        // In a real implementation, you would call your API to create folder
        // For now, we'll simulate it
        const newOption = document.createElement('option');
        newOption.value = `folder_${Date.now()}`;
        newOption.textContent = folderName;
        songFolderSelect.appendChild(newOption);
        
        alert(`Folder "${folderName}" created (local simulation)`);
        folderNameInput.value = '';
        
        // In production: Call your backend API
        // await fetch(`${API_BASE_URL}/api/create_folder`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'X-Admin-Key': ADMIN_SECRET_KEY
        //     },
        //     body: JSON.stringify({ name: folderName })
        // });
        
    } catch (error) {
        console.error('Error creating folder:', error);
        alert('Error creating folder');
    }
}

// Add Song from YouTube
async function addSong() {
    const youtubeUrl = document.getElementById('youtubeUrl').value.trim();
    const folderId = document.getElementById('songFolder').value;
    
    if (!youtubeUrl) {
        alert('Please enter a YouTube URL');
        return;
    }
    
    // Get selected bitrates
    const bitrateCheckboxes = document.querySelectorAll('input[name="bitrate"]:checked');
    const bitrates = Array.from(bitrateCheckboxes).map(cb => cb.value);
    
    if (bitrates.length === 0) {
        alert('Please select at least one bitrate');
        return;
    }
    
    // Show progress
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting download...';
    
    try {
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/api/add_song`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Key': ADMIN_SECRET_KEY
            },
            body: JSON.stringify({
                youtube_url: youtubeUrl,
                folder_id: folderId || null,
                bitrates: bitrates
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            progressBar.style.width = '100%';
            progressText.textContent = 'Song added successfully!';
            
            // Clear form
            document.getElementById('youtubeUrl').value = '';
            
            // Reload songs
            setTimeout(() => {
                progressContainer.style.display = 'none';
                loadSongs();
            }, 2000);
        } else {
            throw new Error(result.error || 'Failed to add song');
        }
        
    } catch (error) {
        console.error('Error adding song:', error);
        progressText.textContent = `Error: ${error.message}`;
        progressBar.style.background = '#e74c3c';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAdminDashboard);s