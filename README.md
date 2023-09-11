# Point Management Bot

## Introduction

This Telegram bot is a Point Tracking system.
Our target users are busy parents and playful children who could use some incentive system to develop positive habits.

## User Documentation

TODO

Refer to E2E test cases in functions/\_\_tests__/e2e/*.test.ts for now.

## Developer Documentation

The software is written in Typescript.
We are using

- Firebase as our deployment environment.
- Telegraf module for intefacing with Telegram Server.
- Firebase emulator for local exploratory testing.
- Jest for both E2E and unit testing.

### Firebase config file.

Add your **.firebaserc** file to point to your firebase project.


```
{
  "projects": {
    "default": "my-project"
  }
}
```

### Env file configurations

Create .env

|SNO|NAME|DESCRIPTION|
|---|---|---|
|1|YOURTOKEN|Telegram Bot token from Bot Father.|
|2|API_TOKEN|API secret to protect your bot endpoint.|
|3|DEBUG|This flag could be used to activate debug logging from Telegraf module. Use 'telegraf:*' to enable all logs from Telegraf.|

Create .env.local

|SNO|NAME|DESCRIPTION|
|---|---|---|
|1|YOURTOKEN|Telegram Bot token from Bot Father.|
|2|API_TOKEN|API secret to protect your bot endpoint.|
|3|DEBUG|This flag could be used to activate debug logging from Telegraf module. Use 'telegraf:*' to enable all logs from Telegraf.|
|4|PROJECT_ID|This is used to initialise Firebase in E2E test as the location of firebase.json is not expected.|
|5|FIRESTORE_EMULATOR_HOST|This is point Firestore access to local emulator during E2E test.|

### Deployment

```bash
my-project$ firebase deploy --only functions
```

One time API call to configure our production webhook to the Telegram server.

Configuring Telegram Bot callback
https://core.telegram.org/bots/api
https://core.telegram.org/bots/webhooks

```bash
curl -F "url=https://us-central1-<PROJECT_ID>.cloudfunctions.net/api/telegram" -F "secret_token=<API_TOKEN>" "https://api.telegram.org/bot<YOURTOKEN>/setWebhook"
```

Sample

```bash
curl -F "url=https://us-central1-my-project.cloudfunctions.net/api/telegram" -F "secret_token=abc123" "https://api.telegram.org/bot123:ABC-DEF-xyz/setWebhook"
```

Testing the endpoint.

```bash
curl -k https://us-central1-my-project.cloudfunctions.net/api/hello
Hello, Firebase!
```

### Using Emulators

Starting up.

```bash
my-project$ firebase emulators:start
```

API Testing against emulators

```bash
curl http://127.0.0.1:5001/my-project/us-central1/api/hello
curl http://127.0.0.1:5001/my-project/us-central1/api/dbreset
curl http://127.0.0.1:5001/my-project/us-central1/api/dbseed
```

Visit the Firestore emulator console to examine changes made to it.
http://127.0.0.1:4000/firestore/data


### Running E2E tests

Make sure firestore emulator is running.

```bash
my-project$ firebase emulators:start --only firestore
```

```bash
my-project/functions$ npm run test:e2e
```

### Debugging Telegraf library

Set this in terminal or alternatively through the .env file.

```bash
export DEBUG='telegraf:*'
```

