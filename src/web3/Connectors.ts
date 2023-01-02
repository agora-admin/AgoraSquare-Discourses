import UAuth from '@uauth/js'

const uauth = new UAuth({
  clientID: process.env.NEXT_PUBLIC_UNSTOPPABLE_CLIENT_ID as string,
  redirectUri: process.env.NEXT_PUBLIC_CLIENT_URL as string,
  scope: "openid wallet"
})

export default uauth;