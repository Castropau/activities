"use client";
import { useState, useEffect } from 'react';
import supabase from '../../../utils/supabase';  
import { useRouter } from 'next/navigation';  
import Link from 'next/link';  


export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);  

  const fetchReviews = async () => {
    setLoading(true);  

    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }

      const userEmail = user.email; 

      const { data, error } = await supabase
        .from('reviews')
        .select('id, review, created_at, photo_id, photos_table(name, url)')
        .eq('user_id', userEmail) 
        .order('created_at', { ascending: false });

      if (error) {
        throw error; 
      }

      const reviewsWithPhotos = data.map((review) => {
        const fullUrl = review.photos_table?.url
          ? `https://jralndtkkmayksuckgcd.supabase.co/storage/v1/object/public/photos_table/${review.photos_table.url}`
          : null;

        return {
          ...review,
          photoUrl: fullUrl, 
        };
      });

      setReviews(reviewsWithPhotos);  

    } catch (error) {
      console.error('Error fetching reviews:', error.message);
      alert('There was an issue fetching reviews. Please try again.');
    } finally {
      setLoading(false); 
    }
  };

  const delete_review = async (reviewId) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) {
      console.log('Error deleting review:', error.message);
    } else {
      setReviews(reviews.filter((review) => review.id !== reviewId));
    }
  };

  const edit_review = async (reviewId, newReviewText) => {
    const { error } = await supabase
      .from('reviews')
      .update({ review: newReviewText })
      .eq('id', reviewId);

    if (error) {
      console.log('Error editing review:', error.message);
    } else {
      setReviews(reviews.map((review) =>
        review.id === reviewId ? { ...review, review: newReviewText } : review
      ));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">All Reviews</h1>
      <Link href="../../dashboard">
    <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
      Dashboard
    </button>
  </Link>
  
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {review.photoUrl && (
                    <img
                      src={review.photoUrl}
                      alt={review.photos_table?.name || "Food photo"}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <strong>{review.photos_table?.name}</strong>
                    <p>Your review: {review.review}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newReviewText = prompt('Edit your review:', review.review);
                      if (newReviewText) edit_review(review.id, newReviewText);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => delete_review(review.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
}
