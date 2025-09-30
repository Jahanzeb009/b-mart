import { View } from "react-native";
import React from "react";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useTheme } from "@react-navigation/native";
import { Chip, Text } from "react-native-paper";
import { selectionAsync } from "expo-haptics";

const ShowAllCategoriesSheet = (
  props: SheetProps<"show-all-categories-sheet">
) => {
  const { colors } = useTheme();
  const { payload } = props;
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
    >
      <View style={{ padding: 15, gap: 15 }}>
        <Text
          style={{ color: colors.text, fontWeight: "bold" }}
          variant="titleLarge"
        >
          Select Category
        </Text>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {payload?.categories.map((item, i) => {
            return (
              <View key={i}>
                <Chip
                  textStyle={{ textTransform: "capitalize" }}
                  onPress={() => {
                    selectionAsync();
                    payload.onPress(i);
                    SheetManager.hide("show-all-categories-sheet", {
                      payload: item,
                    });
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      payload.selectedCategory?.id === item.id
                        ? colors.primary
                        : colors.background,
                  }}
                  theme={{
                    roundness: 5,
                    colors: {
                      secondaryContainer:
                        payload.selectedCategory?.id === item.id
                          ? colors.primary
                          : colors.card,
                      onSecondaryContainer:
                        payload.selectedCategory?.id === item.id
                          ? "white"
                          : colors.text,
                    },
                  }}
                >
                  {item.key}
                </Chip>
              </View>
            );
          })}
        </View>
      </View>
    </ActionSheet>
  );
};

export default ShowAllCategoriesSheet;
