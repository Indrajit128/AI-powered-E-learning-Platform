import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase initialized successfully');
  } else {
    console.warn('⚠️ Supabase environment variables missing. Real-time features will be unavailable.');
  }
} catch (err) {
  console.error('❌ Failed to initialize Supabase:', err.message);
}

export const supabase = supabaseInstance;

export const signUpUser = async (email, password) => {
  if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:5173/auth/callback'
    }
  })

  if (error) {
    console.log(error.message)
    return { data: null, error }
  } else {
    console.log("Verification email sent")
    return { data, error: null }
  }
}

export const loginUser = async (email, password) => {
  if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.log(error.message)
    return { data: null, error }
  } else {
    console.log("Login success")
    return { data, error: null }
  }
}

export const checkUser = async () => {
  if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    window.location.href = "/login"
    return { data: null, error: error || new Error('No user') }
  }
  return { data, error: null }
}
