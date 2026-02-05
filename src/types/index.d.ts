import { Timestamp } from "firebase/firestore";

interface ProductTypes {
  id: string;
  name: string;
  image: string;
  invoice: string;
  mrp: string;
  readonly created_at?: string;
  readonly updated_at?: string;
  category_id: string;
  extra_info: string;
  extra_attachments?: Record<string, string>[];
}
interface ProductInsertTypes {
  id: string;
  name: string;
  image?: string;
  invoice: string;
  mrp: string;
  category_id: string;
  extra_info?: string;
  extra_attachments?: Record<string, string>[];
}
interface ProductUpdateTypes {
  id: string;
  name: string;
  image: string;
  invoice: string;
  mrp: string;
  category_id: string;
  extra_info?: string;
  extra_attachments?: Record<string, string>[];
}

interface ProductCategoryTypes {
  id: string;
  created_at?: string;
  name: string;
}

export {
  ProductTypes,
  ProductCategoryTypes,
  ProductInsertTypes,
  ProductUpdateTypes,
};
