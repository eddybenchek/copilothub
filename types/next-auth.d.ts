import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      githubUsername?: string | null;
    };
  }

  interface User {
    role: Role;
    githubUsername?: string | null;
  }
}

