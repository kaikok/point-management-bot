import * as admin from "firebase-admin";


export const getData = async (
  firestore: admin.firestore.Firestore,
  path: string,
  defaultData: admin.firestore.DocumentData):
    Promise<admin.firestore.DocumentData> => {
  let data: admin.firestore.DocumentData = defaultData;
  const docRef = await firestore.doc(path).get();
  if (docRef !== undefined) {
    data = docRef.data() || defaultData;
  }
  return data;
};

export const addDoc = async (
  firestore: admin.firestore.Firestore,
  path: string,
  data: admin.firestore.DocumentData):
    Promise<admin.firestore.DocumentData> => {
  const collectionRef = await firestore.collection(path);
  if (collectionRef === undefined) {
    throw new Error("Collection not found");
  }
  return await collectionRef.add(data);
};

export const setDoc = async (
  firestore: admin.firestore.Firestore,
  path: string,
  docName: string,
  data: admin.firestore.DocumentData):
    Promise<admin.firestore.DocumentData> => {
  const collectionRef = await firestore.collection(path);
  if (collectionRef === undefined) {
    throw new Error("Collection not found");
  }
  return await collectionRef.doc(docName).set(data);
};

export const updateDoc = async (
  firestore: admin.firestore.Firestore,
  path: string,
  data: {[x: string]: unknown;}):
    Promise<admin.firestore.DocumentData> => {
  const docRef = firestore.doc(path);
  return await docRef.update(data);
};

export const deleteDoc = async (
  firestore: admin.firestore.Firestore,
  path: string):
    Promise<admin.firestore.DocumentData> => {
  const docRef = firestore.doc(path);
  return await docRef.delete();
};
