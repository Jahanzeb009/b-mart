import { Timestamp } from "@react-native-firebase/firestore";

interface ProductTypes {
  id: string;
  product_name: string;
  product_image: string;
  product_invoice: string;
  product_mrp: string;
  last_updated_at: Timestamp | null;
  product_category: string;
  product_extra_info: string;
}

interface ProductCategoryTypes {
  id: string;
  key: string;
}

export { ProductTypes };
