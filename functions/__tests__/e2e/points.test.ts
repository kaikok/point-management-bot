import {interceptedMessage} from "./interceptorMock"
import {expectBotMessage, userSendsCommand, setupEmulatorTestDatabase} from "./testHelper"

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

describe("How to manage points for a participant?", () => {
  test("It will list points of all participants when we send the points command.", async () => {
    await userSendsCommand({
      text: "/points",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "remove_keyboard": true,
        "selective": true,
      },
      text: "Participant : Score\nplayerA : 0\nplayerB : 0\n"});
  });

  test("Choose from a list of participants when we send the score command.", async () => {
    await userSendsCommand({
      text: "/score",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "keyboard": [
          ["/score playerA"],
          ["/score playerB"],
        ],
        "one_time_keyboard": true,
        "resize_keyboard": true,
      },
      text: "Who do you want to score?"});

    await userSendsCommand({
      text: "/score playerA",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "keyboard": [
          ["/score playerA 0 run an errand"],
          ["/score playerA 1 do a good deed"],
        ],
        "one_time_keyboard": true,
        "resize_keyboard": true,
      },
      text: "What item?"});
    
    await userSendsCommand({
      text: "/score playerA 0 run an errand",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "remove_keyboard": true,
        "selective": true,
      },
      text: "Done! run an errand"});
  });

  test("Choose from a list of participants when we send the demerit command.", async () => {
    await userSendsCommand({
      text: "/demerit",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "keyboard": [
          ["/demerit playerA"],
          ["/demerit playerB"],
        ],
        "one_time_keyboard": true,
        "resize_keyboard": true,
      },
      text: "Who do you want to demerit?"});

    await userSendsCommand({
      text: "/demerit playerA",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "keyboard": [
          ["/demerit playerA 0 not so good behavior"],
          ["/demerit playerA 1 bad behavior"],
        ],
        "one_time_keyboard": true,
        "resize_keyboard": true,
      },
      text: "What item?"});
    
    await userSendsCommand({
      text: "/demerit playerA 0 not so good behavior",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "remove_keyboard": true,
        "selective": true,
      },
      text: "Done! not so good behavior"});
  });

  test("Choose from a list of participants when we send the redeem command.", async () => {
    await userSendsCommand({
      text: "/redeem",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "keyboard": [
          ["/redeem playerA"],
          ["/redeem playerB"],
        ],
        "one_time_keyboard": true,
        "resize_keyboard": true,
      },
      text: "Who do you want to redeem?"});

    await userSendsCommand({
      text: "/redeem playerA",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "keyboard": [
          ["/redeem playerA 0 Big prize"],
          ["/redeem playerA 1 Small prize"],
          ["/redeem playerA 2 Small trip"],
        ],
        "one_time_keyboard": true,
        "resize_keyboard": true,
      },
      text: "What item?"});
    
    await userSendsCommand({
      text: "/redeem playerA 0 Big prize",
      user: user, 
      app: app});
    expectBotMessage(interceptedMessage).toBe({
      messageType: "sendMessage",
      chat_id: user.id,
      reply_markup: {
        "remove_keyboard": true,
        "selective": true,
      },
      text: "Done! Big prize"});
  });
});