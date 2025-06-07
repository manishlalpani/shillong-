import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "./firebase";

const db = getFirestore(firebaseApp);

export async function fetchMetaAndScripts() {
  const docRef = doc(db, "settings", "metaAndScripts");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}
