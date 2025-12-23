import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://supabase.com/dashboard/project/xpvbscqujtieokbzluzos')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdmJzY3F1anRpZW9rYnpsdXpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ3OTQ1NywiZXhwIjoyMDgyMDU1NDU3fQ.VU4oq_OGL-D1epOLMvsA4yinwQlumw8ucR9SUjhXUfc')
    
    # Storage Configuration
    AUDIO_STORAGE_BUCKET = 'music_audio'
    THUMBNAIL_STORAGE_BUCKET = 'thumbnails'
    
    # Default Settings
    DEFAULT_BITRATE = '64k'
    ALLOWED_BITRATES = ['64k', '128k']
    
    # Admin Security (for local dashboard)
    ADMIN_SECRET_KEY = os.getenv('ADMIN_SECRET_KEY', 'your-secret-admin-key-local-only')