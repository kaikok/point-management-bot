import {configDotenv} from "dotenv";
configDotenv({path: ".env.local"});

import request from "supertest";

import * as admin from "firebase-admin";
if (admin.apps.length === 0) {
  admin.initializeApp({projectId: process.env.PROJECT_ID});
}

import {dbSeed} from "../../src/data-seed";
import {dbReset} from "../../src/data-reset";

export const setupEmulatorTestDatabase = async () => {
  expect(process.env.FIRESTORE_EMULATOR_HOST).toBeDefined();
  const firestore = admin.firestore();
  await dbReset(firestore);
  await dbSeed(firestore);
}

export const expectBotMessage = (interceptedMessage: jest.Mock<any, any, any>) => {
  const lastCall = interceptedMessage.mock.lastCall;
  return {
    toBe: ({messageType, chat_id, reply_markup, text}:
      {messageType: any, chat_id: any, reply_markup: any, text: any}) => {
      expect(lastCall[0]).toBe(messageType);
      expect(lastCall[1].chat_id).toBe(chat_id);
      expect(lastCall[1].reply_markup).toStrictEqual(reply_markup);
      if (text instanceof RegExp) {
        expect(lastCall[1].text).toMatch(text);
      } else {
        expect(lastCall[1].text).toEqual(text);
      }
      return;
    }
  };
}

export const userSendsMessage = async ({app, user, text}: {app: any, user: any, text: any}) => {
  const payload = {
    "update_id": 123,
    "message": {
      "message_id": 123,
      "from":{
        "id": user.id,
        "is_bot": false,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "language_code": "en"
      },
      "chat":{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "type": "private"
      },
      "date": 1705803918,
      "text": text
    }
  };
  const res = await request(app).post(
    "/telegram").send(payload).
      set({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Telegram-Bot-Api-Secret-Token':
          process.env.API_TOKEN ? process.env.API_TOKEN : ""});
  expect(res.statusCode).toEqual(200);
}

export const userSendsCommand = async ({app, user, text}: {app: any, user: any, text: any}) => {
  const command = text.split(" ", 1)[0];
  const payload = {
    "update_id": 123,
    "message": {
      "message_id": 123,
      "from":{
        "id": user.id,
        "is_bot": false,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "language_code": "en"
      },
      "chat":{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "type": "private"
      },
      "date": 1705803918,
      "text": text,
      "entities": [{
        "offset": 0,
        "length": command.length,
        "type": "bot_command"}]
    }
  };
  const res = await request(app).post(
    "/telegram").send(payload).
      set({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Telegram-Bot-Api-Secret-Token':
          process.env.API_TOKEN ? process.env.API_TOKEN : ""});
  expect(res.statusCode).toEqual(200);
}

module.exports = {
  setupEmulatorTestDatabase: setupEmulatorTestDatabase,
  expectBotMessage: expectBotMessage,
  userSendsMessage: userSendsMessage,
  userSendsCommand: userSendsCommand
}