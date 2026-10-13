"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SessionProvider,
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: "google" | "credentials" | "guest";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (email: string, name?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthInternalProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);

  // Baca fallback user dari localStorage jika bukan dari NextAuth session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bengkelsaku_user");
      if (stored) {
        setLocalUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Gagal membaca session lokal", e);
    }
  }, []);

  // Jika NextAuth session aktif (Google SSO asli), utamakan session NextAuth
  let activeUser: AuthUser | null = localUser;
  if (session?.user) {
    activeUser = {
      id: (session.user as any).id || "google-user",
      name: session.user.name || "Pengguna Google",
      email: session.user.email || "",
      image: session.user.image || undefined,
      provider: "google",
    };
  }

  const loginWithGoogle = async () => {
    // Panggil provider Google resmi via NextAuth
    await nextAuthSignIn("google", { callbackUrl: "/" });
  };

  const loginWithCredentials = async (email: string, name?: string) => {
    const credUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: name || email.split("@")[0],
      email,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      provider: "credentials",
    };

    localStorage.setItem("bengkelsaku_user", JSON.stringify(credUser));
    setLocalUser(credUser);
  };

  const loginAsGuest = () => {
    const guestUser: AuthUser = {
      id: "usr-guest",
      name: "Mekanik Tamu",
      email: "guest@bengkelsaku.local",
      provider: "guest",
    };
    localStorage.setItem("bengkelsaku_user", JSON.stringify(guestUser));
    setLocalUser(guestUser);
  };

  const logout = async () => {
    localStorage.removeItem("bengkelsaku_user");
    setLocalUser(null);
    if (session) {
      await nextAuthSignOut({ callbackUrl: "/" });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        isLoading: status === "loading",
        loginWithGoogle,
        loginWithCredentials,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthInternalProvider>{children}</AuthInternalProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
