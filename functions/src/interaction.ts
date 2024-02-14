/* eslint-disable require-jsdoc */
import {Context, Telegraf} from "telegraf";
import {Update, ReplyKeyboardRemove}
  from "telegraf/typings/core/types/typegram";
import {createMachine, fromPromise} from "xstate";

export function setupStateMachine(
  bot: Telegraf<Context<Update>>, removeKeyboard: ReplyKeyboardRemove) {
  const machine = createMachine(
    {
      context: ({input}) => ({
        userId: input.userId,
        conversationContext: "",
      }),
      id: "interact",
      states: {
        conversation: {
          initial: "awaitCommand",
          states: {
            awaitCommand: {
              on: {
                eventCommand: {
                  target: "returnQueryTypeKeyboard",
                },
              },
            },
            returnQueryTypeKeyboard: {
              invoke: {
                input: {},
                src: "SendEventQueryTypeKboard",
                onDone: [
                  {
                    target: "awaitEventQueryType",
                    actions: {
                      type: "CheckDone",
                    },
                  },
                ],
                onError: [
                  {
                    target: "awaitCommand",
                    actions: {
                      type: "CheckError",
                    },
                  },
                ],
              },
            },
            awaitEventQueryType: {
              on: {
                receivedInput: {
                  target: "removeKeyboard",
                  guard: "isQueryToday",
                },
              },
            },
            removeKeyboard: {
              invoke: {
                input: {},
                src: "SendEmptyKeyboard",
                onDone: [
                  {
                    target: "awaitCommand",
                  },
                ],
                onError: [
                  {
                    target: "awaitCommand",
                  },
                ],
              },
            },
          },
        },
        hydration: {
          initial: "persisted",
          states: {
            persisted: {
              on: {
                restore: {
                  target: "restored",
                },
              },
            },
            restored: {},
          },
        },
      },
      type: "parallel",
      types: {
        events: {} as
            | { type: "eventCommand" }
            | { type: "receivedInput" }
            | { type: "restore" },
      },
    },
    {
      actions: {
        CheckDone: function({context, event}, params) {
          console.log("Send keyboard done");
        },
        CheckError: function({context, event}, params) {
          console.log("Send keyboard error");
        },
      },
      actors: {
        SendEventQueryTypeKboard: fromPromise(
          async ({
            input,
          }: {
              input: {
                userId: number;
              };
            }) => {
            const builtinKeyboard = {
              resize_keyboard: true,
              one_time_keyboard: true,
              keyboard: [["today"], ["yesterday"], ["ddmmyyyy"]],
            };
            return await bot.telegram.sendMessage(
              input.userId,
              "Events from which day?",
              {reply_markup: builtinKeyboard},
            );
          },
        ),
        SendEmptyKeyboard: fromPromise(
          async ({
            input,
          }: {
              input: {
                userId: number;
              };
            }) => {
            return await bot.telegram.sendMessage(
              input.userId,
              "Back to initial state",
              {reply_markup: removeKeyboard},
            );
          },
        ),
      },
      guards: {
        isQueryToday: function({context, event}, params) {
          console.log("is it today?");
          console.log(event.input);
          return event.input === "today";
        },
      },
      delays: {},
    },
  );
  return machine;
}

module.exports = {
  setupStateMachine: setupStateMachine,
};
