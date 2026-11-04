const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");
const {
  BASE_URL,
  selectSeance,
  bookSeats,
  getText,
  isButtonDisabled,
} = require("../../lib/commands");

Given("пользователь открыл сеанс на последний день недели", async function () {
  await this.page.goto(BASE_URL);
  await selectSeance(this.page, 7, 0);
});

When(
  /^он выбирает (\d+) свободн(?:ое|ых) мест(?:о|а) и бронирует (?:его|их)$/,
  async function (count) {
    await bookSeats(this.page, Number(count));
  },
);

When("он не выбирает ни одного места", async function () {
  // Ничего не делаем: проверяем состояние зала сразу после открытия
});

Then("он видит страницу электронного билета", async function () {
  const title = await getText(this.page, ".ticket__check-title");
  expect(title).to.contain("Электронный билет");
});

Then("кнопка бронирования неактивна", async function () {
  expect(await isButtonDisabled(this.page)).to.equal(true);
});
