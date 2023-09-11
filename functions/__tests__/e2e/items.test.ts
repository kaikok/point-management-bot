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

describe("How do we manage items?", () => {
  describe("How to list items?", () => {
    test("It will list score items when we select score and then display keyboard to choose between add and update", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items score",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items score Add"],
            ["/items score Update"],
            ["/items score Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nrun an errand : 1\ndo a good deed : 2\n"});
    });
  
    test("It will list demerit items when we select demerit and then display keyboard to choose between add and update", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items demerit",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items demerit Add"],
            ["/items demerit Update"],
            ["/items demerit Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nnot so good behavior : -1\nbad behavior : -2\n"});
    });
  
    test("It will list redemption items when we select redemption and then display keyboard to choose between add and update", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items redemption",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items redemption Add"],
            ["/items redemption Update"],
            ["/items redemption Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nBig prize : -2\nSmall prize : -1\nSmall trip : -3\n"});
    });
  });
  
  describe("How to add items?", () => {
    test("Select add for score item", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items score",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items score Add"],
            ["/items score Update"],
            ["/items score Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nrun an errand : 1\ndo a good deed : 2\n"});
  
      await userSendsCommand({
        text: "/items score Add",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "What is the description for the new item?"});
  
      await userSendsMessage({
        text: "Shiny new thing",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Ok description is \"Shiny new thing\", please provide the value."});
  
      await userSendsMessage({
        text: "10",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Added new score, \"Shiny new thing\" of value \"10\""});
  
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items score",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items score Add"],
            ["/items score Update"],
            ["/items score Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nrun an errand : 1\ndo a good deed : 2\nShiny new thing : 10\n"});
    });
  
    test("Select add for demerit item", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items demerit",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items demerit Add"],
            ["/items demerit Update"],
            ["/items demerit Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: /^Item : Value\nnot so good behavior : -1\nbad behavior : -2\n$/});
  
      await userSendsCommand({
        text: "/items demerit Add",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "What is the description for the new item?"});
  
      await userSendsMessage({
        text: "Undesirable action",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Ok description is \"Undesirable action\", please provide the value."});
  
      await userSendsMessage({
        text: "-10",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Added new demerit, \"Undesirable action\" of value \"-10\""});
  
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items demerit",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items demerit Add"],
            ["/items demerit Update"],
            ["/items demerit Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: /^Item : Value\nnot so good behavior : -1\nbad behavior : -2\nUndesirable action : -10\n$/});
    });
  
    test("Select add for redemption item", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items redemption",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items redemption Add"],
            ["/items redemption Update"],
            ["/items redemption Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nBig prize : -2\nSmall prize : -1\nSmall trip : -3\n"});
  
      await userSendsCommand({
        text: "/items redemption Add",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "What is the description for the new item?"});
  
      await userSendsMessage({
        text: "Value for money",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Ok description is \"Value for money\", please provide the value."});
  
      await userSendsMessage({
        text: "-5",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Added new redemption, \"Value for money\" of value \"-5\""});
  
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items redemption",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items redemption Add"],
            ["/items redemption Update"],
            ["/items redemption Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nBig prize : -2\nSmall prize : -1\nSmall trip : -3\nValue for money : -5\n"});
    });
  });
  
  describe("How to update items?", () => {
    test("Select update for score item", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items score",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items score Add"],
            ["/items score Update"],
            ["/items score Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nrun an errand : 1\ndo a good deed : 2\nShiny new thing : 10\n"});
  
      await userSendsCommand({
        text: "/items score Update",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
              ["/items score Update 0 run an errand"],
              ["/items score Update 1 do a good deed"],
              ["/items score Update 2 Shiny new thing"],
            ],
          "one_time_keyboard": true,
          "resize_keyboard": true,
        },
        text: "Which item to update?"});
  
      await userSendsCommand({
        text: "/items score Update 0 run an errand",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "What is the new value?"});
  
      await userSendsMessage({
        text: "2",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Updated score item,\"run an errand\" with value \"2\""});
  
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items score",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items score Add"],
            ["/items score Update"],
            ["/items score Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nrun an errand : 2\ndo a good deed : 2\nShiny new thing : 10\n"});
    });
  
    test("Select update for demerit item", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items demerit",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items demerit Add"],
            ["/items demerit Update"],
            ["/items demerit Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nnot so good behavior : -1\nbad behavior : -2\nUndesirable action : -10\n"});
  
      await userSendsCommand({
        text: "/items demerit Update",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
              ["/items demerit Update 0 not so good behavior"],
              ["/items demerit Update 1 bad behavior"],
              ["/items demerit Update 2 Undesirable action"],
            ],
          "one_time_keyboard": true,
          "resize_keyboard": true,
        },
        text: "Which item to update?"});
  
      await userSendsCommand({
        text: "/items demerit Update 0 not so good behavior",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "What is the new value?"});
  
      await userSendsMessage({
        text: "-2",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Updated demerit item,\"not so good behavior\" with value \"-2\""});
  
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items demerit",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items demerit Add"],
            ["/items demerit Update"],
            ["/items demerit Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nnot so good behavior : -2\nbad behavior : -2\nUndesirable action : -10\n"});
    });
  
    test("Select update for redemption item", async () => {
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items redemption",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items redemption Add"],
            ["/items redemption Update"],
            ["/items redemption Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nBig prize : -2\nSmall prize : -1\nSmall trip : -3\nValue for money : -5\n"});
  
      await userSendsCommand({
        text: "/items redemption Update",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
              ["/items redemption Update 0 Big prize"],
              ["/items redemption Update 1 Small prize"],
              ["/items redemption Update 2 Small trip"],
              ["/items redemption Update 3 Value for money"],
            ],
          "one_time_keyboard": true,
          "resize_keyboard": true,
        },
        text: "Which item to update?"});
  
      await userSendsCommand({
        text: "/items redemption Update 0 Big prize",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "What is the new value?"});
  
      await userSendsMessage({
        text: "-20",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "remove_keyboard": true,
          "selective": true,
        },
        text: "Updated redemption item,\"Big prize\" with value \"-20\""});
  
      await userSendsCommand({
        text: "/items",
        user: user, 
        app: app});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: user.id,
        reply_markup: {
          "keyboard": [
            ["/items score"],
            ["/items demerit"],
            ["/items redemption"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Which item to query?"});
  
      await userSendsCommand({
        text: "/items redemption",
        app: app, 
        user: user});
      expectBotMessage(interceptedMessage).toBe({
        messageType: "sendMessage",
        chat_id: 88888888,
        reply_markup: {
          "keyboard": [
            ["/items redemption Add"],
            ["/items redemption Update"],
            ["/items redemption Cancel"],
          ],
          "one_time_keyboard": true,
          "resize_keyboard": true, 
        },
        text: "Item : Value\nBig prize : -20\nSmall prize : -1\nSmall trip : -3\nValue for money : -5\n"});
    });
  });
});

