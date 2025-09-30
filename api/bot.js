const admin = require('firebase-admin');
const TelegramBot = require('node-telegram-bot-api');

// আপনার Firebase প্রজেক্টের সার্ভিস অ্যাকাউন্ট কী (JSON)
// এটি Vercel এর Environment Variable থেকে আসবে
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// আপনার Firebase ডাটাবেস URL
const databaseURL = process.env.FIREBASE_DB_URL;

// Firebase অ্যাপ ইনিশিয়ালাইজ করুন (যদি আগে না করা হয়ে থাকে)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  });
}

const db = admin.database();
const bot = new TelegramBot(process.env.BOT_TOKEN);
const chatId = process.env.CHAT_ID;

// Vercel এর জন্য মূল ফাংশন
module.exports = async (req, res) => {
  try {
    const ref = db.ref('captions');
    const snapshot = await ref.once('value');
    const captions = snapshot.val();

    if (captions && captions.length > 0) {
      // একটি случайным образом ক্যাপশন নির্বাচন করুন
      const randomIndex = Math.floor(Math.random() * captions.length);
      const message = captions[randomIndex];

      // টেলিগ্রামে মেসেজ পাঠান
      await bot.sendMessage(chatId, message);

      // Vercel কে সফলতার বার্তা পাঠান
      res.status(200).send('Message sent successfully!');
    } else {
      res.status(404).send('No captions found in database.');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Something went wrong!');
  }
};
