// context/ctx.tsx
import {
  useState,
  useEffect,
  useContext,
  createContext,
  type PropsWithChildren,
} from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext<{
  signIn: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  session?: Session | null;
  loading: boolean;
}>({
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => null,
  resetPassword: async () => false,
  changePassword: async () => false,
  session: null,
  loading: false,
});

// Este hook puede usarse para acceder a la información del usuario.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeSession = async () => {
      const sessionData = await AsyncStorage.getItem("session");
      if (sessionData) {
        setSession(JSON.parse(sessionData));
      }
      setLoading(false);
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          AsyncStorage.setItem("session", JSON.stringify(session));
        } else {
          AsyncStorage.removeItem("session");
        }
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<boolean> {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert(error.message);
        return false;
      }

      if (rememberMe && data.session) {
        await AsyncStorage.setItem("session", JSON.stringify(data.session));
      }

      setSession(data.session);
      return true;
    } catch (err) {
      Alert.alert("An error occurred during sign-in");
      return false;
    } finally {
      setLoading(false);
      Alert.alert("Welcome back!");
      router.push("/");
    }
  }

  async function signUp(email: string, password: string): Promise<boolean> {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert(error.message);
        return false;
      }
      return true;
    } catch (err) {
      Alert.alert("An error occurred during sign-up");
      return false;
    } finally {
      setLoading(false);
      Alert.alert("Check your email for the confirmation link");
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert(error.message);
      }
    } catch (err) {
      Alert.alert("An error occurred during sign-out");
    } finally {
      setLoading(false);
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);
    if (error) {
      console.error("Error sending reset password email:", error.message);
      return false;
    } else {
      console.log("Reset password email sent");
      return true;
    }
  };

  const changePassword = async (
    newPassword: string
  ): Promise<boolean> => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);
    if (error) {
      console.error("Error updating password:", error.message);
      return false;
    } else {
      console.log("Password updated");
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        resetPassword,
        changePassword,
        session,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
