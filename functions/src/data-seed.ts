import * as admin from "firebase-admin";
import {setDoc} from "./data-access";
import {Timestamp} from "firebase-admin/firestore";


export const dbSeed = async (
  firestore: admin.firestore.Firestore) => {
  await setDoc(firestore, "participants", "playerA",
    {
      total: 0,
    });
  await setDoc(firestore, "participants/playerA/events", "sampleEvent",
    {
      name: "Test Event",
      timestamp: Timestamp.now(),
    });
  await setDoc(firestore, "participants", "playerB",
    {
      total: 0,
    });
  await setDoc(firestore, "participants/playerB/events", "sampleEvent",
    {
      name: "Test Event",
      timestamp: Timestamp.now(),
    });
  await setDoc(firestore, "items", "demerit",
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
  await setDoc(firestore, "items", "redemption",
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
  await setDoc(firestore, "items", "score",
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
  await setDoc(firestore, "users", "88888888",
    {
      context: "{}",
      role: "admin",
      state: "idle",
      valid: true,
    });
};
