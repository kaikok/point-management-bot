import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import * as bodyParser from "body-parser";
import morganBody from "morgan-body";
import "dotenv/config";

import {Telegraf, Context} from "telegraf";
import {KeyboardButton, Message, ReplyKeyboardRemove, Update}
  from "telegraf/typings/core/types/typegram";
import {addDoc, getData, updateDoc} from "./data-access";
import {dbReset} from "./data-reset";
import {dbSeed} from "./data-seed";
import {middlewareInterceptor, outgoingInterceptor}
  from "./interceptor";


if (admin.apps.length === 0) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const app = express();
app.use(bodyParser.json());
app.use("/telegram", bodyParser.json());
morganBody(
  app,
  {
    maxBodyLength: 30000,
    noColors: true,
    prettify: false,
    includeNewLine: false,
    logRequestBody: true,
    logResponseBody: true,
  });

let telegramStatus = "Bot is not loaded";

const removeKeyboard : ReplyKeyboardRemove= {
  "remove_keyboard": true,
  "selective": true,
};

const cmdDocNameLookup : {[key: string]: string} = {
  "score": "score",
  "demerit": "demerit",
  "redeem": "redemption",
};

const getUser = async (
  firestore: admin.firestore.Firestore,
  userId: number): Promise<admin.firestore.DocumentData> => {
  const user = await getData(
    firestore,
    `users/${userId}`,
    {valid: false, role: "none"});
  return user;
};

const isAdmin = (
  user: admin.firestore.DocumentData): boolean => {
  if (user.role === "admin") return true;
  return false;
};

const handlePointsUpdate = async (
  ctx: Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;}>,
  commandName: string,
  participants: Array<string>): Promise<void> => {
  const user = await getUser(firestore, ctx.from.id);
  if (!user.valid) return;
  if (!isAdmin(user)) return;

  const tokens = ctx.message.text.split(" ");

  if (tokens.length < 2) {
    const builtinKeyboard = {
      "resize_keyboard": true,
      "one_time_keyboard": true,
      "keyboard": new Array<Array<KeyboardButton>>(),
    };
    const numOfParticipants = participants.length;
    for (let idx = 0; idx < numOfParticipants; idx++) {
      builtinKeyboard["keyboard"].
        push([`/${commandName} ${participants[idx]}`]);
    }

    functions.logger.info(ctx, {structuredData: true});
    await ctx.reply(`Who do you want to ${commandName}?`,
      {reply_markup: builtinKeyboard});
  } else if (tokens.length === 2 ) {
    const name = tokens[1];
    const aggregate =
      await getData(firestore,
        `items/${cmdDocNameLookup[commandName]}`,
        {descriptions: [], values: []});

    const builtinKeyboard = {
      "resize_keyboard": true,
      "one_time_keyboard": true,
      "keyboard": new Array<Array<KeyboardButton>>(),
    };
    const length = aggregate.descriptions.length;
    for (let idx = 0; idx < length; idx++) {
      builtinKeyboard.keyboard.push(
        [`/${commandName} ${name} ${idx} ${aggregate.descriptions[idx]}`]);
    }

    await ctx.reply("What item?", {reply_markup: builtinKeyboard});
  } else {
    const name = tokens[1];
    const itemIdx = tokens[2];
    const idx = ctx.message.text.search(name);
    const itemName = ctx.message.text.substring(
      idx + name.length + itemIdx.length + 2);

    const aggregate =
      await getData(firestore, `items/${cmdDocNameLookup[commandName]}`,
        {descriptions: [], values: []});

    await addDoc(firestore, `participants/${name}/events`, {
      type: `${cmdDocNameLookup[commandName]}`,
      name: itemName,
      item_id: itemIdx,
      timestamp: admin.firestore.Timestamp.now()});
    await updateDoc(firestore, `participants/${name}`, {
      total: admin.firestore.FieldValue.
        increment(aggregate.values[parseInt(itemIdx)])});
    await ctx.reply(`Done! ${itemName}`, {reply_markup: removeKeyboard});
  }
};

const handleItemsUpdate = async (
  ctx: Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;}>,
  itemClasses: Array<string>): Promise<void> => {
  const user = await getUser(firestore, ctx.from.id);
  if (!user.valid) return;
  if (!isAdmin(user)) return;

  const tokens = ctx.message.text.split(" ");

  if (tokens.length < 2) {
    const builtinKeyboard = {
      "resize_keyboard": true,
      "one_time_keyboard": true,
      "keyboard": new Array<Array<KeyboardButton>>(),
    };
    itemClasses.forEach((itemClass) => {
      builtinKeyboard["keyboard"].push([`/items ${itemClass}`]);
    });

    functions.logger.info(ctx, {structuredData: true});
    await ctx.reply("Which item to query?",
      {reply_markup: builtinKeyboard});
  } else if (tokens.length === 2 ) {
    const itemClass = tokens[1];
    const itemList =
      await getData(firestore, `items/${itemClass}`,
        {descriptions: [], values: []});

    const builtinKeyboard = {
      "resize_keyboard": true,
      "one_time_keyboard": true,
      "keyboard": [
        [`/items ${itemClass} Add`],
        [`/items ${itemClass} Update`],
        [`/items ${itemClass} Cancel`],
      ],
    };

    let reply = "Item : Value\n";
    const length = itemList.descriptions.length;
    for (let idx = 0; idx < length; idx++) {
      reply = reply.concat(
        `${itemList.descriptions[idx]} : ${itemList.values[idx]}\n`);
    }

    await ctx.reply(reply, {reply_markup: builtinKeyboard});
  } else if (tokens.length === 3 ) {
    const itemClass = tokens[1];
    const action = tokens[2];
    if (action === "Add") {
      await updateDoc(
        firestore, `users/${ctx.from.id}`,
        {
          state: "add item",
          context: `{"itemClass":"${itemClass}",`+
          "\"currentField\":\"description\"}"});
      await ctx.reply(
        "What is the description for the new item?",
        {reply_markup: removeKeyboard});
    } else if (action === "Update") {
      const itemList =
        await getData(firestore, `items/${itemClass}`,
          {descriptions: [], values: []});

      const builtinKeyboard = {
        "resize_keyboard": true,
        "one_time_keyboard": true,
        "keyboard": new Array<Array<KeyboardButton>>(),
      };

      const length = itemList.descriptions.length;
      for (let idx = 0; idx < length; idx++) {
        builtinKeyboard.keyboard.push(
          [`/items ${itemClass} Update ${idx} ${itemList.descriptions[idx]}`]);
      }

      await ctx.reply("Which item to update?", {reply_markup: builtinKeyboard});
    } else {
      await ctx.reply("cancelled", {reply_markup: removeKeyboard});
    }
  } else {
    const itemClass = tokens[1];
    const action = tokens[2];
    const itemIdx = tokens[3];

    if (action === "Add") {
      await ctx.reply("cancelled", {reply_markup: removeKeyboard});
    } else if (action === "Update") {
      await updateDoc(
        firestore, `users/${ctx.from.id}`,
        {
          state: "update item",
          context: `{"itemClass":"${itemClass}","itemIdx":${itemIdx}}`});
      await ctx.reply("What is the new value?", {reply_markup: removeKeyboard});
    } else {
      await updateDoc(
        firestore, `users/${ctx.from.id}`,
        {state: "idle", context: "{}"});
      await ctx.reply("cancelled", {reply_markup: removeKeyboard});
    }
  }
};

if (!process.env.YOURTOKEN) {
  functions.logger.info("YOURTOKEN is not defined.", {structuredData: true});
  telegramStatus = "YOURTOKEN is not defined.";
} else {
  const bot = new Telegraf(process.env.YOURTOKEN, {
    telegram: {webhookReply: true},
  });

  const oldCallApi = bot.telegram.callApi.bind(bot.telegram);
  const newCallApi = outgoingInterceptor(oldCallApi);
  bot.telegram.callApi = newCallApi.bind(bot.telegram);

  const middleware = middlewareInterceptor();
  bot.use(middleware);

  bot.hears("hi", (ctx) => {
    const message = `Hey there, it is ${(new Date()).toLocaleString()} now.`;
    ctx.reply(message, {reply_markup: removeKeyboard});
    functions.logger.info(message, {structuredData: true});
    functions.logger.info(
      `${ctx.message.from.username}: ${ctx.from.id}: ${ctx.message.chat.id}`,
      {structuredData: true});
  });

  bot.command("items", async (ctx) => {
    await handleItemsUpdate(ctx,
      ["score", "demerit", "redemption"]);
  });

  bot.command("points", async (ctx) => {
    const playerAPoints =
      await getData(firestore, "participants/playerA", {total: 0});
    const playerBPoints =
      await getData(firestore, "participants/playerB", {total: 0});

    let reply = "Participant : Score\n";
    reply = reply.concat(`playerA : ${playerAPoints.total}\n`);
    reply = reply.concat(`playerB : ${playerBPoints.total}\n`);
    await ctx.reply(reply, {reply_markup: removeKeyboard});
    return;
  });

  bot.command("score", async (ctx) => {
    const commandName = "score";
    const participants = ["playerA", "playerB"];
    await handlePointsUpdate(ctx, commandName, participants);
  });

  bot.command("demerit", async (ctx) => {
    const commandName = "demerit";
    const participants = ["playerA", "playerB"];
    await handlePointsUpdate(ctx, commandName, participants);
  });

  bot.command("redeem", async (ctx) => {
    const commandName = "redeem";
    const participants = ["playerA", "playerB"];
    await handlePointsUpdate(ctx, commandName, participants);
  });

  bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const user = await getData(
      firestore,
      `users/${userId}`,
      {
        valid: false,
      });

    if (!user.valid) return;

    if (isAdmin(user)) {
      switch (user.state) {
      case "update item": {
        const context = JSON.parse(user.context);
        const itemList = await getData(
          firestore, `items/${context.itemClass}`,
          {descriptions: [], values: []});
        if (itemList.descriptions.length === 0) {
          await ctx.reply(`No ${context.itemClass} items found.`,
            {reply_markup: removeKeyboard});
          return;
        }
        const itemDescription = itemList.descriptions[context.itemIdx];
        const newValue = parseInt(ctx.message.text);
        const newValuesList = itemList.values;
        newValuesList[context.itemIdx] = newValue;
        await updateDoc(firestore,
          `items/${context.itemClass}`, {
            values: newValuesList, descriptions: itemList.descriptions});
        await updateDoc(
          firestore,
          `users/${userId}`,
          {state: "idle", context: "{}"});
        await ctx.reply(
          `Updated ${context.itemClass} item,`+
          `"${itemDescription}" with value "${newValue}"`,
          {reply_markup: removeKeyboard});
        return;
      }
      case "add item": {
        const context = JSON.parse(user.context);
        if (context.currentField === "description") {
          const description = ctx.message.text;
          const newContext = `{"itemClass":"${context.itemClass}",`+
            `"currentField":"value","description":"${description}"}`;

          await updateDoc(
            firestore,
            `users/${userId}`,
            {state: "add item", context: newContext});
          await ctx.reply(
            `Ok description is "${description}", please provide the value.`,
            {reply_markup: removeKeyboard});
        } else if (context.currentField === "value") {
          const itemList = await getData(
            firestore, `items/${context.itemClass}`,
            {descriptions: [], values: []});
          const itemValue = parseInt(ctx.message.text);
          const itemDescription = context.description;

          itemList.descriptions.push(itemDescription);
          itemList.values.push(itemValue);
          await updateDoc(firestore,
            `items/${context.itemClass}`,
            {
              descriptions: itemList.descriptions,
              values: itemList.values,
            });
          await updateDoc(
            firestore, `users/${ctx.from.id}`,
            {state: "idle", context: "{}"});
          await ctx.reply(
            `Added new ${context.itemClass},`+
            ` "${itemDescription}" of value "${itemValue}"`,
            {reply_markup: removeKeyboard});
        }
        return;
      }
      default: {
        return;
      }
      }
    }
  });

  app.use("/telegram", bot.webhookCallback("/",
    {secretToken: process.env.API_TOKEN}));
  telegramStatus = "Bot is loaded.";
}

app.get("/hello", async (req, res) => {
  res.send("Hello, Firebase!");
  functions.logger.log(`hello, ${telegramStatus}`);
  return;
});

if (process.env.FUNCTIONS_EMULATOR) {
  app.get("/dbreset", async (req, res) => {
    dbReset(firestore);
    res.send("Done!");
  });

  app.get("/dbseed", async (req, res) => {
    dbSeed(firestore);
    res.send("Done!");
  });
}

export default app;
