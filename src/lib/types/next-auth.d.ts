import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      crm: string;
      especialidade: string;
    } & DefaultSession['user'];
  }

  interface User {
    crm: string;
    especialidade: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    crm: string;
    especialidade: string;
  }
}
