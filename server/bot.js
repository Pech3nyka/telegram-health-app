require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

function showMainMenu(ctx) {
  return ctx.reply(
    'Вы в главном меню. Выберите действие:',
    Markup.keyboard([
      ['📊 Показать статистику', '📋 Моя активность'],
      ['🏃 Добавить активность', '😴 Добавить сон']
    ])
      .resize()
      .oneTime()
  );
}

// Старт бота
bot.start(async (ctx) => {
  const user = ctx.from;
  try {
    await axios.post(`${API_BASE_URL}/api/user`, {
      telegramId: String(user.id),
      name: user.first_name || user.username || 'Unknown'
    });
    await showMainMenu(ctx);
  } catch (error) {
    console.error('Ошибка регистрации пользователя:', error.message);
    await ctx.reply('Не удалось зарегистрировать пользователя. Попробуй позже.');
  }
});

// Показать общую статистику
bot.hears('📊 Показать статистику', async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const res = await axios.get(`${API_BASE_URL}/api/activity/byUser/${telegramId}`);
    const data = res.data;

    if (!data || data.length === 0) {
      return ctx.reply('У вас пока нет записей активности.');
    }

    let totalSteps = 0;
    let totalCalories = 0;
    let totalDistance = 0;

    data.forEach(item => {
      totalSteps += item.steps || 0;
      totalCalories += item.calories || 0;
      totalDistance += item.distanceKm || 0;
    });

    await ctx.reply(
      `📊 Ваша статистика за всё время:\n\n` +
      `👣 Шагов: ${totalSteps}\n` +
      `📏 Расстояние: ${totalDistance.toFixed(2)} км\n` +
      `🔥 Калорий: ${totalCalories}`,
      Markup.keyboard([['⬅️ Главное меню']]).resize().oneTime()
    );
  } catch (error) {
    console.error('Ошибка получения статистики:', error.message);
    await ctx.reply('Не удалось получить статистику. Попробуйте позже.');
  }
});

// Показать мою активность
bot.hears('📋 Моя активность', async (ctx) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/activity/${ctx.from.id}`);
    const activities = res.data;

    if (!activities.length) {
      return ctx.reply('У вас пока нет сохранённой активности.');
    }

    let message = '📋 Ваша активность:\n\n';
    activities.forEach((a, i) => {
      message += `#${i + 1}\nШаги: ${a.steps}\nДистанция: ${a.distanceKm} км\nКалории: ${a.calories}\nДата: ${new Date(a.date).toLocaleString()}\n\n`;
    });

    await ctx.reply(message, Markup.keyboard([['⬅️ Главное меню']]).resize().oneTime());
  } catch (error) {
    console.error('Ошибка при получении активности:', error.message);
    await ctx.reply('Не удалось загрузить активность. Попробуйте позже.');
  }
});

// Добавить активность
bot.hears('🏃 Добавить активность', (ctx) => {
  ctx.reply(
    'Пожалуйста, введи активность в формате:\n/activity <шаги> <дистанция км> <калории>\nНапример: /activity 5000 3.2 200',
    Markup.keyboard([['⬅️ Главное меню']]).resize().oneTime()
  );
});

bot.command('activity', async (ctx) => {
  const text = ctx.message.text;
  const parts = text.split(' ');

  if (parts.length !== 4) {
    return ctx.reply(
      'Пожалуйста, используй формат: /activity <steps> <distanceKm> <calories>\nНапример: /activity 5000 3.2 200'
    );
  }

  const [, stepsStr, distanceStr, caloriesStr] = parts;
  const steps = Number(stepsStr);
  const distanceKm = Number(distanceStr);
  const calories = Number(caloriesStr);

  if (isNaN(steps) || isNaN(distanceKm) || isNaN(calories)) {
    return ctx.reply('Ошибка: шаги, дистанция и калории должны быть числами.');
  }

  try {
    await axios.post(`${API_BASE_URL}/api/activity`, {
      telegramId: String(ctx.from.id),
      steps,
      distanceKm,
      calories
    });
    await ctx.reply(
      'Активность успешно сохранена!',
      Markup.keyboard([['⬅️ Главное меню']]).resize().oneTime()
    );
  } catch (error) {
    console.error('Ошибка при сохранении активности:', error.message);
    await ctx.reply('Не удалось сохранить активность.');
  }
});

// Добавить сон
bot.hears('😴 Добавить сон', (ctx) => {
  ctx.reply(
    'Пожалуйста, введи сон в формате:\n/sleep <часы> <качество>\nНапример: /sleep 7.5 хороший',
    Markup.keyboard([['⬅️ Главное меню']]).resize().oneTime()
  );
});

bot.command('sleep', async (ctx) => {
  const text = ctx.message.text;
  const parts = text.split(' ');

  if (parts.length < 3) {
    return ctx.reply('Пожалуйста, используй формат:\n/sleep <часы> <качество>\nНапример: /sleep 7.5 хороший');
  }

  const hours = parseFloat(parts[1]);
  const quality = parts.slice(2).join(' ');

  if (isNaN(hours)) {
    return ctx.reply('Ошибка: часы сна должны быть числом. Например: 7.5');
  }

  try {
    await axios.post(`${API_BASE_URL}/api/sleep`, {
      telegramId: String(ctx.from.id),
      hours,
      quality
    });
    await ctx.reply(
      'Данные о сне успешно сохранены!',
      Markup.keyboard([['⬅️ Главное меню']]).resize().oneTime()
    );
  } catch (error) {
    console.error('Ошибка при сохранении сна:', error.message);
    await ctx.reply('Не удалось сохранить данные о сне. Попробуй позже.');
  }
});

// Возврат в главное меню
bot.hears('⬅️ Главное меню', (ctx) => {
  showMainMenu(ctx);
});

bot.launch();
console.log('Telegram бот запущен');
