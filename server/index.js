const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
