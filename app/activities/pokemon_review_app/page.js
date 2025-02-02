"use client";
import { useState, useEffect, useRef } from "react";
import supabase from "../../utils/supabase"; // Adjust the path to your supabase.js file
import { useRouter } from "next/navigation"; // For redirecting to the auth page
import Link from "next/link"; // If using Next.js Link component

export default function PokemonReviewApp() {
  const [pokemons, setPokemons] = useState([]);
  const [newPokemonImage, setNewPokemonImage] = useState(null);
  const [newPokemonName, setNewPokemonName] = useState("");
  const [reviews, setReviews] = useState({}); // Store reviews per pokemon
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [uploading, setUploading] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef(null);

  // Automatically check the session when the page loads
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
      } else {
        router.push("/auth"); // Redirect to the auth page if no session is found
      }
    };

    checkSession();
  }, [router]);

  // Automatically fetch pokemons once the user is set (when page loads or user changes)
  useEffect(() => {
    if (user) {
      fetch_pokemon(user.email); // Fetch pokemons once the user is authenticated
    }
  }, [user]);

  // Fetch pokemons for the logged-in user
  const fetch_pokemon = async (userEmail) => {
    setLoading(true); // Show loading state while fetching pokemons

    const { data, error } = await supabase
      .from("pokemons_table")
      .select("*")
      .eq("user_id", userEmail)
      .order(sortBy, { ascending: sortBy === "upload_date" });

    if (error) {
      console.log("Error fetching pokemons:", error);
    } else {
    
      const pokemonsWithUrls = data.map((pokemon) => {
        const fullUrl = `https://jralndtkkmayksuckgcd.supabase.co/storage/v1/object/public/pokemons_table/${pokemon.url}`;
        return { ...pokemon, image_url: fullUrl };
      });
      setPokemons(pokemonsWithUrls);
    }

    setLoading(false); 
  };

  
  const upload_pokemon = async () => {
    if (!newPokemonImage) return alert("No file selected.");

    const fileExt = newPokemonImage.name.split(".").pop();
    const filePath = `uploads/${Date.now()}.${fileExt}`;

    if (!user || !user.email) {
      alert("User is not logged in or user email is missing.");
      return;
    }

    setUploading(true);

    const { data, error: uploadError } = await supabase.storage
      .from("pokemons_table")
      .upload(filePath, newPokemonImage);

    setUploading(false);

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      alert("File upload failed");
      return;
    }

    const { data: insertData, error: insertError } = await supabase
      .from("pokemons_table")
      .insert([
        {
          name: newPokemonName || newPokemonImage.name,
          url: filePath,
          user_id: user.email,
        },
      ]);
console.log(newPokemonName, filePath, user.email);
    if (insertError) {
      console.error("Error inserting pokemon metadata:", insertError.message);
      alert("Error inserting pokemon metadata");
    } else {
      alert("Pokemon inserted successfully");
      fetch_pokemon(user.email); 
      setNewPokemonImage(null);
      setNewPokemonName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const add_review = async (pokemonId) => {
    const reviewText = reviews[pokemonId]; 

    if (!reviewText) return alert("Please enter a review.");

    if (!user || !user.email) {
      alert("User is not logged in or user email is missing.");
      return;
    }

    const { data, error } = await supabase
      .from("pokemons_reviews")
      .insert([
        {
          review: reviewText,
          pokemon_id: pokemonId,
          user_id: user.email,
        },
      ]);

    if (error) {
      console.error("Error adding review:", error.message);
      alert("Error adding review");
    } else {
      alert("Review added successfully");
      fetch_pokemon(user.email); 
      setReviews("");
    }
  };
  const dashboard = () => {
    router.push('/dashboard');
  };

 
  const review_change = (pokemonId, value) => {
    setReviews({
      ...reviews,
      [pokemonId]: value, 
    });
  };

 
  const delete_pokemon = async (id) => {
    const { error } = await supabase.from("pokemons_table").delete().eq("id", id);
    if (error) {
      console.log("Error deleting pokemon:", error);
    } else {
      alert("Pokemon deleted successfully");
      fetch_pokemon(user.email); 
    }
  };

  
  const update_pokemon = async (id, updatedName) => {
    const { error } = await supabase
      .from("pokemons_table")
      .update({ name: updatedName })
      .eq("id", id);

    if (error) {
      console.log("Error updating pokemon name:", error);
    } else {
      alert("Pokemon name updated");
      fetch_pokemon(user.email); 
    }
  };


  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Pokemon Review App</h1>
      <button
          onClick={dashboard}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Go to Dashboard
        </button>
      <Link href="/activities/pokemon_review_app/reviews">
        <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          See All Reviews
        </button>
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by pokemon name"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
        <select
          className="ml-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            fetch_pokemon(user.email); 
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
          onChange={(e) => setNewPokemonImage(e.target.files[0])}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          value={newPokemonName}
          onChange={(e) => setNewPokemonName(e.target.value)}
          placeholder="Enter pokemon name"
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={upload_pokemon}
          className="px-6 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Pokemon"}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {filteredPokemons.map((pokemon) => (
            <li key={pokemon.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src={pokemon.image_url}
                  alt={pokemon.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <span className="block font-semibold">{pokemon.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(pokemon.upload_date).toLocaleString()}
                  </span>
                  <div className="mt-2">
                    <textarea
                      value={reviews[pokemon.id] || ""}
                      onChange={(e) => review_change(pokemon.id, e.target.value)}
                      placeholder="Write a review"
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    />
                    <button
                      onClick={() => add_review(pokemon.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mt-2"
                    >
                      Add Review
                    </button>
                    <div className="mt-4">
                      {pokemon.reviews &&
                        pokemon.reviews.map((review) => (
                          <div key={review.id} className="p-2 bg-white border mt-2 rounded-md">
                            <p>{review.review}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    update_pokemon(pokemon.id, prompt("Edit pokemon name", pokemon.name))
                  }
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => delete_pokemon(pokemon.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
