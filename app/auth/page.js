'use client';

import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useRouter } from 'next/navigation';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const signUp = async (e) => {
    e.preventDefault();
    setError('');  
    if (!email || !password) {
      setError('Both email and password are required!');
      return;
    }

    setLoading(true);
    
    const { user, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setLoading(false);
      setError(authError.message);  
      return;
    }

    const { data, error: dbError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password,  
        },
      ]);

    setLoading(false);

    if (dbError) {
      setError(dbError.message); 
    } else {
      alert('Check your email for confirmation');
      router.push('../');  
    }
  };

  
  const sign_in_page = () => {
    router.push('../'); 
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">Sign Up</h1>
        <form onSubmit={signUp} className="space-y-4">
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
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Already have an account?</p>
          <button
            onClick={sign_in_page}
            className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
