"use client";
import { useState, useEffect, useRef } from 'react';
import supabase from '../../utils/supabase'; 
import { useRouter } from 'next/navigation'; 

export default function PhotoDrive() {
  const [photos, setPhotos] = useState([]);
  const [newPhoto, setNewPhoto] = useState(null);
  const [newPhotoName, setNewPhotoName] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
      } else {
        router.push('/auth'); 
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetch_photos(user.email); 
    }
  }, [user]);  

  
  const fetch_photos = async (userEmail) => {
    setLoading(true);  

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userEmail)
      .order(sortBy, { ascending: sortBy === 'upload_date' });

    if (error) {
      console.log('Error fetching photos:', error);
    } else {
      const photosWithUrls = data.map((photo) => {
        const fullUrl = `https://jralndtkkmayksuckgcd.supabase.co/storage/v1/object/public/photos/${photo.url}`;

        return {
          ...photo,
          url: fullUrl, 
        };
      });

      setPhotos(photosWithUrls);
    }

    setLoading(false); 
  };


  const upload_photos = async () => {
    if (!newPhoto) return alert('No file selected.');

    const fileExt = newPhoto.name.split('.').pop();
    const filePath = `uploads/${Date.now()}.${fileExt}`;

    if (!user || !user.email) {
      alert('User is not logged in or user email is missing.');
      return;
    }

    setUploading(true);

    const { data, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, newPhoto);

    setUploading(false);

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      alert('File upload failed');
      return;
    }

    const { data: insertData, error: insertError } = await supabase
      .from('photos')
      .insert([
        {
          name: newPhotoName || newPhoto.name,
          url: filePath,
          user_id: user.email,
        }
      ]);

    if (insertError) {
      console.error('Error inserting photo metadata:', insertError.message);
      alert('Error inserting photo metadata');
    } else {
      alert('Photo uploaded inserted successfully');
      fetch_photos(user.email); 
      setNewPhoto(null);
      setNewPhotoName('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    }
  };

 
  const delete_photo = async (id) => {
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) {
      console.log('Error deleting photo:', error);
    } else {
      alert('Photo deleted successfully');
      fetch_photos(user.email);
    }
  };
  const dashboard = () => {
    router.push('/dashboard');
  };
  
  const update_photo = async (id, updatedName) => {
    const { error } = await supabase
      .from('photos')
      .update({ name: updatedName })
      .eq('id', id);

    if (error) {
      console.log('Error updating photo name:', error);
    } else {
      alert('Photo name updated');
      fetch_photos(user.email); 
    }
  };

  const filteredPhotos = photos.filter((photo) =>
    photo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Photo Drive</h1>
        <button
          onClick={dashboard}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Go to Dashboard
        </button>
      

      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by photo name"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
        <select
          className="ml-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            fetch_photos(user.email); 
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="upload_date">Sort by Upload Date</option>
        </select>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="file"
          ref={fileInputRef} 
          onChange={(e) => setNewPhoto(e.target.files[0])}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          value={newPhotoName}
          onChange={(e) => setNewPhotoName(e.target.value)}
          placeholder="Enter photo name"
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={upload_photos}
          className="px-6 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {filteredPhotos.map((photo) => (
            <li key={photo.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <img src={photo.url} alt={photo.url} className="w-20 h-20 object-cover rounded-md" />
                <div>
                  <span className="block font-semibold">{photo.name}</span>
                  <span className="text-sm text-gray-500">{new Date(photo.upload_date).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => update_photo(photo.id, prompt('Edit photo name', photo.name))}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => delete_photo(photo.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
