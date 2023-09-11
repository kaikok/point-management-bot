import * as admin from "firebase-admin";


export const dbReset = async (
  firestore: admin.firestore.Firestore) => {
  await firestore.recursiveDelete(firestore.collection("participants"));
  await firestore.recursiveDelete(firestore.collection("items"));
  await firestore.recursiveDelete(firestore.collection("users"));
};
