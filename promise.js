const fs = require('fs')
const path = require('path')
const { exec } = require('child_process');

const writefile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

const makedir = (path) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err, path) => {
      if (err) {
        reject(err)
      }
      resolve(path)
    })
  })
}

const generateKey = (path) => {
  return new Promise((resolve, reject) => {
    exec(`wg genkey | tee ${path}/gen.key | wg pubkey > ${path}/pub.key`, (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      resolve(path)
    })
  })
}

const readfile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
      if(err) {
        reject(err.message)
      }
      resolve(data)
    })
  })
}

const addPeer = async ({clientPubKey, ip}) => {
  return new Promise((resolve, reject) => {
    const ar0 = [...clientPubKey]
    const ar1 = ar0.splice(-1, 1);
    const ar2 = ar0.join("")
    exec(`wg set wg0 peer ${ar2} allowed-ips 10.0.0.${ip}/32`, (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      resolve(ip)
    })
  })
}

const saveWg = () => {
  return new Promise((resolve, reject) => {
    exec(`wg-quick save wg0`, (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      resolve()
    })
  })
}

const genQR = ({path, userID}) => {
  return new Promise((resolve, reject) => {
    exec(`qrencode -o ${path}/${userID}.png -s 7  < ${path}/${userID}.conf`, (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      resolve()
    })
  })
}

const createZIP = ({path, userID}) => {
  return new Promise((resolve, reject) => {
    exec(`zip -j ${path}/${userID}.zip ${path}/${userID}.conf`, (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      resolve()
    })
  })
}

module.exports.writefile = writefile
module.exports.makedir = makedir
module.exports.generateKey = generateKey
module.exports.readfile = readfile
module.exports.addPeer = addPeer
module.exports.saveWg = saveWg
module.exports.genQR = genQR
module.exports.createZIP = createZIP