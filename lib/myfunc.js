// lib/myfunc.js (ESM-ready)

import { proto, getContentType } from "@whiskeysocket/baileys";
import chalk from "chalk";
import fs from "fs";
import Crypto from "crypto";
import axios from "axios";
import moment from "moment-timezone";
import { sizeFormatter } from "human-readable";
import util from "util";
import * as Jimp from "jimp";

/* -------------------------
   Utility / Helper exports
   ------------------------- */

export const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);

export const generateMessageTag = (epoch) => {
  let tag = unixTimestampSeconds().toString();
  if (epoch) tag += ".--" + epoch;
  return tag;
};

export const processTime = (timestamp, now) => {
  return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

export const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

export const getBuffer = async (url, options) => {
  try {
    options = options || {};
    const res = await axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
      },
      ...options,
      responseType: "arraybuffer",
    });
    if (res.data) return Buffer.from(res.data, "binary");
    throw new Error("Response tidak berupa array buffer");
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const fetchJson = async (url, options) => {
  try {
    options = options || {};
    const res = await axios({
      method: "GET",
      url,
      headers: {
        "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
      },
      ...options,
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

export const runtime = function (seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

export const clockString = (ms) => {
  let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
};

export const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isUrl = (url) =>
typeof url === "string" &&
!!url.match(
  new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
    "gi"
    )
  );

export const getTime = (format, date) => {
  if (date) {
    return moment(date).locale("id").format(format);
  } else {
    return moment.tz("Asia/Jakarta").locale("id").format(format);
  }
};

export const formatDate = (n, locale = "id") => {
  let d = new Date(n);
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

export const tanggal = (numer) => {
  const myMonths = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu"];
  var tgl = new Date(numer);
  var day = tgl.getDate();
  var bulan = tgl.getMonth();
  var thisDay = tgl.getDay();
  thisDay = myDays[thisDay];
  var yy = tgl.getYear();
  var year = yy < 1000 ? yy + 1900 : yy;
  return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
};

export const formatp = sizeFormatter({
  std: "JEDEC",
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

export const jsonformat = (string) => JSON.stringify(string, null, 2);

function format(...args) {
  return util.format(...args);
}

export const logic = (check, inp, out) => {
  if (inp.length !== out.length) throw new Error("Input and Output must have same length");
  for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
    return null;
};

export const generateProfilePicture = async (buffer) => {
  const jimp = await Jimp.read(buffer);
  const min = jimp.getWidth();
  const cropped = jimp.crop(0, 0, min, min); // square crop
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
  };
};

export const bytesToSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getSizeMedia = (path) =>
new Promise((resolve, reject) => {
  if (/^https?:\/\//.test(path)) {
    axios.get(path).then((res) => {
      let length = parseInt(res.headers["content-length"]);
      let size = bytesToSize(length, 3);
      if (!isNaN(length)) resolve(size);
      else reject("Invalid content-length");
    }).catch(reject);
  } else if (Buffer.isBuffer(path)) {
    let length = Buffer.byteLength(path);
    let size = bytesToSize(length, 3);
    if (!isNaN(length)) resolve(size);
    else reject("Invalid buffer length");
  } else {
    reject("Unsupported path type");
  }
});

export const parseMention = (text = "") =>
[...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net");

export const getGroupAdmins = (participants) => {
  let admins = [];
  for (let i of participants) {
    i.admin === "superadmin" ? admins.push(i.jid) : i.admin === "admin" ? admins.push(i.jid) : "";
  }
  return admins || [];
};

async function normalizeJid(conn, id) {
  if (!id) return id;
  if (id.endsWith("@lid")) return id;
  const res = await conn.onWhatsApp(id).catch(() => []);
  return res[0]?.lid || id;
}

/* -------------------------
   Serialize / smsg
   ------------------------- */

/**
 * Serialize Message
 * @param {WAConnection} conn 
 * @param {Object} m 
 * @param {store} store 
 */

export const smsg = (conn, m, store) => {
  if (!m) return m;
  const M = proto.WebMessageInfo;

  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
    // Normalize remoteJid for chat context
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    // Determine sender using normalized IDs
        // di awal handler pesan, setelah decode raw sender
    const rawSender = m.fromMe 
    ? conn.user.id 
    : (m.participant || m.key.participant || m.chat || '')

// decodeJid akan balikin jid normal kalau ada
    let decoded = conn.decodeJid(rawSender)

    // kalau masih lid, coba resolve ke jid utama dari DB
    if (decoded.endsWith('@lid')) {
      let userEntry = Object.values(global.db.data.users).find(u => u.lid === decoded)
      if (userEntry) {
        decoded = userEntry.jid
      }
    }

// set ke m.sender (supaya semua fitur pakai ini)
    m.sender = decoded
    m.senderOri = conn.decodeJid(rawSender)
    m.senderLid = m.key.senderLid || null
    m.senderPn = m.key.senderPn || null
    // For group chats, normalize participant
    if (m.isGroup) {
      m.participant = conn.decodeJid( m.key.participant || '');
      m.participantLid = m.key.participantLid || null
      m.participantPn = m.key.participantPn || null
    }
  }

  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg =
    m.mtype === "viewOnceMessage"
    ? m.message.viewOnceMessage.message[getContentType(m.message.viewOnceMessage.message)]
    : m.message[m.mtype];
    m.body =
    m.message.conversation ||
    m.msg?.caption ||
    m.msg?.text ||
    (m.mtype === "listResponseMessage" && m.msg?.singleSelectReply?.selectedRowId) ||
    (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
    (m.mtype === "viewOnceMessage" && m.msg?.caption) ||
    m.text;

    const quoted = (m.msg?.contextInfo) ? m.msg.contextInfo.quotedMessage : null;
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid ?? [];

    if (quoted) {
      let type = Object.keys(quoted)[0];
      m.quoted = quoted[type];
      if (['productMessage'].includes(type)) {
        type = Object.keys(m.quoted)[0];
        m.quoted = m.quoted[type];
      }
      if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
      m.quoted.mtype = type;
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id
      ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16
      : false;
      // Normalize quoted sender
      let quotedSender = conn.decodeJid(m.msg.contextInfo.participant)
      if (quotedSender.endsWith('@lid')) {
        let userEntry = Object.values(global.db.data.users).find(u => u.lid === quotedSender)
        if (userEntry) {
          quotedSender = userEntry.jid
        }
      }
      m.quoted.sender = quotedSender || null;
      m.quoted.senderLid = normalizeJid(conn, m.msg.contextInfo.participant || null)
      m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id);
      m.quoted.text =
      m.quoted.text || m.quoted.caption || m.quoted.conversation ||
      m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || '';
      m.quoted.mentionedJid = m.msg.contextInfo.mentionedJid || [];
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        const q = await store.loadMessage(m.chat, m.quoted.id, conn);
        return exports.smsg(conn, q, store);
      };

      const vM = m.quoted.fakeObj = {
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id
        },
        message: quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {})
      };

      // Quoted message helpers
      /**
             * 
             * @returns 
             */
      /**
    * 
    * @param {*} jid 
    * @param {*} forceForward 
    * @param {*} options 
    * @returns 
     */
      m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key });
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
      conn.copyNForward(jid, vM, forceForward, options);
      m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
    }
  }

  if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg);

  m.text =
  m.msg?.text ||
  m.msg?.caption ||
  m.message?.conversation ||
  m.msg?.contentText ||
  m.msg?.selectedDisplayText ||
  m.msg?.title ||
  "";

  // Reply, copy, and forward helpers
  m.reply = (text, chatId = m.chat, options = {}) =>
  Buffer.isBuffer(text)
  ? conn.sendMedia(chatId, text, 'file', '', m, { ...options })
  : conn.sendText(chatId, text, m, { ...options });
  m.copy = () => exports.smsg(conn, JSON.parse(JSON.stringify(m)));
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
  conn.copyNForward(jid, m, forceForward, options);

  return m;
};

    /**
 * Serialize Message
 * @param {import('@whiskeysocket/baileys').WAConnection} conn
 * @param {Object} m
 * @param {Object} store
 */
// export const smsg = (conn, m, store) => {
//   if (!m) return m;
//   // m = JSON.parse(JSON.stringify(m));

//   if (m.key) {
//     m.id = m.key.id;
//     m.isBaileys = typeof m.id === "string" && m.id.startsWith("BAE5") && m.id.length === 16;
//     m.chat = m.key.remoteJid;
//     m.fromMe = m.key.fromMe;
//     m.isGroup = !!m.chat && m.chat.endsWith("@g.us");

//     const rawSender = m.fromMe ? conn.user?.id || "" : (m.participant || m.key.participant || m.chat || "");
//     let decoded = (typeof conn.decodeJid === "function") ? conn.decodeJid(rawSender) : rawSender;

//     if (decoded && decoded.endsWith && decoded.endsWith("@lid")) {
//       try {
//         // attempt to resolve from global.db if exists
//         const userEntry = global?.db?.data?.users ? Object.values(global.db.data.users).find((u) => u.lid === decoded) : null;
//         if (userEntry) decoded = userEntry.jid;
//       } catch (e) {
//         // ignore
//       }
//     }

//     m.sender = decoded;
//     m.senderOri = (typeof conn.decodeJid === "function") ? conn.decodeJid(rawSender) : rawSender;
//     m.senderLid = m.key.senderLid || null;
//     m.senderPn = m.key.senderPn || null;

//     if (m.isGroup) {
//       m.participant = (typeof conn.decodeJid === "function") ? conn.decodeJid(m.key.participant || "") : m.key.participant || "";
//       m.participantLid = m.key.participantLid || null;
//       m.participantPn = m.key.participantPn || null;
//     }
//   }

//   if (m.message) {
//     m.mtype = getContentType(m.message);
//     m.msg =
//     m.mtype === "viewOnceMessage"
//     ? m.message.viewOnceMessage.message[getContentType(m.message.viewOnceMessage.message)]
//     : m.message[m.mtype];
//     m.body =
//     m.message.conversation ||
//     m.msg?.caption ||
//     m.msg?.text ||
//     (m.mtype === "listResponseMessage" && m.msg?.singleSelectReply?.selectedRowId) ||
//     (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
//     (m.mtype === "viewOnceMessage" && m.msg?.caption) ||
//     m.text;

//     const quoted = (m.msg?.contextInfo) ? m.msg.contextInfo.quotedMessage : null;
//     m.mentionedJid = m.msg?.contextInfo?.mentionedJid ?? [];

//     if (quoted) {
//       let type = Object.keys(quoted)[0];
//       m.quoted = quoted[type];
//       if (["productMessage"].includes(type)) {
//         type = Object.keys(m.quoted)[0];
//         m.quoted = m.quoted[type];
//       }
//       if (typeof m.quoted === "string") m.quoted = { text: m.quoted };
//       m.quoted.mtype = type;
//       m.quoted.id = m.msg.contextInfo.stanzaId;
//       m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
//       m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16 : false;

//       m.quoted.sender = (typeof conn.decodeJid === "function") ? conn.decodeJid(m.msg.contextInfo.participant) : m.msg.contextInfo.participant;
//       m.quoted.senderLid = m.msg.contextInfo.senderLid || null;
//       m.quoted.senderPn = m.msg.contextInfo.senderPn || null;
//       m.quoted.participantLid = m.msg.contextInfo.participantLid || null;
//       m.quoted.participantPn = m.msg.contextInfo.participantPn || null;
//       m.quoted.fromMe = m.quoted.sender === ((typeof conn.decodeJid === "function") ? conn.decodeJid(conn.user?.id || "") : conn.user?.id);

//       m.quoted.text =
//       m.quoted.text ||
//       m.quoted.caption ||
//       m.quoted.conversation ||
//       m.quoted.contentText ||
//       m.quoted.selectedDisplayText ||
//       m.quoted.title ||
//       "";

//       m.quoted.mentionedJid = m.msg.contextInfo.mentionedJid || [];

//       m.getQuotedObj = m.getQuotedMessage = async () => {
//         if (!m.quoted.id) return false;
//         try {
//           const q = await store.loadMessage(m.chat, m.quoted.id, conn);
//           return smsg(conn, q, store);
//         } catch (e) {
//           return false;
//         }
//       };

//       const vM = m.quoted.fakeObj = {
//         key: {
//           remoteJid: m.quoted.chat,
//           fromMe: m.quoted.fromMe,
//           id: m.quoted.id
//         },
//         message: quoted,
//         ...(m.isGroup ? { participant: m.quoted.sender } : {})
//       }

//       // quoted helpers
//       m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key });
//       m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options);
//       m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
//     }
//   }

//   if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg);

//   m.text =
//   m.msg?.text ||
//   m.msg?.caption ||
//   m.message?.conversation ||
//   m.msg?.contentText ||
//   m.msg?.selectedDisplayText ||
//   m.msg?.title ||
//   "";

//   // reply / copy / forward helpers (adapted to common baileys wrapper names)
//   m.reply = (text, chatId = m.chat, options = {}) =>
//   Buffer.isBuffer(text)
//   ? conn.sendMessage(chatId, { document: text }, { quoted: m, ...options })
//   : conn.sendMessage(chatId, { text: String(text) }, { quoted: m, ...options });

//   m.copy = () => exports.smsg(conn, JSON.parse(JSON.stringify(m)));
//   m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options);

//   return m;
// };

/* -------------------------
   File watcher: simplified
   ------------------------- */
/*
  Note:
  - In CommonJS we used fs.watchFile + require.cache to auto-reload the file on changes.
  - ESM does not expose require.cache; hot-reload is more involved.
  - For development you can either restart node or implement a custom
    re-import with a cache-busting query (e.g. await import('./lib/myfunc.js?ts=' + Date.now()))
  - I'll keep a minimal file watcher that logs when file changes,
    but it will NOT auto-reload the module. Use nodemon in dev for auto restart.
*/

const THIS_FILE = new URL(import.meta.url).pathname;
try {
  fs.watch(THIS_FILE, (eventType) => {
    if (eventType === "change") {
      console.log(chalk.redBright(`Update detected: ${THIS_FILE}. Restart your process (e.g. nodemon) to apply changes.`));
    }
  });
} catch (e) {
  // ignore watcher errors on some environments
}
