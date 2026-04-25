const { test, expect, chromium } = require('@playwright/test');

test('Wildberries search transportir', async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--disable-blink-features=AutomationControlled'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 735, height: 800 },
    // Проверка теста при плохом соединении
    // offline: false,
    // networkConditions: {
    //   download: 500 * 1024 / 8, // 500 Kbps
    //   upload: 500 * 1024 / 8,   // 500 Kbps
    //   latency: 150              // задержка 150 мс
    // }
  });

  const page = await context.newPage();


  await test.step("Открытие страницы", async () => {
    await page.goto('https://www.wildberries.ru/', {
      waitUntil: 'domcontentloaded'
    });

    // Если сайт грузится медленно или идет проверка браузера или открылся попап
    await Promise.any([
      page.waitForSelector('.popup__close'),
      page.waitForSelector('.j-online-chat'),
      page.waitForTimeout(10000)
    ]);

    await page.locator('.popup__close, .j-close, button[aria-label*="закрыть"]')
    .first()
    .click()
    .catch(() => {});
  });


  await test.step("Поиск товаров по запросу 'транспортир'", async () => {
    await page.locator('#searchInput').fill('транспортир');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.sorter-mobile__btn');
  });
  
  await test.step("Сортировка по возрастанию цены", async () => {
    await page.locator('.sorter-mobile__btn').click();
    await page.waitForSelector('.popup-sorting__item');
    await page.locator('.popup-sorting__item[data-sorting-value="priceup"] .radio-with-text').click();
  });

  
  await test.step("Ожидание ответа", async () => {
    await Promise.all([
      page.waitForURL(/sort=priceup/),
      page.waitForResponse(resp =>
        resp.status() === 200 &&
        resp.url().includes('search')
      ),
      page.locator('.popup-sorting__btn').click()
    ]);
    await page.waitForTimeout(1000);
  });

  
  await test.step("Получение результата", async () => {
    // Получаем первые 10 товаров
    const cards = page.locator('.product-card');
    const count = await cards.count();
    console.log('Первые товары:\n');
    for (let i = 0; i < Math.min(10, count); i++) {
      const card = cards.nth(i);
      const title = await card.locator('.product-card__name').innerText().catch(() => 'Без названия');
      const price = await card.locator('.price__lower-price').innerText().catch(() => 'Нет цены');
      console.log(`${i + 1}. ${title} — ${price}`);
    }
    // Скрин для проверки
    await page.screenshot({ path: './wb-result.png', fullPage: true});
  });

  await context.close();
});