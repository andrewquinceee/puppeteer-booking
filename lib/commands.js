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

  // Выбрать день: номером таба (1..7) или днём недели ("Пн", "Вт", "Ср"...)
  selectDay: async (page, day) => {
    await page.waitForSelector(".page-nav__day");
    const days = await page.$$(".page-nav__day");
    const weekdays = await page.$$eval(".page-nav__day", (els) =>
      els.map((el) =>
        el.querySelector(".page-nav__day-week").textContent.trim(),
      ),
    );

    const index = typeof day === "number" ? day - 1 : weekdays.indexOf(day);
    if (index < 0 || !days[index]) {
      throw new Error(
        `День не найден: ${day}. Доступны: ${weekdays.join(", ")}`,
      );
    }
    await days[index].click();
  },

  // Выбрать день (номером или днём недели) и сеанс по номеру в списке
  selectSeance: async (page, day = 1, seanceIndex = 0) => {
    await module.exports.selectDay(page, day);
    await page.waitForSelector(".movie-seances__time");
    const seances = await page.$$(".movie-seances__time");
    if (!seances[seanceIndex]) {
      throw new Error(`Нет сеанса с номером ${seanceIndex}`);
    }
    await seances[seanceIndex].click();
    await page.waitForSelector(".buying-scheme__wrapper");
    // Ждём, пока схема зала догрузится с сервера и перестанет перерисовываться
    try {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 });
    } catch (error) {
      // сеть не затихла за 15 секунд: продолжаем, дальше сработают свои ожидания
    }
  },

  // Выбрать N свободных обычных мест (если выбор пропал, пробуем снова)
  selectFreeSeats: async (page, count = 1) => {
    const free =
      ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken)";
    const activeButton = ".acceptin-button:not([disabled])";

    for (let attempt = 1; attempt <= 3; attempt++) {
      await page.waitForSelector(free);
      const seats = await page.$$(free);
      if (seats.length < count) {
        throw new Error(`Свободных мест меньше, чем нужно: ${count}`);
      }
      for (let i = 0; i < count; i++) {
        await seats[i].click();
      }
      try {
        await page.waitForSelector(activeButton, { timeout: 3000 });
        return;
      } catch (error) {
        // выбор пропал (схема перерисовалась), выбираем места заново
      }
    }
    throw new Error("Не удалось выбрать места: кнопка осталась неактивной");
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
