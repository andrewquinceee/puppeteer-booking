const BASE_URL = "https://qamid.tmweb.ru/client/index.php";

module.exports = {
  BASE_URL,

  // Кликнуть по элементу: сначала дождаться, потом кликнуть
  clickElement: async (page, selector) => {
    try {
      await page.waitForSelector(selector, { visible: true });
      await page.click(selector);
    } catch (error) {
      throw new Error(`Селектор недоступен для клика: ${selector}`);
    }
  },

  // Получить текст элемента
  getText: async (page, selector) => {
    try {
      await page.waitForSelector(selector, { visible: true });
      return await page.$eval(selector, (el) => el.textContent.trim());
    } catch (error) {
      throw new Error(`Текст не получен, селектор: ${selector}`);
    }
  },

  // Выбрать день (по номеру таба) и сеанс (по номеру в списке)
  selectSeance: async (page, dayIndex = 1, seanceIndex = 0) => {
    await module.exports.clickElement(
      page,
      `.page-nav__day:nth-child(${dayIndex})`,
    );
    await page.waitForSelector(".movie-seances__time");
    const seances = await page.$$(".movie-seances__time");
    if (!seances[seanceIndex]) {
      throw new Error(`Нет сеанса с номером ${seanceIndex}`);
    }
    await seances[seanceIndex].click();
    await page.waitForSelector(".buying-scheme__wrapper");
  },

  // Выбрать N свободных обычных мест
  selectFreeSeats: async (page, count = 1) => {
    const free =
      ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken)";
    await page.waitForSelector(free);
    const seats = await page.$$(free);
    if (seats.length < count) {
      throw new Error(`Свободных мест меньше, чем нужно: ${count}`);
    }
    for (let i = 0; i < count; i++) {
      await seats[i].click();
    }
  },

  // Кнопка «Забронировать» отключена?
  isButtonDisabled: async (page, selector = ".acceptin-button") => {
    await page.waitForSelector(selector);
    return page.$eval(selector, (el) => el.disabled);
  },

  // Весь путь: выбрать места -> забронировать -> получить код
  bookSeats: async (page, count = 1) => {
    await module.exports.selectFreeSeats(page, count);
    await module.exports.clickElement(page, ".acceptin-button");
    await page.waitForSelector(".ticket__check-title");
    await module.exports.clickElement(page, ".acceptin-button");
    await page.waitForSelector(".ticket__info-qr");
  },
};
