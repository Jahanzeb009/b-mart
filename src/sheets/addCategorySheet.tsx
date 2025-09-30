import { View, Text } from "react-native";
import React, { useState } from "react";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import CustomInput from "@/components/CustomInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { useTheme } from "@react-navigation/native";

const AddCategorySheet = (props: SheetProps<"add-category-sheet">) => {
  const [categoryName, setCategoryName] = useState("");

  const inset = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <ActionSheet
      gestureEnabled
      id={props.sheetId}
      containerStyle={{
        backgroundColor: colors.border,
        paddingTop: 15,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
      }}
      indicatorStyle={{ backgroundColor: colors.card }}
      ExtraOverlayComponent={
        <View style={{ width: "100%", paddingHorizontal: 15 }}>
          <CustomButton
            onPress={() => {
              SheetManager.hide("add-category-sheet", {
                payload: categoryName,
              });
            }}
            style={{ marginBottom: inset.bottom + 15 }}
          >
            Save
          </CustomButton>
        </View>
      }
    >
      <View
        style={{
          padding: 15,
          gap: 15,
        }}
      >
        <CustomInput
          label="Category Name"
          placeholder="Enter category name"
          value={categoryName}
          autoFocus
          onChangeText={(value) => setCategoryName(value.toLowerCase())}
          returnKeyType="done"
          style={{ backgroundColor: colors.border }}
          onSubmitEditing={() => {
            SheetManager.hide("add-category-sheet", {
              payload: categoryName,
            });
          }}
        />
      </View>
    </ActionSheet>
  );
};

export default AddCategorySheet;
