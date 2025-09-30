import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";

const storage = getStorage();
const db = getFirestore();

export { db, storage };
