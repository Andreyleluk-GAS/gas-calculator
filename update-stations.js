import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://elitegas.ru/wp-json/gazmap/v1/stations';
const OUTPUT_FILE = path.join(__dirname, 'src', 'stations.json');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://elitegas.ru/',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Обновленная функция с логированием
function extractPhone(html, title) {
  const $ = cheerio.load(html);
  
  // Убрали слишком агрессивную очистку, оставили только очевидный мусор
  $('aside, .sidebar, .widget, header, footer').remove();

  let mainContent = $('.entry-content, main, #main, #primary, article').text();
  if (!mainContent.trim()) {
    mainContent = $('body').text(); 
  }
  
  const text = mainContent.replace(/\s+/g, ' ');

  const regex = /(?:\+7|8)[\s\-]*\(?\d{3,4}\)?[\s\-]*\d{2,3}[\s\-]*\d{2}[\s\-]*\d{2}|\(\d{3,4}\)\s*\d{2,3}[\s\-]*\d{2}[\s\-]*\d{2}/g;
  const matches = text.match(regex);
  
  const isDebugTarget = title.toLowerCase().includes('екатеринбург') || title.toLowerCase().includes('варшавск');

  if (isDebugTarget) {
    console.log(`\n--- [DEBUG] СТАНЦИЯ: ${title} ---`);
    console.log(`[DEBUG] Найдены номера (сырые):`, matches);
  }

  if (!matches) {
    if (isDebugTarget) console.log(`[DEBUG] ИТОГ: Нет совпадений по регулярке.`);
    return null;
  }

  const blacklist = ['+73432532888', '+73433289888'];

  for (const match of matches) {
    const digits = match.replace(/\D/g, '');
    let formattedPhone = null;
    
    if (digits.length === 10) {
      formattedPhone = '+7' + digits;
    } else if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
      formattedPhone = '+7' + digits.slice(1);
    }

    if (isDebugTarget) console.log(`[DEBUG] Обработка номера: ${match} -> ${formattedPhone}`);

    if (formattedPhone) {
      if (blacklist.includes(formattedPhone)) {
        if (isDebugTarget) console.log(`[DEBUG] Отброшен (Черный список): ${formattedPhone}`);
      } else {
        if (isDebugTarget) console.log(`[DEBUG] ИТОГ: Взят номер ${formattedPhone}\n`);
        return formattedPhone;
      }
    }
  }
  
  if (isDebugTarget) console.log(`[DEBUG] ИТОГ: Все найденные номера оказались в черном списке.\n`);
  return null;
}

async function updateStations() {
  console.log('1. Скачивание базы...');
  try {
    const response = await fetch(API_URL, { headers: HEADERS });
    if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
    
    const rawData = await response.json();
    console.log(`✅ Получено станций: ${rawData.length}.`);
    console.log('2. Запуск парсинга с логами (вывод дебага для Екб)...\n');

    const parsedStations = [];

    for (let i = 0; i < rawData.length; i++) {
      const s = rawData[i];
      if (!s) continue;

      const typeStr = String(s.type || s.fuel_type || s.category || '').toLowerCase();
      const titleStr = String(s.title || s.name || '').toLowerCase();
      
      let stationType = 'lpg';
      if (typeStr.includes('lng') || titleStr.includes('спг') || titleStr.includes('крио')) stationType = 'lng';
      else if (typeStr.includes('cng') || titleStr.includes('кпг') || titleStr.includes('метан') || titleStr.includes('агнкс')) stationType = 'cng';

      const lat = parseFloat(s.lat || s.latitude || (s.coords && s.coords[0]));
      const lon = parseFloat(s.lng || s.lon || s.longitude || (s.coords && s.coords[1]));

      if (isNaN(lat) || isNaN(lon)) continue;

      let cleanPhone = null;

      if (s.url) {
        try {
          process.stdout.write(`[${i + 1}/${rawData.length}] ${s.title.substring(0, 30)}... `);
          const pageRes = await fetch(s.url, { headers: HEADERS });
          if (pageRes.ok) {
            const html = await pageRes.text();
            cleanPhone = extractPhone(html, s.title);
            console.log(cleanPhone ? `📞 ${cleanPhone}` : '❌ Нет тел.');
          } else {
            console.log(`⚠️ Ошибка HTTP: ${pageRes.status}`);
          }
        } catch (e) {
          console.log(`⚠️ Ошибка сети`);
        }
        await delay(250);
      }

      parsedStations.push({ id: s.id || i, title: s.title || 'Заправка', address: s.address || '', lat, lon, type: stationType, cleanPhone });
    }

    parsedStations.push({
      id: 'elitegas-main-service',
      title: 'УЦ "ЭлитГаз" (Партнер)',
      address: 'г. Екатеринбург, ул. Шефская, 3АВ',
      lat: 56.872757,
      lon: 60.659422,
      type: 'service',
      cleanPhone: '+73432532888'
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(parsedStations, null, 2), 'utf-8');
    console.log(`\n🎉 ГОТОВО! Сохранено ${parsedStations.length} объектов.`);
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
  }
}

updateStations();
