import UAuth from '@uauth/js'

const uauth = new UAuth({
  clientID: "e481d54e-4645-4595-ae2a-f4cc09de6261",
  redirectUri: "http://localhost:3000",
  scope: "openid wallet"
})

export default uauth;