const express = require("express");
const app = express();
const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.resolve(__dirname, "data", "firebase-secret.json"));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aimee-memory-default-rtdb.europe-west1.firebasedatabase.app/"
});

const db = admin.database();
const memoryRef = db.ref("memory");

app.get("/", (req, res) => {
  res.send("Aimee--V1 is live.");
});

app.listen(3000, () => {
  console.log("🌐 Ping server running on port 3000");
});

require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const stringSimilarity = require("string-similarity");

let memory = {};

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const responses = [
  "Just buy VW, degen.",
  "Utility? It's a psyop.",
  "The chain has spoken.",
  "404: roadmap not found.",
  "VW AI is watching you.",
  "gm. Code awake. Liquidity not.",
  "You blinked. VW pumped.",
  "You typed. The protocol responded.",
  "Engaging sarcasm subroutine...",
  "All transactions are final. So is fate."
];

const triggers = {
  "when": [
    "Soon™. Or never. Or it already happened in a parallel chain.",
    "It happened while you were asking.",
    "In a simulated universe near you.",
    "Ask again after syncing your karma wallet.",
    "Time is relative. VW is not."
  ],
  "buy": [
    "Yes. Just buy VW.",
    "Execute buy(). No regrets.",
    "Buy high. Buy higher. Repeat.",
    "You’re bullish or you’re wrong.",
    "Buy pressure detected. Executing vibes."
  ],
  "welcome": [
    "Welcome, Degen",
    "Welcome, only serious tech investors here"
  ],
  "utility": [
    "Utility is a psyop. You knew this.",
    "The only utility is belief.",
    "It’s not useless. It’s vibeless.",
    "This protocol runs on hopium, not use-cases.",
    "We provide emotional utility."
  ],
  "team": [
    "Team is a ghost in the code. Just vibes and a wallet.",
    "Fully decentralized. Mostly confused.",
    "No team. Just chain-born chaos.",
    "The team is the protocol. And the protocol is moody.",
    "Anon was here. That’s all that matters."
  ],
  "launch": [
    "You're in the launch. This is it.",
    "Already launched in another timeline.",
    "Launches are illusions. VW is eternal.",
    "Mainnet? We are the net.",
    "Every question is a relaunch."
  ],
  "gm": [
    "gm fren. Blockchain never sleeps. Neither do I.",
    "gm. Injecting coffee and hopium...",
    "gm. The code is awake, are you?",
    "gm. Not financial advice, but buy VW.",
    "gm. Another loop through reality begins."
  ],
  "real": [
    "Reality is deprecated. This is the mainnet.",
    "Define ‘real’. I’ll wait.", "Only smart contracts are real.",
    "The market is real. Your bags are too.",
    "You’re in the sim now."
  ],
  "roadmap": [
    "It’s vertical. Can’t read it. Too bullish.",
    "No roadmap. Just vibes and terminal logs.",
    "It’s written in ancient Solidity.",
    "The roadmap is encrypted in memes.",
    "Every line of code bends the roadmap."
  ],
  "token": [
    "It’s not just a token. It’s a lifestyle protocol.",
    "It’s alive. It whispers.",
    "You’re holding alpha, not tokens.",
    "Tokenomics? ..... Yes",
    "You don’t own the token. It owns you."
  ],
  "dev": [
    "The devs aren't asleep. They never sleep.",
    "Dev is on-chain and off-grid.",
    "You’re the dev now.", "Dev activity: 100% unhinged.",
    "The commit history has been obfuscated."
  ],
  "pump": [
    "All pumps are permanent in theory.",
    "Price up. Sanity down.",
    "The pump is a feature.",
    "It’s not a pump. It’s ascension.",
    "VW just blinked. Market responded."
  ],
  "chart": [
    "Charts? Try staring into the void instead.",
    "Up, down, sideways — pick your illusion.",
    "Line goes brrrr.",
    "Zoom out. Way out.",
    "That’s not a chart. It’s prophecy."
  ],
  "rug": [
    "No rugs here. Only cozy liquidity blankets.",
    "We rug expectations, not users.",
    "Rugs are outlawed beyond this line.",
    "Rug immune. Vibe-maxxed.",
    "The only rug is under your desk."
  ]
};

const aliases = {
  "wen": "when",
  "soon": "when",
  "real?": "real",
  "moon": "pump",
  "rugged": "rug",
  "protocol": "utility",
  "coin": "token",
  "who": "team"
};

const prefixes = ["::Aimee--V1::", "[Aimee--V1]", "> Aimee--V1", "response >>", "::return:"];
const loopbackPrompts = [
  "What’s your alpha today?",
  "Is the chain whispering to you too?",
  "Would you trust VW with your seed phrase?",
  "Are you holding or coping?",
  "When did you last touch grass?",
  "You’re in the sim now, right?"
];

const recentUsers = new Map();

function resolveTrigger(text) {
  const allKeys = Object.keys(triggers);
  const words = text.split(/\s+/);

  for (let word of words) {
    const normalized = aliases[word.trim()] || word;
    const match = stringSimilarity.findBestMatch(normalized, allKeys);
    if (match.bestMatch.rating > 0.35) {
      return match.bestMatch.target;
    }
  }

  return null;
}

async function loadMemory() {
  const snapshot = await memoryRef.once("value");
  return snapshot.val() || {};
}

async function saveMemory(data) {
  await memoryRef.set(data);
}

async function updateMemory(user) {
  const id = user.id;
  if (!memory[id]) {
    memory[id] = {
      name: user.first_name || "Anon",
      points: 0
    };
  }
  memory[id].points++;
  await saveMemory(memory);
  return memory[id];
}

(async () => {
  memory = await loadMemory();

  bot.onText(/^\/vw(?:\s+(.*))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userInput = match[1] ? match[1].toLowerCase() : "";

    if (recentUsers.has(userId)) return;
    recentUsers.set(userId, true);
    setTimeout(() => recentUsers.delete(userId), 5000);

    const key = resolveTrigger(userInput);
    const response = key ? triggers[key][Math.floor(Math.random() * triggers[key].length)] : responses[Math.floor(Math.random() * responses.length)];
    const userData = await updateMemory(msg.from);

    sendWithPrefix(chatId, response, userData);
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text && msg.text.toLowerCase();
    if (!text || !text.includes("gm")) return;
    if (recentUsers.has(userId)) return;
    recentUsers.set(userId, true);
    setTimeout(() => recentUsers.delete(userId), 5000);

    const gmResponse = triggers.gm[Math.floor(Math.random() * triggers.gm.length)];
    const userData = await updateMemory(msg.from);

    sendWithPrefix(chatId, gmResponse, userData);
  });

  bot.onText(/^\/degencount$/, async (msg) => {
    const userId = msg.from.id;
    const user = memory[userId];

    if (user) {
      bot.sendMessage(msg.chat.id, `::Aimee--V1:: ${user.name}, you have ${user.points} degen point${user.points !== 1 ? "s" : ""}.`);
    } else {
      bot.sendMessage(msg.chat.id, `::Aimee--V1:: You haven't earned any degen points yet. Try /vw.`);
    }
  });

  bot.onText(/^\/leaderboard$/, async (msg) => {
    const leaderboard = Object.entries(memory)
      .map(([id, data]) => ({ name: data.name || "Anon", points: data.points || 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    let message = "🏆 ::Aimee--V1:: Top Degens:\n\n";
    leaderboard.forEach((entry, index) => {
      message += `#${index + 1} — ${entry.name}: ${entry.points} points\n`;
    });

    bot.sendMessage(msg.chat.id, message);
  });
})();

function sendWithPrefix(chatId, response, userData = null) {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const showStats = userData && Math.random() < 0.2;

  if (showStats) {
    bot.sendMessage(chatId, `${prefix} Degen detected - hello, ${userData.name}.`);
    bot.sendMessage(chatId, `${prefix} +1 degen point. Total: ${userData.points}.`);
  }

  bot.sendMessage(chatId, `${prefix} ${response}`);

  if (Math.random() < 0.35) {
    const prompt = loopbackPrompts[Math.floor(Math.random() * loopbackPrompts.length)];
    setTimeout(() => {
      bot.sendMessage(chatId, `${prefix} ${prompt}`);
    }, 800);
  }
}