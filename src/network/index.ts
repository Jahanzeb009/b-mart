import {
  KhataItemTypes,
  ProductCategoryTypes,
  ProductInsertTypes,
  ProductTypes,
  ProductUpdateTypes,
} from "../types";
import { supabase } from "./supabase";
import { STORAGE, TABLES } from "./contants";
import { Alert } from "react-native";
import { decode } from "base64-arraybuffer";

export const ErrorLog = (name: string, error: unknown) =>
  console.log(`${name} -> `, error);

const addCategory = async (name: string) => {
  try {
    const { error, data } = await supabase
      .from(TABLES.categories)
      .insert({
        name,
      })
      .select("*")
      .single();

    return { data, error };
  } catch (e) {
    ErrorLog("Error adding category", e);
  }
};

export const createCategory = async (categoryName: string) => {
  const { data, error } = await supabase
    .from(TABLES.categories)
    .insert([
      { name: categoryName }, // We only supply the name
    ])
    .select(); // Use .select() to return the inserted data

  if (error) {
    console.error("Error creating category:", error.message);
    return null;
  }

  // data will be an array of the inserted rows. We take the first one.
  console.log("New category created:", data[0]);
  return data;
};

const getCategories = async (): Promise<ProductCategoryTypes[]> => {
  try {
    const { data } = await supabase.from(TABLES.categories).select("*");
    return data as ProductCategoryTypes[];
  } catch (error) {
    ErrorLog("Error fetching categories", error);
    return [];
  }
};

const deleteProducts = async (products: Set<string>) => {
  try {
    const ids = Array.from(products);

    // 1. Delete images from storage
    const imagePaths = ids.map((id) => `${id}.png`);

    const { error: storageError } = await supabase.storage
      .from(STORAGE.BUCKET.product_images)
      .remove(imagePaths);
    if (storageError) {
      ErrorLog("deleteProducts storage error", storageError);
      return false;
      // optional: return false if image delete is critical
    }

    // 2. Delete products from table
    const { error: dbError } = await supabase
      .from(TABLES.products)
      .delete()
      .in("id", ids);

    if (dbError) {
      ErrorLog("deleteProducts db error", dbError);
      return false;
    }

    return true;
  } catch (error) {
    ErrorLog("deleteProducts error", error);
    return false;
  }
};

const getProductList = async () => {
  try {
    const { data, error } = await supabase.from(TABLES.products).select("*");
    return data as ProductTypes[];
  } catch (error) {
    ErrorLog("Error fetching products", error);
    return [];
  }
};

const updateProduct = async ({ id, ...data }: Partial<ProductUpdateTypes>) => {
  try {
    const res = await supabase
      .from(TABLES.products)
      .update(data)
      .eq("id", id)
      .select("*");

    return res;
  } catch (error) {
    ErrorLog("Error updating product", error);
    return false;
  }
};

const saveProduct = async (data: ProductInsertTypes) => {
  try {
    const res = await supabase
      .from(TABLES.products)
      .insert(data)
      .select("*")
      .single();
    return res;
  } catch (error) {
    ErrorLog("Error saving product", error);
    return false;
  }
};
const updateProductInfo = async ({
  id,
  ...data
}: Partial<ProductUpdateTypes>) => {
  try {
    const res = await supabase
      .from(TABLES.products)
      .update(data)
      .eq("id", id)
      .select("*");
    return res;
  } catch (error) {
    ErrorLog("Error saving product", error);
    return false;
  }
};

const uploadProductImage = async ({
  product_id,
  base64,
  filename,
  mimeType = "image/png",
}: {
  product_id: string;
  base64: string;
  filename: string;
  mimeType?: string;
}) => {
  const path = `${product_id}/${filename}`;

  const { data, error } = await supabase.storage
    .from(STORAGE.BUCKET.product_images)
    .upload(path, decode(base64), {
      // Assuming 'decode' function for Base64 -> ArrayBuffer/Blob
      contentType: mimeType,
      upsert: true, // Overwrite if an image for this product ID already exists
    });

  if (error) {
    console.log(JSON.stringify(error, null, 2));
    Alert.alert(error?.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE.BUCKET.product_images).getPublicUrl(path);

  return publicUrl;
};

export const createKhata = async ({
  is_completed = false,
  ...item
}: Partial<Omit<KhataItemTypes, "id" | "user">>) => {
  const { data, error } = await supabase
    .from(TABLES.khata)
    .insert({
      ...item,
      is_completed,
    })
    .select()
    .single(); // Use .select() to return the inserted data

  if (error) {
    console.error("Error creating khata:", error.message);
    return null;
  }

  // data will be an array of the inserted rows. We take the first one.
  console.log("New khata created:", data);
  return data;
};

export const updateKhata = async ({
  id,
  ...item
}: { id: string } & Partial<Omit<KhataItemTypes, "id" | "created_at"| 'user' | 'created_by'>>) => {
  const { data, error } = await supabase
    .from(TABLES.khata)
    .update(item)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating khata:", error.message);
    return null;
  }

  // data will be an array of the inserted rows. We take the first one.
  console.log("Khata updated:", data);
  return data;
};

export const deleteKhata = async ({ id }: { id: string }) => {
  const { data, error } = await supabase
    .from(TABLES.khata)
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error deleting khata:", error.message);
    return null;
  }

  // data will be an array of the inserted rows. We take the first one.
  console.log("Khata deleted:", data);
  return data;
};

export {
  getProductList,
  updateProduct,
  saveProduct,
  deleteProducts,
  getCategories,
  addCategory,
  updateProductInfo,
  uploadProductImage,
};
