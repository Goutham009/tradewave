import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Demo mode - allow test accounts without database
        const demoUsers: Record<string, any> = {
          'admin@tradewave.io': {
            id: 'demo-admin-001',
            email: 'admin@tradewave.io',
            name: 'Admin User',
            password: 'password123',
            role: 'ADMIN',
            companyName: 'Tradewave',
            walletAddress: null,
          },
          'admin@tradewave.com': {
            id: 'demo-admin-002',
            email: 'admin@tradewave.com',
            name: 'Platform Admin',
            password: 'admin123',
            role: 'ADMIN',
            companyName: 'Tradewave Platform',
            walletAddress: null,
          },
          'demo@tradewave.io': {
            id: 'demo-user-001',
            email: 'demo@tradewave.io',
            name: 'Demo User',
            password: 'password123',
            role: 'BUYER',
            companyName: 'Demo Company Ltd',
            walletAddress: null,
          },
          'supplier@tradewave.io': {
            id: 'demo-supplier-001',
            email: 'supplier@tradewave.io',
            name: 'Demo Supplier',
            password: 'password123',
            role: 'SUPPLIER',
            companyName: 'Premium Supplies Co.',
            walletAddress: null,
          },
          'am1@tradewave.io': {
            id: 'demo-am-001',
            email: 'am1@tradewave.io',
            name: 'Sarah Johnson',
            password: 'password123',
            role: 'ACCOUNT_MANAGER',
            companyName: 'Tradewave',
            walletAddress: null,
          },
          'am2@tradewave.io': {
            id: 'demo-am-002',
            email: 'am2@tradewave.io',
            name: 'Michael Chen',
            password: 'password123',
            role: 'ACCOUNT_MANAGER',
            companyName: 'Tradewave',
            walletAddress: null,
          },
          'procurement1@tradewave.io': {
            id: 'demo-proc-001',
            email: 'procurement1@tradewave.io',
            name: 'David Rodriguez',
            password: 'password123',
            role: 'PROCUREMENT_OFFICER',
            companyName: 'Tradewave',
            walletAddress: null,
          },
          'procurement2@tradewave.io': {
            id: 'demo-proc-002',
            email: 'procurement2@tradewave.io',
            name: 'Emily Watson',
            password: 'password123',
            role: 'PROCUREMENT_OFFICER',
            companyName: 'Tradewave',
            walletAddress: null,
          },
        };

        const demoUser = demoUsers[credentials.email];
        if (demoUser && credentials.password === demoUser.password) {
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            companyName: demoUser.companyName,
            walletAddress: demoUser.walletAddress,
          };
        }

        // Try database if not a demo user
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          if (user.status !== 'ACTIVE') {
            throw new Error('Account is not active');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyName: user.companyName,
            walletAddress: user.walletAddress,
          };
        } catch (error) {
          // If database is unavailable, only demo users work
          throw new Error('Invalid credentials');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyName = user.companyName;
        token.walletAddress = user.walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyName = token.companyName as string;
        session.user.walletAddress = token.walletAddress as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
