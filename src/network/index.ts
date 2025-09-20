import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { db } from "./firebase";
import { ProductTypes } from "../types";

const COLLECTIONS = {
  products: "products",
  categories: "categories",
};

const getCategories = async () => {
  try {
    const ref = collection(db, COLLECTIONS.categories);
    const querySnapshot = await getDocs(ref);
    const categories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

const deleteProducts = async (products: Set<string>) => {
  try {
    for (const id of products) {
      await deleteDoc(doc(db, COLLECTIONS.products, id));
    }

    return true;
  } catch (error) {
    console.log({ error });
    return false;
  }
};

const getProductList = async () => {
  try {
    const ref = collection(db, COLLECTIONS.products);
    const querySnapshot = await getDocs(ref);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products as ProductTypes[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const updateProduct = async (
  productId: string,
  data: Omit<ProductTypes, "id">
) => {
  try {
    const ref = doc(db, COLLECTIONS.products, productId);
    await updateDoc(ref, { ...data });

    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    return false;
  }
};

const saveProduct = async (data: Omit<ProductTypes, "id">) => {
  try {
    const ref = collection(db, COLLECTIONS.products);
    await addDoc(ref, data);
    return true;
  } catch (error) {
    console.error("Error saving product:", error);
    return false;
  }
};

const deleteProduct = async (productId: string) => {
  try {
    const ref = doc(db, COLLECTIONS.products, productId);
    await deleteDoc(ref);

    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
};

export {
  getProductList,
  updateProduct,
  deleteProduct,
  saveProduct,
  deleteProducts,
  getCategories,
};
