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

interface KhataItemTypes {
  id: string;
  cust_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
  created_by: string;
  updated_by: string | null;
  created_by_user: {
    username: string;
  };
  updated_by_user: {
    username: string;
  } | null;
}

export {
  ProductTypes,
  ProductCategoryTypes,
  ProductInsertTypes,
  ProductUpdateTypes,
  KhataItemTypes,
};
