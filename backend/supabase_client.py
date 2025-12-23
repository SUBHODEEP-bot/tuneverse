import os
from supabase import create_client, Client
from config import Config

class SupabaseClient:
    def __init__(self):
        self.client: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    
    def upload_audio(self, file_path, filename, folder_id, bitrate='64k'):
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            # Upload to storage
            storage_path = f"{folder_id}/{bitrate}/{filename}"
            result = self.client.storage.from_(Config.AUDIO_STORAGE_BUCKET).upload(
                storage_path,
                file_data
            )
            
            # Get public URL
            url = self.client.storage.from_(Config.AUDIO_STORAGE_BUCKET).get_public_url(storage_path)
            
            return url
        except Exception as e:
            print(f"Error uploading audio: {e}")
            return None
    
    def upload_thumbnail(self, file_path, filename):
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            storage_path = f"thumbnails/{filename}"
            result = self.client.storage.from_(Config.THUMBNAIL_STORAGE_BUCKET).upload(
                storage_path,
                file_data
            )
            
            url = self.client.storage.from_(Config.THUMBNAIL_STORAGE_BUCKET).get_public_url(storage_path)
            return url
        except Exception as e:
            print(f"Error uploading thumbnail: {e}")
            return None
    
    def add_song_to_db(self, song_data):
        try:
            response = self.client.table('songs').insert(song_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error adding song to DB: {e}")
            return None
    
    def add_folder_to_db(self, folder_name):
        try:
            response = self.client.table('folders').insert({
                'name': folder_name,
                'created_at': 'now()'
            }).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error adding folder to DB: {e}")
            return None
    
    def get_folders(self):
        try:
            response = self.client.table('folders').select('*').order('name').execute()
            return response.data
        except Exception as e:
            print(f"Error getting folders: {e}")
            return []
    
    def get_songs(self, folder_id=None):
        try:
            query = self.client.table('songs').select('*')
            if folder_id:
                query = query.eq('folder_id', folder_id)
            
            response = query.order('title').execute()
            return response.data
        except Exception as e:
            print(f"Error getting songs: {e}")
            return []