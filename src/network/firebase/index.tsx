// import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";

// const auth = getAuth();
const storage = getStorage();
const db = getFirestore();

export { db, storage };
