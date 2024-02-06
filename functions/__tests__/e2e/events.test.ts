import {interceptedMessage} from "./interceptorMock"
import {expectBotMessage, userSendsCommand, setupEmulatorTestDatabase, userSendsMessage} from "./testHelper"

import app from "../../src/app";

beforeAll(async () => {
  await setupEmulatorTestDatabase();
});

beforeEach(async () => {
  interceptedMessage.mockClear();
});

const user = {
  id: 88888888,
  first_name: "Adam",
  last_name: "Smith",
  username: "asmith"
}

describe("How do we query events?", () => {
  test("How to query events that happended today?", async () => {
    await userSendsCommand({
      text: "/events",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "keyboard": [
          ["today"],
          ["yesterday"],
          ["ddmmyyyy"],
        ],
        "one_time_keyboard": true,
        "resize_keyboard": true, 
      },
      text: "Events from which day?"});
    await userSendsMessage({
      text: "today",
      user: user, 
      app: app});  
    console.log(interceptedMessage.mock.calls);
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "remove_keyboard": true,
        "selective": true, 
      },
      text: "Back to initial state"});  
  });
});