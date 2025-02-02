"use client";
import { useState, useEffect } from "react";
import supabase from "../../utils/supabase"; 
import ReactMarkdown from "react-markdown"; 
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

export default function MarkdownNotesApp() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, new_title] = useState("");
  const [newNoteContent, new_content] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, view_mode] = useState("preview"); 
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
      } else {
        router.push("/auth"); 
      }
    };

    checkSession();
  }, [router]);

  
  useEffect(() => {
    if (user) {
      const fetchNotes = async () => {
        const { data, error } = await supabase.from("notes").select("*").eq("user_email", user.email);
        if (error) {
          console.error("Error fetching notes:", error);
        } else {
          setNotes(data);
        }
      };

      fetchNotes();
    }
  }, [user]);

  const add_note = async () => {
    if (!newNoteTitle || !newNoteContent) {
      alert("Please fill in both title and content.");
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          title: newNoteTitle,
          content: newNoteContent,
          user_email: user.email, 
        },
      ])
      .select(); 

    if (error) {
      console.error("Error adding note:", error.message);
      alert("Error adding note");
    } else {
      console.log("Inserted data:", data);
      if (data && data.length > 0) {
        setNotes([data[0], ...notes]);
      } else {
        console.error("No data returned after inserting note.");
      }
      new_title("");
      new_content("");
    }
  };
  const dashboard = () => {
    router.push('/dashboard');
  };
  const handleUpdateNote = async () => {
    if (!newNoteTitle || !newNoteContent) {
      alert("Please fill in both title and content.");
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .update({ title: newNoteTitle, content: newNoteContent })
      .eq("id", editingNote.id)
      .select();

    if (error) {
      console.error("Error updating note:", error.message);
      alert("Error updating note");
    } else {
      setNotes(
        notes.map((note) =>
          note.id === editingNote.id ? { ...note, title: newNoteTitle, content: newNoteContent } : note
        )
      );
      setEditingNote(null);
      new_title("");
      new_content("");
    }
  };
  const delete_note = async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      console.error("Error deleting note:", error.message);
      alert("Error deleting note");
    } else {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };
  const edit_note = (note) => {
    setEditingNote(note);
    new_title(note.title);
    new_content(note.content);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Markdown Notes App</h1>
      <button
          onClick={dashboard}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Go to Dashboard
        </button>
      <div className="mb-6">
        <input
          type="text"
          value={newNoteTitle}
          onChange={(e) => new_title(e.target.value)}
          placeholder="Note Title"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <textarea
          value={newNoteContent}
          onChange={(e) => new_content(e.target.value)}
          placeholder="Write your note in Markdown"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          rows={10}
        />
        {editingNote ? (
          <button
            onClick={handleUpdateNote}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Update Note
          </button>
        ) : (
          <button
            onClick={add_note}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add Note
          </button>
        )}
      </div>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => view_mode("raw")}
          className={`px-4 py-2 rounded-md ${viewMode === "raw" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
        >
          Raw Markdown
        </button>
        <button
          onClick={() => view_mode("preview")}
          className={`px-4 py-2 rounded-md ${viewMode === "preview" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
        >
          Preview
        </button>
      </div>
      <ul className="space-y-4">
        {notes.map((note) => (
          <li key={note.id} className="p-4 bg-gray-100 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <h2 className="font-semibold text-xl">{note.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => edit_note(note)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => delete_note(note.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Raw or Preview View */}
            {viewMode === "raw" ? (
              <pre className="bg-gray-200 p-4 rounded-md">{note.content}</pre>
            ) : (
              <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
