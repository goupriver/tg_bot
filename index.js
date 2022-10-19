const fs = require('fs')
const path = require('path')
const TelegramApi = require('node-telegram-bot-api')
const { readUser, addUser } = require("./firebase")
const { generateVPN } = require('./backend')
const {readfile} = require('./promise')
require('dotenv').config()

const token = process.env.TOKEN

const bot = new TelegramApi(token, { polling: true });
bot.setMyCommands([
  { command: '/start', description: 'Запустить' },
  { command: '/create', description: 'Создать VPN' },
  { command: '/education', description: 'Инструкция' },
  { command: '/help', description: 'Помощь' },
])

const optionsCreate = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Архив', callback_data: 'archive' }],
      [{ text: 'QR-код', callback_data: 'qr-code' }],
      [{ text: 'Текстовая версия', callback_data: 'text-message' }],
    ]
  })
}

const optionsUnit = (caption, method) => {
  return {
    caption,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Показать другие способы?', callback_data: 'repeat' }],
        [{ text: 'Инструкция', callback_data: method }],
      ]
    })
  }
}

bot.on('message', async (msg) => {
  const userId = msg.from.id
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name 
  const lastName = msg.from.last_name
  const text = msg.text
  if (text === '/start') {
    await bot.sendMessage(chatId, 'Добро пожаловать. \n\nВоспользуйтесь коммандами \n/create - создать VPN \n/help - получить помощь \n/education - получить инструкцию')
  } else if (text === '/create') {
    readUser(String(userId))
      .then(id => {
        if (!id) {
          addUser(String(userId), firstName, lastName)
          generateVPN(String(userId))
          bot.sendMessage(chatId, `Вам создан VPN. Выберите способ в каком виде получить конфигурационный файл`, optionsCreate)
        } else {
          bot.sendMessage(chatId, `У вас уже есть конфигурационный файл, ниже представлены способы в каком виде его получить.`, optionsCreate)
        }
      })
  } else if (text === '/education') {
    await bot.sendMessage(chatId, `
1. Загрузите программу Wireguard на свой смартфон/компьютер из Google Play или AppStore
2. Создайте конфигурационный файл - следуя /create
3. Загрузите конфигурационный файл в программу Wireguard любым удобным для вас способом /create
4. Готово!
	    
Если возникли сложности - напишите мне /help`)
  } else if (text === '/help') {
    await bot.sendMessage(chatId, `По вопросам и предложениям писать: \nтелеграм: @goupriver \nпочта: goupriver@gmail.com`)
  } else {
    await bot.sendMessage(chatId, `Я тебя не понимаю`)
  }
})

bot.on('callback_query', async msg => {
  const chatId = msg.message.chat.id
  if (msg.data === 'repeat') {
    await bot.sendMessage(chatId, `Что хотите получить?`, optionsCreate)
  } else if (msg.data === 'qr-code') {
    const stream = fs.createReadStream(path.resolve(`${__dirname}/wireguard/clients/${msg.from.id}`, `${msg.from.id}.png`))
    await bot.sendPhoto(chatId, stream, optionsUnit('Ваш QR код', 'qr'),  {}, {"content-type" :"application/octet-stream"});
  } else if (msg.data === 'archive') {
    const file = await fs.createReadStream(path.resolve(`${__dirname}/wireguard/clients/${msg.from.id}`, `${msg.from.id}.zip`));
    await bot.sendDocument(chatId, file, optionsUnit('Ваш архив', 'zip'), {}, {"content-type" :"application/octet-stream"})
  } else if (msg.data === 'text-message') {
    const ip = await readfile(path.resolve(`${__dirname}/wireguard/clients/${msg.from.id}`, 'ip'))

    const privateKey = await readfile(path.resolve(`${__dirname}/wireguard/clients/${msg.from.id}`, 'gen.key'))

    const Interface = '[Interface]'

    const PrivateKey = 'PrivateKey'
    const PrivateKeyRes = privateKey
    const Address = 'Address'
    const AddressRes = `10.0.0.${ip}/32`

    const DNS = 'DNS'
    const DNSRes = '8.8.8.8'

    const peer = '[Peer]'

    const PublicKey = 'PublicKey'
    const PublicKeyRes = 'gcTW7IjMUcXNfWW8uMV9bCHNjOURQd/17luz32pMDU4='

    const Endpoint = 'Endpoint'
    const EndpointRes = '85.193.88.111:61000'

    const AllowedIPs = 'AllowedIPs'
    const AllowedIPsRes = '0.0.0.0/0'

    await bot.sendMessage(chatId, Interface, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, PrivateKey, { disable_notification: true },   {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, PrivateKeyRes, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, Address, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, AddressRes, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, DNS, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, DNSRes, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, peer, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, PublicKey, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, PublicKeyRes, { disable_notification: true }, {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, Endpoint, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, EndpointRes, { disable_notification: true },  {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, AllowedIPs, { disable_notification: true },   {"content-type" :"text/plain"})
    await bot.sendMessage(chatId, AllowedIPsRes, optionsUnit('Текстовые настройки', 'txt'), {"content-type" :"text/plain"})
  }
})


bot.on('callback_query', async msg => {
  const chatId = msg.message.chat.id

  const userPath = (tag, amount) => {
    // tag = zip | qr | txt
    const arr = []
    for (i = 1; i <= amount; i++) {
      arr.push(
        { type: "photo", media: path.resolve(`${__dirname}/wireguard/images/${tag}`, `${i}.jpeg`) }
      )
    }
    return arr
  }
  if (msg.data === 'zip') {
    await bot.sendMediaGroup(chatId, userPath('zip', 3))
    await bot.sendMessage(chatId, "Другие варианты настройки", optionsCreate)
  } else if (msg.data === 'qr') {
    await bot.sendMediaGroup(chatId, userPath('qr', 3))
    await bot.sendMessage(chatId, "Другие варианты настройки", optionsCreate)
  } else if (msg.data === 'txt') {
    await bot.sendMediaGroup(chatId, userPath('txt', 7))
    await bot.sendMessage(chatId, "Другие варианты настройки", optionsCreate)
  }
})
