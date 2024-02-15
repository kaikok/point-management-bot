/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import {Context, Telegraf} from "telegraf";
import {Update, ReplyKeyboardRemove}
  from "telegraf/typings/core/types/typegram";
import {Actor, AnyActorLogic, createActor, createMachine, fromPromise}
  from "xstate";
import {updateUserXStateContext} from "./user";

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
                input: ({context}) => ({userId: context.userId}),
                src: "SendEventQueryTypeKboard",
                onDone: [
                  {
                    target: [
                      "awaitEventQueryType",
                      "#interact.hydration.persisted"],
                    actions: {
                      type: "CheckDone",
                    },
                  },
                ],
                onError: [
                  {
                    target: ["awaitCommand", "#interact.hydration.persisted"],
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
                input: ({context}) => ({userId: context.userId}),
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
          | { type: "eventCommand"; input: string }
          | { type: "receivedInput"; input: string }
          | { type: "restore"; input: string },
        context: {} as {
          userId: number;
          conversationContext: string;
        },
        input: {} as {
          userId: number;
        },
      },
    },
    {
      actions: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        CheckDone: function({context, event}, params) {
          console.log("Send keyboard done");
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              {reply_markup: removeKeyboard});
          },
        ),
      },
      guards: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isQueryToday: function({context, event}, params) {
          functions.logger.info(
            "is it today?", event.input, {structuredData: true});
          return event.input === "today";
        },
      },
      delays: {},
    },
  );
  return machine;
}

export const hydrateActor = async (
  userId: number,
  xstateContext: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateMachine: any):
    Promise<Actor<AnyActorLogic>> => {
  let userActor;
  if (xstateContext==="") {
    userActor = createActor(stateMachine, {
      input: {
        userId: userId,
      },
    }).start();
    const cleanState = userActor.getPersistedSnapshot();
    await updateUserXStateContext(userId, JSON.stringify(cleanState));
  } else {
    const restoredState = JSON.parse(xstateContext);
    userActor = createActor(stateMachine, {
      snapshot: restoredState,
      input: {
        userId: userId,
      },
    }).start();
  }
  return userActor;
};

export function getPersistanceCallback(userActor: Actor<AnyActorLogic>):
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((snapshot: any) => void) {
  return async (state) => {
    functions.logger.info(
      state.value, state.context, {structuredData: true});
    if (state.value["hydration"] === "persisted") {
      const newState = userActor.getPersistedSnapshot();
      return await updateUserXStateContext(
        state.context.userId,
        JSON.stringify(newState));
    } return Promise.resolve();
  };
}

module.exports = {
  setupStateMachine: setupStateMachine,
  hydrateActor: hydrateActor,
  getPersistanceCallback: getPersistanceCallback,
};
