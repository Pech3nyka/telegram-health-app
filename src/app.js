const statsDiv = document.getElementById('stats');
const btn = document.getElementById('loadStatsBtn');

btn.addEventListener('click', () => {
  fetch('https://telegram-health-app.onrender.com')
    .then(res => res.json())
    .then(data => {
      statsDiv.innerHTML = `
        <p>Шаги: ${data.steps}</p>
        <p>Калории: ${data.calories}</p>
        <p>Сон (часы): ${data.sleep}</p>
        <p>Вода (л): ${data.water}</p>
      `;
    })
    .catch(() => {
      statsDiv.textContent = 'Ошибка загрузки данных.';
    });
});
