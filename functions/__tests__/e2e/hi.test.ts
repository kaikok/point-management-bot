import {interceptedMessage} from "./interceptorMock"
import {expectBotMessage, userSendsMessage, setupEmulatorTestDatabase} from "./testHelper"

import app from "../../src/app";

beforeAll(async () => {
  await setupEmulatorTestDatabase();
}, 5000);

describe("Say hi to bot", () => {
  test("It should reply with time", async () => {
    interceptedMessage.mockClear();
    const user = {
      id: 88888888,
      first_name: "Adam",
      last_name: "Smith",
      username: "asmith"
    };

    await userSendsMessage({
      text: "hi",
      user: user, 
      app: app});

    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {remove_keyboard: true, selective: true},
      text: /^(Hey there, it is ).*( now\.)$/});
  });
});

