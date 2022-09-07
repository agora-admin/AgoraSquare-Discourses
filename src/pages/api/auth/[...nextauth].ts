import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

let username = "";

export default NextAuth({
    providers: [
        TwitterProvider({
            clientId: process.env.CLIENT_ID!,
            clientSecret: process.env.CONSUMER_SECRET!,
            version: '2.0',
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    callbacks: {
        async session({ session, user, token }) {
            (session as any).user.username = token.username;
            return session
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            // console.log("token", token, user, account, profile);
            if (profile) {
                token.username = (profile as any).data.username;
            }
            return token
        }

    },
});