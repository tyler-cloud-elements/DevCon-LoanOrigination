import React, { useState, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { UiPath, UiPathError } from '@uipath/uipath-typescript/core';
import type { UiPathSDKConfig } from '@uipath/uipath-typescript/core';

export interface AuthUser {
  name: string;
  firstName: string;
  initials: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  sdk: UiPath;
  user: AuthUser | null;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function looksLikeRealName(s: string): boolean {
  // A real name has at least one space and no @/dot/underscore separators.
  return /\s/.test(s.trim()) && !/[@._]/.test(s);
}

function prettifyUsername(raw: string): string {
  // Strip domain, split on common separators, title-case each token.
  const local = raw.split('@')[0] ?? raw;
  const parts = local.split(/[._\-+]+/).filter(Boolean);
  if (parts.length === 0) return raw;
  return parts.map(titleCase).join(' ');
}

function buildUser(token: string | undefined): AuthUser | null {
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims) return null;

  const given = typeof claims.given_name === 'string' ? claims.given_name.trim() : '';
  const family = typeof claims.family_name === 'string' ? claims.family_name.trim() : '';
  const nameClaim = typeof claims.name === 'string' ? claims.name.trim() : '';
  const preferred =
    typeof claims.preferred_username === 'string' ? claims.preferred_username.trim() : '';
  const emailClaim = typeof claims.email === 'string' ? claims.email.trim() : '';

  let fullName = '';
  if (given && family) {
    fullName = `${given} ${family}`;
  } else if (nameClaim && looksLikeRealName(nameClaim)) {
    fullName = nameClaim;
  } else if (given || family) {
    fullName = given || family;
  } else {
    const usernameSource = preferred || emailClaim || nameClaim;
    if (usernameSource) fullName = prettifyUsername(usernameSource);
  }
  if (!fullName) return null;

  const firstName = given || fullName.split(/\s+/)[0] || fullName;
  const initials =
    fullName
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || fullName.slice(0, 2).toUpperCase();
  const email = emailClaim || (preferred.includes('@') ? preferred : undefined);
  return { name: fullName, firstName, initials, email };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode; config: UiPathSDKConfig }> = ({ children, config }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdk, setSdk] = useState<UiPath>(() => new UiPath(config));
  const oauthCallbackHandledRef = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (
          sdk.isInOAuthCallback() &&
          !oauthCallbackHandledRef.current &&
          !sdk.isAuthenticated()
        ) {
          oauthCallbackHandledRef.current = true;
          await sdk.completeOAuth();
          // Strip ?code=...&state=... from the URL so a later reload or back-nav
          // doesn't retrigger the callback path
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        setIsAuthenticated(sdk.isAuthenticated());
      } catch (err) {
        console.error('Authentication initialization failed:', err);
        setError(err instanceof UiPathError ? err.message : 'Authentication failed');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [sdk]);

  const login = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.initialize();
      setIsAuthenticated(sdk.isAuthenticated());
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof UiPathError ? err.message : 'Login failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sdk.logout();
    setIsAuthenticated(false);
    setError(null);
    setSdk(new UiPath(config));
  };

  const user = useMemo(
    () => (isAuthenticated ? buildUser(sdk.getToken()) : null),
    [isAuthenticated, sdk],
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, sdk, user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
