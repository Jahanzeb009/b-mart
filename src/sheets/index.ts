import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import AddCategorySheet from "./addCategorySheet";
import UploadedImagesSheet from "./uploadedImagesSheet";
import ShowAllCategoriesSheet from "./showAllCategoriesSheet";
import { ProductCategoryTypes } from "../types";
import ImageViewSheet from "./imageViewSheet";

registerSheet("add-category-sheet", AddCategorySheet);
registerSheet("uploaded-images-sheet", UploadedImagesSheet);
registerSheet("show-all-categories-sheet", ShowAllCategoriesSheet);
registerSheet("image-view-sheet", ImageViewSheet);

declare module "react-native-actions-sheet" {
  interface Sheets {
    "add-category-sheet": SheetDefinition<{
      returnValue: string | null;
    }>;
    "uploaded-images-sheet": SheetDefinition<{
      returnValue: string | null;
    }>;
    "image-view-sheet": SheetDefinition<{
      payload: {
        image: string;
      };
    }>;
    "show-all-categories-sheet": SheetDefinition<{
      returnValue: ProductCategoryTypes | null;
      payload: {
        categories: ProductCategoryTypes[];
        selectedCategory: ProductCategoryTypes;
        onPress: (index: number) => void;
      };
    }>;
  }
}

export {};
