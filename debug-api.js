

async function checkData() {
  console.log('Делаем хитрый запрос к API...');
  try {
    const response = await fetch('https://elitegas.ru/wp-json/gazmap/v1/stations', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://elitegas.ru/gazovye-zapravki-agns-na-karte/',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Успешно скачано станций: ${data.length}`);

    // Ищем станцию на Варшавской
    const targetStation = data.find(s => JSON.stringify(s).toLowerCase().includes('варшавская'));

    if (targetStation) {
      console.log('\n--- НАЙДЕНА СТАНЦИЯ ---');
      console.log(JSON.stringify(targetStation, null, 2));
      console.log('-----------------------\n');
    } else {
      console.log('Станция "Варшавская" не найдена в сырых данных.');
    }

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

checkData();
