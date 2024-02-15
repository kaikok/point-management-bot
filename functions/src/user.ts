import * as admin from "firebase-admin";
import {getData, updateDoc} from "./data-access";

export const getUser = async (
  firestore: admin.firestore.Firestore,
  userId: number): Promise<admin.firestore.DocumentData> => {
  const user = await getData(
    firestore,
    `users/${userId}`,
    {valid: false, role: "none"});
  return user;
};

export const isAdmin = (
  user: admin.firestore.DocumentData): boolean => {
  if (user.role === "admin") return true;
  return false;
};

export const updateUserXStateContext = async (
  firestore: admin.firestore.Firestore,
  userId: number,
  xStateContext: string):
  Promise<admin.firestore.DocumentData> => {
  return await updateDoc(
    firestore, `users/${userId}`,
    {xstateContext: xStateContext});
};
