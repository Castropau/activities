"use client";
import { useState, useEffect } from 'react';
import supabase from '../../utils/supabase'; 
import { useRouter } from 'next/navigation'; 

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [newTodo, new_todo] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); 
  const router = useRouter(); 

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user); 
        fetch_todo(session.user.email); 
      } else {
        router.push('/auth'); 
      }
    };

    checkSession();
  }, [router]); 

  const fetch_todo = async (userEmail) => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_email', userEmail); 

    if (error) {
      console.log('Error fetching todos:', error);
    } else {
      setTodos(data || []); 
    }

    setLoading(false); 
  };

  const add_todo = async () => {
    if (newTodo.trim() && user) {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTodo, user_email: user.email }]);

      if (error) {
        console.log('Error adding todo:', error);
      } else {
        
        fetch_todo(user.email); 
        new_todo('');
      }
    }
  };

  const delete_todo = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this todo?');
  
    if (isConfirmed) {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      
      if (error) {
        console.log('Error deleting todo:', error);
      } else {
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    }
  };
  const dashboard = () => {
    router.push('/dashboard');
  };
  

  const update_todo = async (id, updatedTask) => {
    const { error } = await supabase
      .from('todos')
      .update({ task: updatedTask })
      .eq('id', id);

    if (error) {
      console.log('Error updating todo:', error);
    } else {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, task: updatedTask } : todo)));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Todo List</h1>
      <div className="mt-6 text-center">
        <button
          onClick={dashboard}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Go to Dashboard
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => new_todo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-1 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={add_todo}
          className="px-6 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Todo
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {todos.map((todo) => (
            <li key={todo.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm">
              <span className="text-gray-700">{todo.task}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => update_todo(todo.id, prompt('Edit task', todo.task))}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Update
                </button>
                <button
                  onClick={() => delete_todo(todo.id)}
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
