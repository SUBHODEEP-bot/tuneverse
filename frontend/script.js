// Supabase Configuration
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Player State
let currentSong = null;
let currentFolder = 'all';
let songs = [];
let folders = [];
let isPlaying = false;
const audioPlayer = document.getElementById('audioPlayer');

// DOM Elements
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const songListEl = document.getElementById('songList');
const folderTabsEl = document.getElementById('folderTabs');
const bitrateSelect = document.getElementById('bitrateSelect');
const currentTitleEl = document.getElementById('currentTitle');
const currentArtEl = document.getElementById('currentArt').querySelector('img');

// Initialize App
async function initApp() {
    await loadFolders();
    await loadSongs();
    setupEventListeners();
    updatePlayerUI();
}

// Load Folders from Supabase
async function loadFolders() {
    try {
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .order('name');
            
        if (error) throw error;
        
        folders = data || [];
        renderFolderTabs();
    } catch (error) {
        console.error('Error loading folders:', error);
    }
}

// Load Songs from Supabase
async function loadSongs() {
    try {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('title');
            
        if (error) throw error;
        
        songs = data || [];
        renderSongList();
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

// Render Folder Tabs
function renderFolderTabs() {
    folderTabsEl.innerHTML = '';
    
    // All tab
    const allTab = document.createElement('div');
    allTab.className = `folder-tab ${currentFolder === 'all' ? 'active' : ''}`;
    allTab.textContent = 'All Songs';
    allTab.onclick = () => switchFolder('all');
    folderTabsEl.appendChild(allTab);
    
    // Folder tabs
    folders.forEach(folder => {
        const tab = document.createElement('div');
        tab.className = `folder-tab ${currentFolder === folder.id ? 'active' : ''}`;
        tab.textContent = folder.name;
        tab.onclick = () => switchFolder(folder.id);
        folderTabsEl.appendChild(tab);
    });
}

// Render Song List
function renderSongList() {
    songListEl.innerHTML = '';
    
    const filteredSongs = currentFolder === 'all' 
        ? songs 
        : songs.filter(song => song.folder_id === currentFolder);
    
    filteredSongs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.className = `song-item ${currentSong?.id === song.id ? 'active' : ''}`;
        songItem.onclick = () => playSong(song);
        
        songItem.innerHTML = `
            <div class="song-thumb">
                <img src="${song.thumbnail_url || 'https://img.youtube.com/vi/default/mqdefault.jpg'}" alt="${song.title}">
            </div>
            <div class="song-details">
                <h4>${song.title}</h4>
                <p>${song.artist || 'Unknown Artist'} • ${song.duration || '0:00'}</p>
            </div>
        `;
        
        songListEl.appendChild(songItem);
    });
}

// Play Song
function playSong(song) {
    currentSong = song;
    
    // Get selected bitrate
    const bitrate = bitrateSelect.value;
    const audioUrl = bitrate === '128' ? song.audio_url_128kbps : song.audio_url_64kbps;
    
    // Set audio source
    audioPlayer.src = audioUrl;
    audioPlayer.play();
    
    // Update UI
    currentTitleEl.textContent = song.title;
    currentArtEl.src = song.thumbnail_url;
    
    // Update active song in list
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Switch Folder
function switchFolder(folderId) {
    currentFolder = folderId;
    renderFolderTabs();
    renderSongList();
}

// Event Listeners
function setupEventListeners() {
    // Play/Pause
    playBtn.addEventListener('click', () => {
        if (!currentSong) return;
        
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audioPlayer.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });
    
    // Previous
    prevBtn.addEventListener('click', () => {
        if (!songs.length) return;
        
        let currentIndex = songs.findIndex(s => s.id === currentSong?.id);
        if (currentIndex <= 0) currentIndex = songs.length;
        
        playSong(songs[currentIndex - 1]);
    });
    
    // Next
    nextBtn.addEventListener('click', () => {
        if (!songs.length) return;
        
        let currentIndex = songs.findIndex(s => s.id === currentSong?.id);
        if (currentIndex === -1 || currentIndex >= songs.length - 1) currentIndex = -1;
        
        playSong(songs[currentIndex + 1]);
    });
    
    // Audio time updates
    audioPlayer.addEventListener('timeupdate', () => {
        if (!audioPlayer.duration) return;
        
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
        
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });
    
    // Seek
    progressBar.addEventListener('input', () => {
        if (!audioPlayer.duration) return;
        
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
    
    // Bitrate change
    bitrateSelect.addEventListener('change', () => {
        if (currentSong) {
            playSong(currentSong);
        }
    });
    
    // Audio ended
    audioPlayer.addEventListener('ended', () => {
        nextBtn.click();
    });
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update player UI
function updatePlayerUI() {
    if (!currentSong) {
        currentTitleEl.textContent = 'Select a song';
        currentArtEl.src = 'https://img.youtube.com/vi/default/mqdefault.jpg';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initApp);