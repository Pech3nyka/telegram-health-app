console.log("MONGO_URI загружен:", !!process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Activity = require('./models/Activity');
const Sleep = require('./models/Sleep');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Backend для Telegram Health App работает!');
});

app.get('/api/getStats', (req, res) => {
  res.json({
    steps: 7500,
    calories: 1800,
    sleep: 7.2,
    water: 1.5
  });
});

app.post('/api/user', async (req, res) => {
  try {
    const { telegramId, name } = req.body;
    const user = await User.findOneAndUpdate(
      { telegramId },
      { telegramId, name },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
});

app.post('/api/activity', async (req, res) => {
  try {
    const { telegramId, steps, distanceKm, calories } = req.body;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const activity = new Activity({
      userId: user._id,
      steps,
      distanceKm,
      calories
    });

    await activity.save();
    res.json({ success: true, activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении активности' });
  }
});

app.get('/api/activity/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const activities = await Activity.find({ userId: user._id }).sort({ date: 1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении активности' });
  }
});

app.post('/api/sleep', async (req, res) => {
  try {
    const { telegramId, hours, quality } = req.body;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const sleep = new Sleep({
      userId: user._id,
      hours,
      quality
    });

    await sleep.save();
    res.json({ success: true, sleep });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении сна' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
