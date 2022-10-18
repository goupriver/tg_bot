const exampleClient = function({privateKey, ip}) {
  return `[Interface]\nPrivateKey = ${privateKey}\nAddress = 10.0.0.${ip}/32\nDNS = 8.8.8.8\n\n[Peer]\nPublicKey = gcTW7IjMUcXNfWW8uMV9bCHNjOURQd/17luz32pMDU4=\nEndpoint = 85.193.88.111:61000\nAllowedIPs = 0.0.0.0/0\n`
}

module.exports.exampleClient = exampleClient