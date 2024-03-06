jest.mock("telegraf");
import {Telegraf} from "telegraf";
import {setupStateMachine} from "../src/interaction";
import {ReplyKeyboardRemove} from "telegraf/typings/core/types/typegram";
import {generateMermaidFromXState} from "fsm2mermaid";

const removeKeyboard : ReplyKeyboardRemove= {
  "remove_keyboard": true,
  "selective": true,
};

describe("Generate mermaid diagram", () => {
  test.only("get machine", async () => {
    const bot = new Telegraf("", {
      telegram: {webhookReply: true},
    });
    const eventViewingMachine = setupStateMachine(bot, removeKeyboard);
    expect(generateMermaidFromXState(eventViewingMachine)).toMatchSnapshot();
  });
});
