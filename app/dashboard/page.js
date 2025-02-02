'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../utils/supabase';

const IndexPage = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

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

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('../');
  };

  const delete_account = async () => {
    try {
      const { data, error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', user.email);
  
      if (deleteError) {
        console.error('Error deleting account:', deleteError.message);
        alert('Failed to delete account. Please try again.');
      } else {
        await supabase.auth.signOut(); 
        alert('Account deleted successfully.');
        router.push('../');
      }
    } catch (err) {
      console.error('Error during account deletion process:', err.message);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  if (!user) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Welcome, {user.email}</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleLogOut}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
          >
            Log Out
          </button>
          
          <button
            onClick={delete_account}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition duration-300"
          >
            Delete Account
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-center mb-4">Your Activities</h2>
          <ul className="space-y-2">
            <li>
              <a href="/activities/todo" className="text-blue-500 hover:text-blue-600 transition duration-300">
                To-Do List
              </a>
            </li>
            <li>
              <a href="/activities/google_drive/" className="text-blue-500 hover:text-blue-600 transition duration-300">
                Google Drive Lite
              </a>
            </li>
            <li>
              <a href="/activities/food_review_app" className="text-blue-500 hover:text-blue-600 transition duration-300">
                Food Review
              </a>
            </li>
            <li>
              <a href="/activities/pokemon_review_app" className="text-blue-500 hover:text-blue-600 transition duration-300">
                Pokemon Review
              </a>
            </li>
            <li>
              <a href="/activities/mark_down_app" className="text-blue-500 hover:text-blue-600 transition duration-300">
                Markdown Notes
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
