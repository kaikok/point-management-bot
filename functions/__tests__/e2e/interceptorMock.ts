import {Context, Middleware} from "telegraf";
import ApiClient from "telegraf/typings/core/network/client";
import { Opts, Telegram } from "telegraf/typings/core/types/typegram";

export const interceptedMessage = jest.fn();
export const getMockResponse = jest.fn();
getMockResponse.mockReturnValue({});

jest.mock("../../src/interceptor", () => {
    return {
      middlewareInterceptor: (): Middleware<Context> => {
          const middleware: Middleware<Context> = async (ctx, next) => {
            const newCallApi: typeof ctx.telegram.callApi =
              async function newCallApi(
                this: typeof ctx.telegram, method, payload, {signal} = {}) {
                // console.log("bot-reply-interceptor",
                //   method, payload, signal, {structuredData: true});
                interceptedMessage(method, payload, signal);
                return getMockResponse(method, payload, signal) as Promise<ReturnType<(...args: any) => any>>;
              };
            ctx.telegram.callApi = newCallApi.bind(ctx.telegram);
            return next();
          };
          return middleware;
      },
      outgoingInterceptor: (oldCallApi: <M extends keyof Telegram>(
        method: M,
        payload: Opts<M>,
        {signal}: ApiClient.CallApiOptions) =>
          Promise<ReturnType<Telegram[M]>>):<M extends keyof Telegram>(
        method: M,
        payload: Opts<M>,
        {signal}: ApiClient.CallApiOptions) => Promise<ReturnType<Telegram[M]>> => {
          async function newCallApi<M extends keyof Telegram>(
            this: Telegram,
            method: M,
            payload: Opts<M>,
            {signal}: ApiClient.CallApiOptions = {}) {
            // console.log(
            //   "bot-adhoc-call-interceptor-request",
            //   method, payload, signal, {structuredData: true});
            interceptedMessage(method, payload, signal);
            return getMockResponse(method, payload, signal) as Promise<ReturnType<(...args: any) => any>>;
          }
          return newCallApi;
        }
    }
  });

module.exports = {
  interceptedMessage: interceptedMessage,
  getMockResponse: getMockResponse,
};