import yt_dlp
import os
from pydub import AudioSegment
import tempfile
from datetime import timedelta

class YouTubeDownloader:
    def __init__(self, output_dir='downloads'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def download_and_convert(self, youtube_url, bitrates=['64k', '128k']):
        """Download YouTube video and convert to MP3 with specified bitrates"""
        result = {
            'title': None,
            'thumbnail_url': None,
            'duration': None,
            'audio_files': {},
            'success': False
        }
        
        try:
            # Download info first
            ydl_opts_info = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts_info) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                result['title'] = info.get('title', 'Unknown')
                result['thumbnail_url'] = info.get('thumbnail', '')
                result['duration'] = str(timedelta(seconds=info.get('duration', 0)))
            
            # Download best audio
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.webm')
            temp_path = temp_file.name
            
            ydl_opts_download = {
                'format': 'bestaudio/best',
                'outtmpl': temp_path,
                'quiet': True,
                'no_warnings': True,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }
            
            with yt_dlp.YoutubeDL(ydl_opts_download) as ydl:
                ydl.download([youtube_url])
            
            # Convert to different bitrates
            mp3_path = temp_path.replace('.webm', '.mp3')
            if os.path.exists(mp3_path):
                audio = AudioSegment.from_mp3(mp3_path)
                
                for bitrate in bitrates:
                    # Convert bitrate string to kbps integer
                    kbps = int(bitrate.replace('k', ''))
                    
                    # Export with specific bitrate
                    output_filename = f"{self.sanitize_filename(result['title'])}_{bitrate}.mp3"
                    output_path = os.path.join(self.output_dir, output_filename)
                    
                    audio.export(output_path, format='mp3', bitrate=f"{kbps}k")
                    result['audio_files'][bitrate] = output_path
                
                result['success'] = True
                
                # Clean up temp files
                os.unlink(temp_path)
                os.unlink(mp3_path)
            
        except Exception as e:
            print(f"Error downloading/processing: {e}")
            result['error'] = str(e)
        
        return result
    
    def sanitize_filename(self, filename):
        """Remove invalid characters from filename"""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        return filename[:100]  # Limit length