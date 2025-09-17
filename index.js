/**
* Create By Fjr.
* Contact Me on wa.me/6289692509996
* Follow https://github.com/Fjr-api
*/

import "./config.js"
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode } from "@whiskeysocket/baileys";
import Pino from "pino";
import { Boom } from "@hapi/boom"
import { smsg } from "./lib/myfunc.js";
import rebotHandler from "./rebot.js";
import { Low, JSONFile } from "lowdb"
import yargs  from "yargs/yargs";
import _  from "lodash";
const pairingCode = true
const useMobile = false


const store = {
  messages: {},
  contacts: {},
  chats: {},
  groupMetadata: async (jid) => {
    return jid;
    // return {};
  },
  bind: function (ev) {
    // Handle events
    ev.on("messages.upsert", ({ messages }) => {
      messages.forEach((msg) => {
        if (msg.key && msg.key.remoteJid) {
          this.messages[msg.key.remoteJid] =
          this.messages[msg.key.remoteJid] || {};
          this.messages[msg.key.remoteJid][msg.key.id] = msg;
        }
      });
    });
    ev.on("contacts.update", (contacts) => {
      contacts.forEach((contact) => {
        if (contact.id) {
          this.contacts[contact.id] = contact;
        }
      });
    });
    ev.on("chats.set", (chats) => {
      this.chats = chats;
    });
  },
  loadMessage: async (jid, id) => {
    return this.messages[jid]?.[id] || null;
  },
};

global.opts = new Object(
  yargs(process.argv.slice(2)).exitProcess(false).parse(),
  );
global.db = new Low(new JSONFile(`src/database.json`));
global.DATABASE = global.db; // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(function () {
        !global.db.READ
        ? (clearInterval(this),
          resolve(
            global.db.data == null
            ? global.loadDatabase()
            : global.db.data,
            ))
        : null;
      }, 1 * 1000),
      );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read();
  global.db.READ = false;
  global.db.data = {
    users: {},
    chats: {},
    database: {},
    game: {},
    settings: {},
    others: {},
    sticker: {},
    anonymous: {},
    anonconfess: {},
    ...(global.db.data || {}),
  };
  global.db.chain = _.chain(global.db.data);
};
loadDatabase();

// save database every 30seconds
if (global.db)
  setInterval(async () => {
    if (global.db.data) await global.db.write();
  }, 30 * 1000);

async function startRebot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const rebot = makeWASocket({
    auth: state,
    printQRInTerminal: !pairingCode,
    mobile: useMobile,
    logger: Pino({ level: "silent" }),

    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);

      return msg?.message || "";
    },
    defaultQueryTimeoutMs: undefined,
  });

  store.bind(rebot.ev);

  rebot.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      const mek = chatUpdate.messages[0];
      // console.log(chatUpdate)
      if (!mek.message) return;

      if (mek.userReceipt && mek.reactions && mek.pollUpdates) {
      // console.log("[SKIP] Bukan WebMessageInfo penuh:", mek.key?.id);
        return;
      }

    // handle ephemeral
      mek.message = Object.keys(mek.message)[0] === "ephemeralMessage"
      ? mek.message.ephemeralMessage.message
      : mek.message;

    // auto read status
      if (mek.key?.remoteJid === "status@broadcast") {
        await rebot.readMessages([mek.key]);
        return;
      }

    // auto read chat biasa
      let readChats = mek.key ? mek.key : mek.message.key;
      rebot.readMessages([readChats]);

    // filter DM (supaya gak double)
      if (!rebot.public && !mek.key.fromMe && chatUpdate.type === "notify") return;


    // filter WA ID tertentu (biasanya message echo)
      if (mek.key.id?.startsWith("3EB0") && mek.key.id.length === 22) return;

    // format pesan dengan smsg
      const m = smsg(rebot, mek, store);

    // filter pesan protocol
      if (m.mtype === "protocolMessage" && m.msg?.type === 17) return;

    // panggil handler utama
      await rebotHandler(rebot, m, chatUpdate, store);

    } catch (e) {
      console.error("Error handling message:", e);
    }
  });


  // rebot.ev.on("messages.upsert", async ( chatUpdate ) => {
  //   try {
  //     const mek = chatUpdate.messages[0];
  //     if (!mek.message) return;
  //     mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;

  //     if (mek.key && mek.key.remoteJid === 'status@broadcast') {
  //       await rebot.readMessages([mek.key]);
  //     }

  //     let readChats = mek.key ? mek.key : mek.message.key;
  //     rebot.readMessages([readChats]);

  //     if (!rebot.public && !mek.key.fromMe && chatUpdate.type === "notify") return

  //       if (mek.messageStubType) return

  //         if (mek.key.remoteJid.endsWith('@g.us')) {
  //           if (chatUpdate.type !== "notify") return
  //         }

  //       if (mek.key.id.startsWith("3EB0") && mek.key.id.length === 22) return

  //         const m = smsg(rebot, mek, store);

  //       if (m.mtype === "protocolMessage" && m.msg?.type === 17) return
  //         rebotHandler(rebot, m, chatUpdate, store);

  //     } catch (e) {
  //       console.error("Error handling message:", e);
  //     }
  //   });

  if (pairingCode && !rebot.authState.creds.registered) {
    if (useMobile) throw new Error('Cannot use pairing code with mobile API');

    let phoneNumber;

    if (!!global.pairingNumber) {
      phoneNumber = global.pairingNumber.replace(/[^0-9]/g, '');

      if (!phoneNumber.startsWith('62')) {
        console.log("Start with your country's WhatsApp code, Example: 62xxx");
        process.exit(0);
      }
    }

    setTimeout(async () => {
      // let pairCode = 'REBOT225'
      let code = await rebot.requestPairingCode(phoneNumber);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log(`Your Pairing Code (${phoneNumber}): `, code);
    }, 3000);
  }

  rebot.ev.on("creds.update", saveCreds);
  rebot.serializeM = (m) => smsg(rebot, m, store);
  rebot.public = true

  rebot.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(
      `Bad Session File, Please Delete Session and Scan Again`,
      );
        rebot.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        startRebot();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        startRebot();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First",
          );
        rebot.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`);
        rebot.logout();
      } else if (reason === DisconnectReason.restartRequired) {






















        console.log("Restart Required, Restarting...");
        startRebot();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        startRebot();
      } else if (reason === DisconnectReason.Multidevicemismatch) {
        console.log("Multi device mismatch, please scan again");
        rebot.logout();
      } else
      rebot.end(`Unknown DisconnectReason: ${reason}|${connection}`);
    }
    // else if (connection === 'open') {
    //     let lpor = `6289692509996@s.whatsapp.net`
    //     rebot.sendMessage(lpor, { text: `BOT ON`})
    // }
    console.log("Connected...", update);

  });

  // Setting
  rebot.decodeJid = (jid) => {
    if (!jid) return jid;
    
    // Memeriksa apakah JID memiliki format dengan ":angka@" di dalamnya
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && `${decode.user}@${decode.server}`) ||
        jid
        );
    } else {
      return jid;
    }
  };

  /**
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
  rebot.sendText = (jid, text, quoted = "", options) =>
  rebot.sendMessage(
    jid,
    { text: text, ...options },
    { quoted, ...options },
    );

  /**
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
  rebot.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
  rebot.sendMessage(
    jid,
    {
      text: text,
      mentions: [...text.matchAll(/@(\d{0,16})/g)].map(
        (v) => v[1] + "@s.whatsapp.net",
        ),
      ...options,
    },
    { quoted },
    );

  return rebot;

}

startRebot();

