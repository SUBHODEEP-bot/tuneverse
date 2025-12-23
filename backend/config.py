import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://supabase.com/dashboard/project/xpvbscqujtieokbzluzos.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdmJzY3F1anRpZW9rYnpsdXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Nzk0NTcsImV4cCI6MjA4MjA1NTQ1N30.p190eJx5mTAY-nrEag5iFOA2hdfH_BLpjfkS6UWv-qk')
    
    # Storage Configuration
    AUDIO_STORAGE_BUCKET = 'music_audio'
    THUMBNAIL_STORAGE_BUCKET = 'thumbnails'
    
    # Default Settings
    DEFAULT_BITRATE = '64k'
    ALLOWED_BITRATES = ['64k', '128k']
    
    # Admin Security (for local dashboard)
    ADMIN_SECRET_KEY = os.getenv('ADMIN_SECRET_KEY', 'your-secret-admin-key-local-only')