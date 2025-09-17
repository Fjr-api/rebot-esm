 import "./config.js";
 import { jidNormalizedUser } from "@whiskeysocket/baileys"
 import util from "util";
 import fs from "fs"
 import { fileURLToPath } from 'url';
 import path, { dirname } from "path"
 import chalk from "chalk"
 import { exec, spawn, execSync } from "child_process"
 import ms from 'parse-ms'
 import toMs from "ms";
 import { checkUserMessageLimit } from "./lib/antispam.js"


 //Variabel declared
 let multi = true
 let nopref = false

 export default async function rebotHandler(rebot, m, chatUpdate, store) { 
  try {

// variabel body to prefix
    const body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'documentMessage') ? m.message.documentMessage.caption : (m.mtype == 'reactionMessage') ? m.message.reactionMessage.text : (m.mtype == 'locationMessage') ? m.message.locationMessage.comment : (m.mtype == 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
    const budy = (typeof m.text == 'string' ? m.text : '')
    var prefix;

    if (multi && !nopref) {
      prefix = /^[z°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[z°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : ".";
    } else {
      prefix = nopref ? "" : global.prefa || ".";
    }

const isCmd = (new RegExp(`^\\${prefix}\\S+`, 'gi')).test(body) || (!prefix && !body.startsWith('.')); // Memeriksa apakah pesan dimulai dengan prefix atau langsung command tanpa prefix
const command = isCmd ? (body.startsWith(prefix) ? body.split(' ')[0].slice(prefix.length).toLowerCase() : body.split(' ')[0].toLowerCase()) : ''; // Mengambil command setelah prefix atau langsung jika tanpa prefix
const args = isCmd ? body.trim().split(/ +/).slice(1) : [];

  // variabel user and subject
const text = args.join(" ")
const q = args.join(" ")
const pushname = m.pushName || "No Name"
const botNumber = await rebot.decodeJid(rebot.user.id)
const creatorIds = [botNumber, ...global.owner]
.map(v => {
  const num = v.replace(/[^0-9]/g, '');
  return [
    `${num}@s.whatsapp.net`,
    `${num}@c.us`,
    `${num}@lid`
  ];
})
.flat();
const isCreator = creatorIds.includes(m.sender);
const isModerator = isCreator || (global.db.data.users[m.sender] && global.db.data.users[m.sender].moderator === true)
const isPremium = isCreator || (global.db.data.users[m.sender] && global.db.data.users[m.sender].premium && global.db.data.users[m.sender].premium.status === true);
const isBan = (global.db.data.users[m.sender] && global.db.data.users[m.sender].banned && global.db.data.users[m.sender].banned === true);
const isBanspam = (global.db.data.users[m.sender] && global.db.data.users[m.sender].banspam && global.db.data.users[m.sender].banspam.status === true);


  // variabel Group
const groupMetadata = m.isGroup ? await rebot.groupMetadata(m.chat).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata.subject : ''

//Another variabel 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//DATABASE INISIALIZATION
try {
  let limitUser = isPremium ? global.limitawal.premium : global.limitawal.free
  let isNumber = x => typeof x === 'number' && !isNaN(x)

// tentukan jid & lid
  let jid, lid
  if (m.sender.endsWith('@s.whatsapp.net')) {
   jid = m.sender
   lid = await getLidFromJid(m.sender)
 } else if (m.sender.endsWith('@lid')) {
  jid = m.key.participantAlt
  lid = m.sender
}

let keyUser = jid || m.sender
let user = global.db.data.users[keyUser]

if (typeof user !== 'object') global.db.data.users[keyUser] = {}
  user = global.db.data.users[keyUser]

if (user) {
 if (!isNumber(user.afkTime)) user.afkTime = -1
   if (!('afkReason' in user)) user.afkReason = ''
     if (!isNumber(user.limit)) user.limit = limitUser
      if (!('banned' in user)) user.banned = false
        if (!('moderator' in user)) {
          user.moderator = { status: false, expired: 0 }
        }
        if (!('premium' in user)) {
          user.premium = { status: false, expired: 0 }
        }
   // simpan identitas
        user.jid = jid
        user.lid = lid
      } else {
       global.db.data.users[keyUser] = {
        afkTime: -1,
        afkReason: '',
        limit: limitUser,
        moderator: { status: false, expired: 0 },
        premium: { status: false, expired: 0 },
        banspam: { status: false, expired: 0 },
        banned: false,
        jid,
        lid
      }
    }


    let chats = global.db.data.chats[m.chat]
    if (typeof chats !== 'object') global.db.data.chats[m.chat] = {}
      if (chats) {
        if (!('mute' in chats)) chats.mute = false
          if (!('antilink' in chats)) chats.antilink = false
            if (!('mentionsTag' in chats)) chats.mentionsTag = { antiMention: false, autoKick: false }
              if (!('antiurl' in chats)) chats.antiurl = { antiurls: false, autoKickurl: false, setMessageUrl: true }
            } else global.db.data.chats[m.chat] = {
              mute: false,
              antilink: false,
              mentionsTag: { antiMention: false, autoKick: false },
              antiurl: { antiurls: false, autoKickurl: false, setMessageUrl: true },
            }

            let setting = global.db.data.settings[botNumber]
            const now = new Date();
            if (typeof setting !== 'object') global.db.data.settings[botNumber] = {}
              if (setting) {
                if (!isNumber(setting.status)) setting.status = 0
                  if (!isNumber(setting.hit)) setting.hit = 0
                    if (!isNumber(setting.resetlimit)) setting.resetlimit = { dateYesterday:  new Date().getDate(), boolLimit: false }
                      if (!('earthquakeData' in setting)) setting.earthquakeData = null
                        if (!('autobio' in setting)) setting.autobio = true
                          if (!('templateImage' in setting)) setting.templateImage = false
                            if (!('templateVideo' in setting)) setting.templateVideo = false
                              if (!('templateGif' in setting)) setting.templateGif = false
                                if (!('templateLoc' in setting)) setting.templateLoc = true
                                  if (!('templateMsg' in setting)) setting.templateMsg = false    
                                } else global.db.data.settings[botNumber] = {
                                  status: 0,
                                  hit: 0,
resetlimit: { dateYesterday:  new Date().getDate(), boolLimit: false }, // Fixed this line
earthquakeData: null,
autobio: true,
templateImage: false,
templateVideo: false,
templateGif: false,
templateLoc: true,
templateMsg: false,
}

} catch (err) {
  console.error(err)
}

if (m.message) {
  console.log(chalk.black(chalk.bgGreen('[ TIME ]')), chalk.black(chalk.bgGreen(new Date)) + '\n' + chalk.white('[ PESAN ]'), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> Dari'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=> Di'), chalk.green(m.isGroup ? groupName : 'Private Chat', m.chat))
  // console.log(m)
}

if (isBan) {
  return m.reply('> _ⓘ Maaf kamu sudah terbanned permanen di bot ini_')
} 

async function getLidFromJid(id) {
  if (id.endsWith("@lid")) return id;
  const res = await rebot.onWhatsApp(id).catch(() => []);
  // console.log(res)
  return res[0]?.lid || id;
}

async function normalizedMention(id) {
  if (id.startsWith("@")) {
    let lidNumber = id.replace(/^@/, '') 
    let userLid = lidNumber + '@lid'
    let userEntry = Object.values(global.db.data.users).find(u => u.lid === userLid)
    if (userEntry) {
      let res = userEntry.jid
      console.log(userLid + "<-->" + res)
      return res
    }
  } else {
    let res = id.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    console.log(res)
    return res
  }
}


/////////////////////////Funcion moderator/////////////////////////////// 

const expiredModeratorCheck = (rebot, db) => {
  setInterval(() => {
    Object.keys(db.data.users).forEach((jid) => {
      let user = db.data.users[jid];
// Pastikan user memiliki properti premium dan waktu expired tidak nol
      if (
        user.moderator && 
        user.moderator.status === true && 
        user.moderator.expired !== 0 &&
        Date.now() >= user.moderator.expired
        ) {
// Reset status premium dan limit ke nilai free
        user.moderator = { status: false, expired: 0 };

// Kirim notifikasi ke user bahwa premium telah expired
      rebot.sendText(jid, '「 *moderator Expired* 」\n\n*_Masa moderator kamu sudah berakhir, sekarang kamu tidak lagi Menjadi Moderator_*\n\n> _ⓘ Jika kamu ingin membeli bisa ketik .toko atau chat owner_');
      rebot.sendText(global.ownerJid+`@s.whatsapp.net`,`*「  MODERATOR EXPIRED 」* \n\nHai Owner! Waktu moderator *${jid}*, Telah Berakhir!`, m);

    }
  });
}, 1000); // Pengecekan dilakukan setiap 1 detik
};

expiredModeratorCheck(rebot, global.db)
/////////////////////////end function///////////////////////////////



/////////////////////////Funcion antispam/////////////////////////////// 

function extractCommands(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /case\s+'([^']+)'(?=:)/g;
  let match;
  const cmdTect = [];

  while ((match = regex.exec(content)) !== null) {
    cmdTect.push(match[1]);
  }

  return cmdTect;
}

const cmdTecth = extractCommands(path.join(__dirname, 'rebot.js'));


if (!isCreator && isCmd && checkUserMessageLimit(m.sender)) {
  const spamTime = toMs("30m")
const additionalTime = toMs("10m"); // Waktu tambahan 15 menit
const user = global.db.data.users[m.sender]

if (!isBanspam) {
  user.banspam = { status: true, expired: Date.now() + spamTime };
} else {
  const remainingTime = user.banspam.expired - Date.now();
  const newDuration = remainingTime + additionalTime;
  user.banspam.expired += toMs(`${newDuration}ms`);
  m.reply('> _ⓘ Melakukan spam saat masa banned/coldown, waktu coldown kamu ditambahkan 5 menit_')
}

rebot.sendText(`6289692509996@s.whatsapp.net`, 'SPAM DETECTION!!', m);
m.reply('> _ⓘ Maaf kamu terdeteksi melakukan spam, kamu akan dibanned dan tidak bisa menggunakan fitur bot sementara dengan coldown waktu 60 menit_\n> _Silahkan gunakan fitur .cekspam untuk melihat detail coldown_');
}

const expiredBanSpam = (rebot, db) => {
  setInterval(() => {
    Object.keys(db.data.users).forEach((jid) => {
      let user = db.data.users[jid];
// Pastikan user memiliki properti premium dan waktu expired tidak nol
      if (
        user.banspam && 
        user.banspam.status === true && 
        user.banspam.expired !== 0 &&
        Date.now() >= user.banspam.expired
        ) {
// Reset status premium dan limit ke nilai free
        user.banspam = { status: false, expired: 0 };

// Kirim notifikasi ke user bahwa premium telah expired
      rebot.sendText(jid, '「 *Masa Banned Selesai* 」 \n\n*_Waktu banned kamu sudah selesai, Sekarang kamu sudah bisa menggunakan bot kembali_*\n\n> _ⓘ Mohon agar tidak melakukan spam lagi!!_')
     // rebot.sendText(global.ownerJid+`@s.whatsapp.net`,`*「  MODERATOR EXPIRED 」* \n\nHai Owner! Waktu moderator *${jid}*, Telah Berakhir!`, m);

    }
  });
}, 1000); // Pengecekan dilakukan setiap 1 detik
};

expiredBanSpam(rebot, global.db)
/////////////////////////end function///////////////////////////////



switch (command) {
case "tes":
  if (isBanspam) return m.reply(mess.spam)

    await rebot.sendMessage(m.chat, { text: "✅ Done! Active and working." }, { quoted: m });
    // console.log(m)
  break;

case 'public': {
  if (!isCreator) return m.reply(mess.owner)
    rebot.public = true
  m.reply('Sukse Change To Public Usage')
}
break
case 'self': {
  if (!isCreator) return m.reply(mess.owner)
    rebot.public = false
  m.reply('Sukses Change To Self Usage')
}
break

case 'metadata' : {
  if (!isModerator) return m.reply(mess.mod)
    if (isBanspam) return m.reply(mess.spam)

      let target = text
    ? await normalizedMention(text)
    : m.quoted
    ? m.quoted.sender
    : m.sender;
  // console.log(target)
    let chatData = global.db.data.users[target] || {};

// Format data menjadi string JSON yang rapi
    let formattedData = JSON.stringify(chatData, null, 2);

// Kirimkan pesan dengan isi database
    m.reply(`Database: \n\`\`\`${formattedData}\`\`\``);
  }
  break

case 'moderator': {
  if (!isCreator) return m.reply("Hanya owner/creator yang dapat menggunakan perintah ini.");

  let [action, expired, num] = text.split(" ");
  if (!action || (action !== 'add' && action !== 'del')) {
    return m.reply("Format salah! Gunakan .premium [add|del] [expired] <noinput628../reply/mention");
  }

  let target = num
  ? await normalizedMention(num)
  : m.quoted
  ? m.quoted.sender
  : null;

  if (!target) return m.reply("Silahkan sebutkan target!\n.premium [add|del] [expired] <noinput628../reply/mention");


// Proses add atau del premium
  if (action === 'add') {
    if (!expired) return m.reply("Format waktu tidak valid! Gunakan seperti 1d, 7h, 30m.");
    global.db.data.users[target].moderator = { status: true, expired: Date.now() + toMs(expired) };
    global.db.data.users[target].limit = global.limitawal.moderator;
    rebot.sendTextWithMentions(m.chat,`✅ *@${target.split('@')[0]}* sekarang menjadi moderator bot selama *${expired}*!`, m);
    await rebot.sendMessage(target, { text: `🎉 Selamat! Kamu telah menjadi *moderator* selama *${expired}*!\n\n> _Gunakan fitur .cekmoderator untuk melihat sisa waktu atau expired_` });
  } else if (action === 'del') {
    global.db.data.users[target].moderator = { status: false, expired: 0 };
    global.db.data.users[target].limit = global.limitawal.free;
    m.reply(`Berhasil menghapus premium dari ${target}`);
  }
}
break;

case 'moderatorheck':
case 'checkmoderator':
case 'moderatorcek':
case 'cekmoderator': {
  if (isBanspam) return m.reply(mess.spam)
    let dbprem = global.db.data.users[m.sender]
  if (!global.db.data.users[m.sender].moderator.status) return m.reply(`> _Kamu tidak terdaftar sebagai moderator. Ketik ${prefix}toko untuk membeli hak moderator`)
    let cekvip = ms(dbprem.moderator.expired - Date.now())
  let premiumnya = `*「  MODERATOR EXPIRED 」*\n\n➸ *ID*: ${m.sender}\n➸ *Expired :* ${cekvip.days} day(s) ${cekvip.hours} hour(s) ${cekvip.minutes} minute(s)`
  m.reply(premiumnya)
}
break

case 'addlimit': {
  if (!isCreator) return m.reply(mess.owner);

  try {
    let [jmlh, num] = text.split(" ");
    let jumlah = parseInt(jmlh)
    if (isNaN(jumlah) || jumlah <= 0) return m.reply('> _ⓘ Masukkan angka limit yang valid!_\n_Example:.addlimit 5 62..._');

    let target = num
    ? await normalizedMention(num)
    : m.quoted
    ? m.quoted.sender
    : null;

    if (!target) return m.reply('> _ⓘ Harap reply pengguna atau masukkan nomor target dengan format 62...!_\n> _Example:.addlimit 5 62..._');
    if (!global.db.data.users[target]) return m.reply('> _ⓘ Pengguna tidak ditemukan dalam database!_');

    global.db.data.users[target].limit += jumlah;

    rebot.sendTextWithMentions(m.chat,`✅ Berhasil menambahkan *${jumlah}* limit ke *@${target.split('@')[0]}*!`, m);

// Kirim notifikasi ke target
    await rebot.sendMessage(target, { text: `📢 Kamu mendapatkan tambahan *${jumlah}* limit dari Owner!` });

  } catch (err) {
    console.error(err);
    m.reply('❌ Terjadi kesalahan! Transaksi dibatalkan.');
  }
}
break;

case 'dellimit': {
  if (!isCreator) return m.reply(mess.owner);

  try {
    let [jmlh, num] = text.split(" ");
    let jumlah = parseInt(jmlh)
    if (isNaN(jumlah) || jumlah <= 0) return m.reply('> _ⓘ Masukkan angka limit yang valid!_\n_Example:.dellimit 5 62..._');

    let target = num
    ? await normalizedMention(num)
    : m.quoted
    ? m.quoted.sender
    : null;

    if (!target) return m.reply('> _ⓘ Harap reply pengguna atau masukkan nomor target dengan format 62...!_\n> _Example:.dellimit 5 62..._');
    if (!global.db.data.users[target]) return m.reply('> _ⓘ Pengguna tidak ditemukan dalam database!_');

    global.db.data.users[target].limit -= jumlah;

    rebot.sendTextWithMentions(m.chat,`✅ Berhasil menghapus *${jumlah}* limit ke *@${target.split('@')[0]}*!`, m);


  } catch (err) {
    console.error(err);
    m.reply('❌ Terjadi kesalahan! Transaksi dibatalkan.');
  }
}
break;

case 'transferlimit': case 'tflimit': {
  if (isBanspam) return m.reply(mess.spam)
    try {
      let [jmlh, num] = text.split(" ");
      let jumlah = parseInt(jmlh)
      let target = num
      ? await normalizedMention(num)
      : m.quoted
      ? m.quoted.sender
      : null;

      if (!jumlah || isNaN(jumlah) || jumlah <= 0) return m.reply('> _ⓘ Masukkan nominal limit yang valid!_\n> _Example:.transferlimit 5 62..._');
      if (!target) return m.reply('> _ⓘ Masukkan nomor target dengan format 62...!_\n> _Example:.transferlimit 5 62..._');
      if (!global.db.data.users[target]) return m.reply('> _ⓘ Pengguna tidak ditemukan dalam database!_');
      if (!global.db.data.users[m.sender]) return m.reply('> _ⓘ Data kamu tidak ditemukan dalam database!_');

      let senderLimit = global.db.data.users[m.sender].limit;
      if (senderLimit < jumlah) return m.reply('> _ⓘ Limit kamu tidak mencukupi untuk transfer ini!_');

// Kurangi limit pengirim dan tambahkan ke penerima
      global.db.data.users[m.sender].limit -= jumlah;
      global.db.data.users[target].limit += jumlah;

      rebot.sendTextWithMentions(m.chat,`✅ Berhasil mentransfer *${jumlah}* limit ke *@${target.split('@')[0]}*!`,m);

// Kirim notifikasi ke target
      await rebot.sendMessage(target, { text: `📢 Kamu menerima *${jumlah}* limit dari *@${m.sender.split('@')[0]}*!`});

    } catch (err) {
      console.error(err);
      m.reply('❌ Terjadi kesalahan! Transaksi dibatalkan.');
    }
  }
  break;

case 'ban': {
  if (!isModerator) return m.reply("Hanya owner/creator yang dapat menggunakan perintah ini.");
  if (isBanspam) return m.reply(mess.spam)

    let num = args[1]

  let target = num
  ? await normalizedMention(num)
  : m.quoted
  ? m.quoted.sender
  : null;

  if (!target) return m.reply("Silahkan sebutkan target!\n.premium [add|del] <noinput628../reply/mention");


// Proses add atau del 
  if (args[0] === 'add') {
    global.db.data.users[target].banned = true
    rebot.sendTextWithMentions(m.chat,`✅ User dengan ID *@${target.split('@')[0]}* Sukse diban`, m);
  } else if (args[0] === 'del') {
    global.db.data.users[target].banned = false
    m.reply(`Berhasil membuka ban dari ${target}`);
  }
}
break;

case 'spamcheck':
case 'cekspam': {
  if (isBan) return m.reply('> _ⓘ Maaf kamu sudah terbanned permanen di bot inii_')
    if (!isBanspam) return m.reply(`> _ⓘ Fitur Khusus bagi pengguna yang telah melakukan spam dan mendapatkan penalti_`)
      let cekspamm = ms(global.db.data.users[m.sender].banspam.expired - Date.now())
    let sispamnya = `*「 SPAM EXPIRE 」*\n\n➸ *ID*: ${m.sender}\n➸ *Expired :* ${cekspamm.days} day(s) ${cekspamm.hours} hour(s) ${cekspamm.minutes} minute(s)`
    m.reply(sispamnya)
  }
  break

case 'spamlist':
case 'listspam': {
  if (!isCreator) return m.reply(mess.owner);

  let users = global.db.data.users;
  let spamUsers = Object.entries(users).filter(([jid, data]) => data.banspam && data.banspam.status);

  if (spamUsers.length === 0) return m.reply("> _ⓘ Tidak ada user yang sedang terkena banspam._");

  let txt = `📑 *List Spam*\nJumlah: ${spamUsers.length}\n\n`;

  for (let [jid, data] of spamUsers) {
    let sisa = data.banspam.expired - Date.now();
    if (sisa < 0) continue; // kalau sudah lewat, skip

    let seconds = Math.floor(sisa / 1000) % 60;
    let minutes = Math.floor(sisa / (1000 * 60)) % 60;
    let hours   = Math.floor(sisa / (1000 * 60 * 60)) % 24;
    let days    = Math.floor(sisa / (1000 * 60 * 60 * 24));

    txt += `*ID:* @${jid.split('@')[0]}\n`;
    txt += `*Expire:* ${days} day(s) ${hours} hour(s) ${minutes} minute(s) ${seconds} second(s)\n\n`;
  }

  rebot.sendTextWithMentions(m.chat, txt, m);
}
break;

case 'banspam': {
  if (!isCreator) return m.reply("Hanya owner/creator yang dapat menggunakan perintah ini.");

  let [action, expired, num] = text.split(" ");
  if (!action || (action !== 'add' && action !== 'del')) {
    return m.reply("Format salah! Gunakan .banspam [add|del] [expired] <noinput628../reply/mention");
  }

  let target = num
  ? await normalizedMention(num)
  : m.quoted
  ? m.quoted.sender
  : null;

  if (!target) return m.reply("Silahkan sebutkan target!\n.banspam [add|del] [expired] <noinput628../reply/mention");


// Proses add atau del premium
  if (action === 'add') {
    if (!expired) return m.reply("Format waktu tidak valid! Gunakan seperti 1d, 7h, 30m.");
    global.db.data.users[target].banspam = { status: true, expired: Date.now() + toMs(expired) };
    rebot.sendTextWithMentions(m.chat,`✅ *@${target.split('@')[0]}* dibanned selama *${expired}*!`, m);
  } else if (action === 'del') {
    global.db.data.users[target].banspam = { status: false, expired: 0 };
    m.reply(`Berhasil menghapus baspam dari ${target}`);
  }
}
break;


default:


  if (budy.startsWith(">")) {
    try {
      if (!isCreator) return m.reply('lu bukan owner')
        let evaled = await eval(budy.slice(1));
      if (typeof evaled !== "string") {
        evaled = util.inspect(evaled);
      }
      await m.reply(evaled);
    } catch (err) {
      await m.reply(String(err));
    }
  }

  if (budy.startsWith('$')) {
    if (!isCreator) return 
      exec(budy.slice(2), (err, stdout) => {
        if(err) return m.reply(err)
          if (stdout) return m.reply(stdout)
        })
  }

}
} catch (err) {
  await rebot.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
}
}
