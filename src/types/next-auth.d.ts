// src/types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  // ขยาย Interface ของ User
  interface User {
    id: string
    role: string
  }
  // ขยาย Interface ของ Session
  interface Session {
    user: User & {
      id: string
      role: string
    }
  }
}