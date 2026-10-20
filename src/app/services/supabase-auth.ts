import {Injectable, signal, computed} from '@angular/core';

export interface SupabaseUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
  createdAt?: string;
}

export interface SupabaseSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SupabaseUser;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  // Reactive Signals for Zoneless Angular 21 Architecture
  readonly session = signal<SupabaseSession | null>({
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-session-token-passenger',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
    user: {
      id: 'u8888888-8888-8888-8888-888888888888',
      email: 'passenger@example.com',
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      role: 'authenticated',
      createdAt: '2026-01-01T00:00:00Z',
    },
  });

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session()?.accessToken);
  readonly bearerToken = computed(() => this.session()?.accessToken ?? '');

  async signUp(email: string, password: string, fullName: string, phone: string): Promise<SupabaseUser> {
    // In production with @supabase/supabase-js:
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    //   options: { data: { full_name: fullName, phone } }
    // });
    const newUser: SupabaseUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email,
      fullName,
      phone,
      role: 'authenticated',
      createdAt: new Date().toISOString(),
    };

    const newSession: SupabaseSession = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token-' + Math.random().toString(36).substring(2, 9),
      refreshToken: 'refresh-' + Math.random().toString(36).substring(2, 9),
      expiresIn: 3600,
      user: newUser,
    };

    this.session.set(newSession);
    return newUser;
  }

  async signIn(email: string, password?: string): Promise<SupabaseSession> {
    // In production with @supabase/supabase-js:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password: password! });
    if (!password) {
      // Magic link or fallback
    }
    const user: SupabaseUser = {
      id: 'u8888888-8888-8888-8888-888888888888',
      email,
      fullName: email.split('@')[0],
      phone: '+91 98765 43210',
      role: 'authenticated',
    };

    const session: SupabaseSession = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token-' + Math.random().toString(36).substring(2, 9),
      refreshToken: 'refresh-' + Math.random().toString(36).substring(2, 9),
      expiresIn: 3600,
      user,
    };

    this.session.set(session);
    return session;
  }

  async signOut(): Promise<void> {
    // In production:
    // await supabase.auth.signOut();
    this.session.set(null);
  }
}
