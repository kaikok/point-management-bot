import * as admin from "firebase-admin";
import {setDoc, setFirestore} from "./data-access";
import {Timestamp} from "firebase-admin/firestore";


export const dbSeed = async (
  firestore: admin.firestore.Firestore) => {
  setFirestore(firestore);
  await setDoc("participants", "playerA",
    {
      total: 0,
    });
  await setDoc("participants/playerA/events", "sampleEvent",
    {
      name: "Test Event",
      timestamp: Timestamp.now(),
    });
  await setDoc("participants", "playerB",
    {
      total: 0,
    });
  await setDoc("participants/playerB/events", "sampleEvent",
    {
      name: "Test Event",
      timestamp: Timestamp.now(),
    });
  await setDoc("items", "demerit",
    {
      descriptions: [
        "not so good behavior",
        "bad behavior",
      ],
      values: [
        -1,
        -2,
      ],
    });
  await setDoc("items", "redemption",
    {
      descriptions: [
        "Big prize",
        "Small prize",
        "Small trip",
      ],
      values: [
        -2,
        -1,
        -3,
      ],
    });
  await setDoc("items", "score",
    {
      descriptions: [
        "run an errand",
        "do a good deed",
      ],
      values: [
        1,
        2,
      ],
    });
  await setDoc("users", "88888888",
    {
      context: "{}",
      xstateContext: "",
      role: "admin",
      state: "idle",
      valid: true,
    });
};
