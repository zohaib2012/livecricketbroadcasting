import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'SUPER_ADMIN' | 'ADMIN' | 'SCORER' | 'VIEWER';
      photo?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'SUPER_ADMIN' | 'ADMIN' | 'SCORER' | 'VIEWER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'SCORER' | 'VIEWER';
  }
}
