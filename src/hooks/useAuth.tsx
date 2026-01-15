import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    displayName?: string;
    bio?: string;
    university?: string;
    major?: string;
    skills?: string[];
    socials?: { linkedin?: string; github?: string; portfolio?: string };
    settings?: { notifications?: boolean; privacyMode?: boolean };
    avatarUrl?: string;
    karma?: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper to access the persistent user store
  const getUsersStore = (): Record<string, User> => {
    try {
      const stored = localStorage.getItem('noteverse_users');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveToUsersStore = (user: User) => {
    const store = getUsersStore();
    if (user.email) {
      store[user.email] = user;
      localStorage.setItem('noteverse_users', JSON.stringify(store));
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check for legacy demo user and migrate if needed
      const legacyUser = localStorage.getItem('noteverse-demo-user');
      if (legacyUser) {
        try {
          const parsed = JSON.parse(legacyUser);
          saveToUsersStore(parsed);
          localStorage.removeItem('noteverse-demo-user');
          localStorage.setItem('noteverse_current_user', JSON.stringify(parsed));
        } catch (e) {
          console.error("Migration error", e);
        }
      }

      // 2. Check for active local session
      const localSessionUser = localStorage.getItem('noteverse_current_user');
      if (localSessionUser) {
        try {
          const parsedUser = JSON.parse(localSessionUser);
          // Refresh from store to get latest updates
          const store = getUsersStore();
          const freshUser = (parsedUser.email && store[parsedUser.email]) ? store[parsedUser.email] : parsedUser;

          setUser(freshUser);
          setSession({ user: freshUser } as Session);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse local session:", e);
          localStorage.removeItem('noteverse_current_user');
          // Fall through to Supabase check
        }
      }

      // 3. Supabase check
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else if (!localStorage.getItem('noteverse_current_user')) {
        // Only clear if no local session exists
        setSession(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createMockUser = (email: string, displayName?: string): User => {
    // Check if user already exists in store
    const store = getUsersStore();
    if (store[email]) return store[email];

    // Create new
    return {
      id: "user-" + btoa(email).replace(/=/g, "").substring(0, 16),
      app_metadata: { provider: "email" },
      user_metadata: {
        display_name: displayName || email.split('@')[0],
        skills: ["Student"],
        bio: "",
        university: "NoteVerse University",
        major: "General Studies",
        socials: { linkedin: "", github: "", portfolio: "" },
        karma: 5000, // Initialize Karma with 5000 bonus for new users
        avatar_url: ""
      },
      aud: "authenticated",
      email: email,
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: "authenticated",
      updated_at: new Date().toISOString(),
    } as User;
  };

  const signInWithDemo = async () => {
    const email = "demo@noteverse.edu";
    const mockUser = createMockUser(email, "Demo Student");

    // Save to store and set active session
    saveToUsersStore(mockUser);
    localStorage.setItem('noteverse_current_user', JSON.stringify(mockUser));

    setUser(mockUser);
    setSession({ user: mockUser } as Session);

    toast({
      title: "Welcome to NoteVerse Demo!",
      description: "You are now exploring the platform as a Demo Student.",
    });
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            karma: 5000,
            university: "NoteVerse University",
            major: "General Studies",
            skills: ["Student"],
            socials: { linkedin: "", github: "", portfolio: "" }
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });
      return { error: null };
    } catch (error: any) {
      console.error("Signup error:", error);

      // Fallback: If network/config fails, verify if it's a critical fetch error
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        console.warn("Supabase unreachable. Falling back to local storage.");

        const mockUser = createMockUser(email, displayName);
        saveToUsersStore(mockUser);
        localStorage.setItem('noteverse_current_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setSession({ user: mockUser } as Session);

        toast({
          title: "Offline Mode active",
          description: "Backend unreachable. Account created locally.",
          variant: "default",
        });
        return { error: null };
      }

      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }

      toast({ title: "Welcome back!", description: "Signed in successfully." });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    // Only clear CURRENT session, keep the store intact
    localStorage.removeItem('noteverse_current_user');

    // Clear legacy if present
    localStorage.removeItem('noteverse-demo-user');

    // Also try supabase signout
    await supabase.auth.signOut();

    setUser(null);
    setSession(null);

    toast({
      title: "Signed out",
      description: "You have been signed out. Your data is safe.",
    });
  };

  const updateProfile = async (updates: {
    displayName?: string;
    bio?: string;
    university?: string;
    major?: string;
    skills?: string[];
    karma?: number;
    socials?: { linkedin?: string; github?: string; portfolio?: string };
    settings?: { notifications?: boolean; privacyMode?: boolean };
    avatarUrl?: string;
  }) => {
    if (!user || !user.email) return;

    // 1. Optimistic UI Update (Local)
    const currentMetadata = user.user_metadata || {};
    const newMetadata: Record<string, any> = { ...currentMetadata, ...updates };
    if (updates.avatarUrl) newMetadata.avatar_url = updates.avatarUrl;

    const updatedUser = {
      ...user,
      user_metadata: newMetadata,
      updated_at: new Date().toISOString()
    } as User;
    setUser(updatedUser);

    // 2. Demo User Guard
    if (user.email === "demo@noteverse.edu") {
      saveToUsersStore(updatedUser);
      localStorage.setItem('noteverse_current_user', JSON.stringify(updatedUser));
      toast({ title: "Profile Updated (Demo)", description: "Changes saved locally." });
      return;
    }

    // 3. Backend Sync (Real Users)
    try {
      // A. Update Auth Metadata (Karma, etc)
      const { error: authError } = await supabase.auth.updateUser({ data: newMetadata });
      if (authError) throw authError;

      // B. Update Public Profile (Searchable Info)
      const profileUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.displayName) profileUpdates.display_name = updates.displayName;
      if (updates.bio) profileUpdates.bio = updates.bio;
      if (updates.university) profileUpdates.university = updates.university;
      if (updates.avatarUrl) profileUpdates.avatar_url = updates.avatarUrl;
      // Map skills to subjects as a close equivalent if needed, or just update what we can
      if (updates.skills) profileUpdates.subjects = updates.skills;
      if (typeof updates.karma === 'number') profileUpdates.karma = updates.karma;

      const { error: dbError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (dbError) {
        console.warn("Could not update public profile table:", dbError);
      }

      toast({ title: "Profile Updated", description: "Saved to the cloud." });
    } catch (error) {
      console.error("Update failed", error);
      toast({ title: "Sync failed", description: "Could not save to server.", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithDemo, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

