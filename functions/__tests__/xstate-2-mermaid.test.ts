jest.mock("telegraf");
import {Telegraf} from "telegraf";
import {setupStateMachine} from "../src/interaction";
import {ReplyKeyboardRemove} from "telegraf/typings/core/types/typegram";
import { generateMermaidFromXState } from "../src/mermaid-generator";
import {createMachine} from "xstate";

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

  test.only("simple machine", async () => {
    const simple = createMachine(
      {
        id: "simple",
        initial: "lightsOff",
        states: {
          lightsOn: {
            on: {
              toggle: {
                target: "lightsOff",
              },
            },
          },
          lightsOff: {
            on: {
              toggle: {
                target: "lightsOn",
              },
            },
          }
        }
      },
      {
        actions: {},
        actors: {},
        guards: {},
        delays: {},
      });
    expect(generateMermaidFromXState(simple)).toMatchSnapshot();
  });

  test.only("parallel machine", async () => {
    const parallel = createMachine({
      id: "coffee",
      initial: "preparing",
      states: {
        preparing: {
          states: {
            grindBeans: {
              initial: "grindingBeans",
              states: {
                grindingBeans: {
                  on: {
                    BEANS_GROUND: {
                      target: "beansGround",
                    },
                  },
                },
                beansGround: {
                  type: "final",
                },
              },
            },
            boilWater: {
              initial: "boilingWater",
              states: {
                boilingWater: {
                  on: {
                    WATER_BOILED: {
                      target: "waterBoiled",
                    },
                  },
                },
                waterBoiled: {
                  type: "final",
                },
              },
            },
          },
          type: "parallel",
          onDone: {
            target: "makingCoffee",
          },
        },
        makingCoffee: {},
      },
    });
    expect(generateMermaidFromXState(parallel)).toMatchSnapshot();
  });
});