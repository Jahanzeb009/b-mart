import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import AddCategorySheet from "./addCategorySheet";
import UploadedImagesSheet from "./uploadedImagesSheet";
import ShowAllCategoriesSheet from "./showAllCategoriesSheet";

registerSheet("add-category-sheet", AddCategorySheet);
registerSheet("uploaded-images-sheet", UploadedImagesSheet);
registerSheet("show-all-categories-sheet", ShowAllCategoriesSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module "react-native-actions-sheet" {
  interface Sheets {
    "add-category-sheet": SheetDefinition<{
      returnValue: string | null;
    }>;
    "uploaded-images-sheet": SheetDefinition<{
      returnValue: string | null;
    }>;
    "show-all-categories-sheet": SheetDefinition<{
      returnValue: { key: string; id: string } | null;
      payload: {
        categories: { key: string; id: string }[];
        selectedCategory: { key: string; id: string };
        onPress: (index: number) => void;
      };
    }>;
  }
}

export {};
