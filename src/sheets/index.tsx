import { SheetRegister, SheetDefinition } from "react-native-actions-sheet";

import AddCategorySheet from "./addCategorySheet";
import UploadedImagesSheet from "./uploadedImagesSheet";
import ShowAllCategoriesSheet from "./showAllCategoriesSheet";
import { KhataItemTypes, ProductCategoryTypes } from "../types";
import ImageViewSheet from "./imageViewSheet";
import AddKhataSheet from "./addKhataSheet";

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
    "image-view-sheet": SheetDefinition<{
      payload: {
        image: string;
      };
    }>;
    "add-khata-sheet": SheetDefinition<{
      payload?: {
        item?: KhataItemTypes;
        uniqueCustNames: Array<string>;
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

export const Sheets = () => {
  return (
    <SheetRegister
      sheets={{
        "add-category-sheet": AddCategorySheet,
        "uploaded-images-sheet": UploadedImagesSheet,
        "show-all-categories-sheet": ShowAllCategoriesSheet,
        "image-view-sheet": ImageViewSheet,
        "add-khata-sheet": AddKhataSheet,
      }}
    />
  );
};
