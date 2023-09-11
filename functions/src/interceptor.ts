/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import type {Context, Middleware} from "telegraf";
import {Opts, Telegram}
  from "telegraf/typings/core/types/typegram";
import ApiClient from "telegraf/typings/core/network/client";

export function middlewareInterceptor(): Middleware<Context> {
  const middleware: Middleware<Context> = async (ctx, next) => {
    const oldCallApi = ctx.telegram.callApi.bind(ctx.telegram);
    const newCallApi: typeof ctx.telegram.callApi =
      async function newCallApi(
        this: typeof ctx.telegram, method, payload, {signal} = {}) {
        functions.logger.info(
          "ctx-reply-interceptor-request",
          method, payload, signal, {structuredData: true});
        const response = await oldCallApi(method, payload, {signal});
        functions.logger.info(
          "ctx-reply-interceptor-response",
          response, {structuredData: true});
        return response;
      };
    ctx.telegram.callApi = newCallApi.bind(ctx.telegram);
    return next();
  };
  return middleware;
}

export function outgoingInterceptor(oldCallApi: <M extends keyof Telegram>(
  method: M,
  payload: Opts<M>,
  {signal}: ApiClient.CallApiOptions) =>
    Promise<ReturnType<Telegram[M]>>):<M extends keyof Telegram>(
  method: M,
  payload: Opts<M>,
  {signal}: ApiClient.CallApiOptions) => Promise<ReturnType<Telegram[M]>> {
  async function newCallApi<M extends keyof Telegram>(
    this: Telegram,
    method: M,
    payload: Opts<M>,
    {signal} : ApiClient.CallApiOptions = {}):
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Promise<ReturnType<(...args: any) => any>> {
    functions.logger.info(
      "bot-sendmessage-interceptor-request",
      method, payload, signal, {structuredData: true});
    const response = await oldCallApi(
      method, payload, {signal}) as ReturnType<Telegram[M]>;
    functions.logger.info(
      "bot-sendmessage-interceptor-response",
      response, {structuredData: true});
    return response;
  }
  return newCallApi;
}

module.exports = {
  middlewareInterceptor: middlewareInterceptor,
  outgoingInterceptor: outgoingInterceptor,
};
