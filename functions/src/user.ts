import * as admin from "firebase-admin";
import {getData, updateDoc} from "./data-access";

export const getUser = async (
  userId: number): Promise<admin.firestore.DocumentData> => {
  const user = await getData(
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
  userId: number,
  xStateContext: string):
  Promise<admin.firestore.DocumentData> => {
  return await updateDoc(
    `users/${userId}`,
    {xstateContext: xStateContext});
};
