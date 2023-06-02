import UAuth from '@uauth/js'

const uauth = new UAuth({
  clientID: process.env.NEXT_PUBLIC_UNSTOPPABLE_CLIENT_ID as string,
  redirectUri: 'https://discourses.agorasquare.xyz/',
  scope: "openid wallet"
})

export default uauth;