const path = require('path')
const fs = require('fs')

const { exampleClient } = require('./wireguard/exampleClient')
const { makedir, writefile, generateKey, readfile, addPeer, saveWg, genQR, createZIP } = require('./promise')

const generateVPN = async (userID) => {
  // 0. создаем папку пользователя
  makedir(path.resolve(`${__dirname}/wireguard/clients`, userID))
    // 1. генерируем ключи для пользователя в папку 
    .then(p => generateKey(p))
    // 2 извлекаем приватный ключ юзера и ip
    .then(p => Promise.all([readfile(path.resolve(p, 'gen.key')), readfile(path.resolve(`${__dirname}/wireguard`, 'ip')), p]))
    // 3 создаем конфиг для пользователя
    .then(([privateKey, ip, p]) => {
      writefile(path.resolve(p, `${userID}.conf`), exampleClient({ ip, privateKey }))
      return [privateKey, ip, p]
    })
    //4 Читаем публичный ключ пира
    .then(([privateKey, ip, p]) => {
      return Promise.all([readfile(path.resolve(p, 'pub.key')), ip, p])
    })
    // 4 Добавляем пира в  файл конфигурации
    .then(([clientPubKey, ip, p]) => {
      // addPeer({clientPubKey, ip})
      return [ip, p]
    })
    // 5 инкрементируем IP
    .then(([ip, p]) => {
      writefile(path.resolve(`${p}`, 'ip'), ip)
      const increment = Number(ip) + 1
      writefile(path.resolve(`${__dirname}/wireguard`, 'ip'), String(increment))
      return p
    })
    // 6. сохраняем конфиг 
    .then(p => {
      // saveWg()
      return p
    })
    // 7. генерируем qr
    .then(p => {
      genQR({ path: p, userID })
      return [p, userID]
    })
    // 8. архивируем файл и ложим его в архив
    .then(([p, userID]) => {
      createZIP({ path: p, userID })
    })
}  

module.exports.generateVPN = generateVPN