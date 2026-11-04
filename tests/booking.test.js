const puppeteer = require("puppeteer");
const {
  BASE_URL,
  selectSeance,
  bookSeats,
  getText,
  isButtonDisabled,
} = require("../lib/commands");

const LAST_DAY = 7; // номер таба последнего дня
const TICKET_TITLE = "Электронный билет";

describe("Бронирование билетов", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: "new" });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(BASE_URL);
  });

  afterEach(async () => {
    await page.close();
  });

  test("Happy path 1: бронирование одного места", async () => {
    // Given: открыт зал выбранного сеанса
    await selectSeance(page, LAST_DAY, 0);
    // When: бронируем одно место
    await bookSeats(page, 1);
    // Then: видим страницу электронного билета
    const title = await getText(page, ".ticket__check-title");
    expect(title).toContain(TICKET_TITLE);
  });

  test("Happy path 2: бронирование двух мест", async () => {
    // Given
    await selectSeance(page, LAST_DAY, 1);
    // When
    await bookSeats(page, 2);
    // Then
    const title = await getText(page, ".ticket__check-title");
    expect(title).toContain(TICKET_TITLE);
  });

  test("Sad path: без выбора места кнопка бронирования неактивна", async () => {
    // Given
    await selectSeance(page, LAST_DAY, 0);
    // When: ничего не выбираем
    // Then: кнопка отключена
    expect(await isButtonDisabled(page)).toBe(true);
  });
});
