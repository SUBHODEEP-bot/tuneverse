from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime
from youtube_downloader import YouTubeDownloader
from supabase_client import SupabaseClient
from config import Config

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize clients
yt_downloader = YouTubeDownloader()
supabase = SupabaseClient()

@app.route('/')
def index():
    return jsonify({
        'status': 'online',
        'service': 'Music Streaming API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/add_song', methods=['POST'])
def add_song():
    """Admin endpoint to add song from YouTube URL"""
    # Verify admin secret (for local use only)
    admin_key = request.headers.get('X-Admin-Key')
    if admin_key != Config.ADMIN_SECRET_KEY:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    youtube_url = data.get('youtube_url')
    folder_id = data.get('folder_id')
    folder_name = data.get('folder_name')
    bitrates = data.get('bitrates', ['64k', '128k'])
    
    if not youtube_url:
        return jsonify({'error': 'YouTube URL required'}), 400
    
    try:
        # Create folder if needed
        if folder_name and not folder_id:
            folder = supabase.add_folder_to_db(folder_name)
            folder_id = folder['id'] if folder else None
        
        # Download and convert
        download_result = yt_downloader.download_and_convert(youtube_url, bitrates)
        
        if not download_result['success']:
            return jsonify({'error': 'Download failed', 'details': download_result.get('error')}), 500
        
        # Upload to Supabase Storage
        audio_urls = {}
        for bitrate, file_path in download_result['audio_files'].items():
            filename = os.path.basename(file_path)
            audio_url = supabase.upload_audio(file_path, filename, folder_id or 'default', bitrate)
            if audio_url:
                if bitrate == '64k':
                    audio_urls['audio_url_64kbps'] = audio_url
                elif bitrate == '128k':
                    audio_urls['audio_url_128kbps'] = audio_url
            
            # Clean up local file
            os.unlink(file_path)
        
        # Upload thumbnail if available
        thumbnail_url = None
        if download_result['thumbnail_url']:
            # In production, you would download and upload the thumbnail
            # For simplicity, using original YouTube thumbnail URL
            thumbnail_url = download_result['thumbnail_url']
        
        # Add to database
        song_data = {
            'title': download_result['title'],
            'artist': 'YouTube',
            'duration': download_result['duration'],
            'thumbnail_url': thumbnail_url,
            'folder_id': folder_id,
            'youtube_url': youtube_url,
            'created_at': datetime.now().isoformat(),
            **audio_urls
        }
        
        song = supabase.add_song_to_db(song_data)
        
        return jsonify({
            'success': True,
            'song': song,
            'message': f"Song '{download_result['title']}' added successfully"
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_songs', methods=['GET'])
def get_songs():
    """Public endpoint to get all songs"""
    folder_id = request.args.get('folder_id')
    
    try:
        songs = supabase.get_songs(folder_id)
        return jsonify({'songs': songs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_folders', methods=['GET'])
def get_folders():
    """Public endpoint to get all folders"""
    try:
        folders = supabase.get_folders()
        return jsonify({'folders': folders})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    # Run on localhost only for admin dashboard
    app.run(host='127.0.0.1', port=5000, debug=True)