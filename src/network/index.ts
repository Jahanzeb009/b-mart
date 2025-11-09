import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { ProductCategoryTypes, ProductTypes } from "../types";
import { Dispatch, SetStateAction } from "react";

export const ErrorLog = (name: string, error: unknown) =>
  console.log(`${name} -> `, error);

const COLLECTIONS = {
  products: "products",
  categories: "categories",
};
const addCategory = async (key: string) => {
  try {
    const ref = collection(db, COLLECTIONS.categories);
    await addDoc(ref, {
      key,
    });
  } catch (e) {
    ErrorLog("Error adding category", e);
  }
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
    ErrorLog("Error fetching categories", error);
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
    ErrorLog("deleteProducts error", error);
    return false;
  }
};

const getProductsRealTime = (
  setState: Dispatch<SetStateAction<boolean>>,
  cb: (products: ProductTypes[]) => void
) => {
  try {
    setState?.(true);
    const q = query(
      collection(db, COLLECTIONS.products),
      orderBy("last_updated_at", "desc")
    );
    const sub = onSnapshot(q, (snapshot) => {
      const products =
        snapshot?.docs?.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) ?? [];
      setState?.(false);
      cb?.(products as ProductTypes[]);
    });

    return sub;
  } catch (e) {
    ErrorLog("getProductsRealTime", e);
    setState?.(false);
    return null;
  }
};
const getCategoriesRealTime = (
  cb: (products: ProductCategoryTypes[]) => void
) => {
  try {
    const sub = onSnapshot(
      collection(db, COLLECTIONS.categories),
      (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        cb?.(products as ProductCategoryTypes[]);
      }
    );

    return sub;
  } catch (e) {
    ErrorLog("getCategoriesRealTime", e);
    return null;
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
    ErrorLog("Error fetching products", error);
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
    ErrorLog("Error updating product", error);
    return false;
  }
};

const saveProduct = async (data: Omit<ProductTypes, "id">) => {
  try {
    const ref = collection(db, COLLECTIONS.products);
    await addDoc(ref, data);
    return true;
  } catch (error) {
    ErrorLog("Error saving product", error);
    return false;
  }
};

const deleteProduct = async (productId: string) => {
  try {
    const ref = doc(db, COLLECTIONS.products, productId);
    await deleteDoc(ref);

    return true;
  } catch (error) {
    ErrorLog("Error deleting product", error);
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
  addCategory,
  getProductsRealTime,
  getCategoriesRealTime,
};
