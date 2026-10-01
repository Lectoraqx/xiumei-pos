import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        // 1. ค้นหาพนักงานจากอีเมล
        const user = await prisma.employee.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user) throw new Error("ไม่พบข้อมูลบัญชีผู้ใช้นี้");
        if (user.status !== "ACTIVE") throw new Error("บัญชีนี้ถูกระงับการใช้งานชั่วคราว");

        // 2. ถอดรหัสและเปรียบเทียบรหัสผ่านด้วย bcrypt
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValidPassword) throw new Error("รหัสผ่านไม่ถูกต้อง");

        // 3. ยืนยันสำเร็จ ส่งข้อมูลเบื้องต้นกลับไปสร้าง Session
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role, // 🔑 จุดสำคัญ: ส่ง Role พ่วงไปใน Session ด้วย
        };
      }
    })
  ],
  callbacks: {
    // นำ Role จาก user มาใส่ใน Token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // นำ Role จาก Token มาปล่อยให้ฝั่ง Client และ Server ใช้งานผ่านคำสั่ง session.user.role
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", // บอกระบบว่าถ้าใครยังไม่ล็อกอิน ให้เตะไปหน้า /login
  },
  session: {
    strategy: "jwt", // ใช้ JWT เป็นมาตรฐานหลัก
  },
});