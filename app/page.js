'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../utils/supabase';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    checkSession();
  }, [router]);

  const signIn = async (e) => {
    e.preventDefault();
    setError(''); 
    const { user, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      console.log('Error:', signInError.message);
      setError(signInError.message);  
    } else {
      alert('Sign-in successful!');
      router.push('/dashboard');  
    }
  };


  const sign_up = () => {
    router.push('/auth');  
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">Sign In</h1>
        <form onSubmit={signIn} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Sign In
          </button>
        </form>

     
        {error && (
          <div className="mt-4 text-red-500 text-sm">
            <span>{error}</span>
          </div>
        )}

        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Dont have an account?</p>
          <button
            onClick={sign_up}
            className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
