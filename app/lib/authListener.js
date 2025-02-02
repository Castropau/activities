
import { useEffect } from 'react';
import { supabase } from '../utils/supabase'; 

const AuthListener = () => {
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log(event, session);
               
            }
        );

        return () => {
            authListener?.unsubscribe();
        };
    }, []);

    return null;
};

export default AuthListener;
