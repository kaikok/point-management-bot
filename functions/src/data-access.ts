import * as admin from "firebase-admin";

let dataAccessFirestore : admin.firestore.Firestore;

export const setFirestore = (firestore: admin.firestore.Firestore) => {
  dataAccessFirestore = firestore;
};

export const getData = async (
  path: string,
  defaultData: admin.firestore.DocumentData):
    Promise<admin.firestore.DocumentData> => {
  let data: admin.firestore.DocumentData = defaultData;
  const docRef = await dataAccessFirestore.doc(path).get();
  if (docRef !== undefined) {
    data = docRef.data() || defaultData;
  }
  return data;
};

export const addDoc = async (
  path: string,
  data: admin.firestore.DocumentData):
    Promise<admin.firestore.DocumentData> => {
  const collectionRef = await dataAccessFirestore.collection(path);
  if (collectionRef === undefined) {
    throw new Error("Collection not found");
  }
  return await collectionRef.add(data);
};

export const setDoc = async (
  path: string,
  docName: string,
  data: admin.firestore.DocumentData):
    Promise<admin.firestore.DocumentData> => {
  const collectionRef = await dataAccessFirestore.collection(path);
  if (collectionRef === undefined) {
    throw new Error("Collection not found");
  }
  return await collectionRef.doc(docName).set(data);
};

export const updateDoc = async (
  path: string,
  data: {[x: string]: unknown;}):
    Promise<admin.firestore.DocumentData> => {
  const docRef = dataAccessFirestore.doc(path);
  return await docRef.update(data);
};

export const deleteDoc = async (
  path: string):
    Promise<admin.firestore.DocumentData> => {
  const docRef = dataAccessFirestore.doc(path);
  return await docRef.delete();
};
