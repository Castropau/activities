"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../utils/supabase';
import Link from 'next/link';


const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Check if email is already registered
    const { data, error } = await supabase.auth.api.getUserByEmail(email);

    if (data) {
      setErrorMessage('This email is already registered.');
      setLoading(false);
      return;
    }

    // Sign up user if email is not taken
    const { user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setErrorMessage(signUpError.message);
    } else {
      router.push('/auth/signin'); // Redirect to sign-in page after successful sign-up
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSignUp}
        className="p-8 bg-white rounded shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        
        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mb-4 p-2 border rounded w-full"
          required
        />

        {/* Password input */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 p-2 border rounded w-full"
          required
        />

        {/* Error message */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className={`w-full py-2 rounded ${
            loading ? 'bg-gray-400' : 'bg-blue-500'
          } text-white`}
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <div className="mt-4 text-center">
        <div className="text-center mt-4">
        <p>Already have an account? <Link href="/auth" className="text-blue-600 hover:text-blue-700 font-semibold">Sign In</Link></p>
      </div>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
