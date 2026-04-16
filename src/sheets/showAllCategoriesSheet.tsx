import React from "react";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useTheme } from "@react-navigation/native";
import { Chip } from "react-native-paper";
import { selectionAsync } from "expo-haptics";
import { Text } from "@components/ui/text";
import { Box } from "@components/ui/box";

const ShowAllCategoriesSheet = (
  props: SheetProps<"show-all-categories-sheet">
) => {
  const { colors } = useTheme();
  const { payload } = props;

  return (
    <ActionSheet
      gestureEnabled
      id={props.sheetId}
      statusBarTranslucent
      containerStyle={{
        backgroundColor: colors.border,
        paddingTop: 15,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
      }}
      indicatorStyle={{ backgroundColor: colors.card }}
    >
      <Box className="p-5 gap-5">
        <Text style={{ color: colors.text, fontWeight: "bold" }} size="2xl">
          Select Category
        </Text>

        <Box className="flex-row gap-4 flex-wrap">
          {payload?.categories.map((item, i) => {
            const isSelectedChip = payload.selectedCategory?.id === item.id;
            return (
              <Box key={i}>
                <Chip
                  textStyle={{ textTransform: "capitalize" }}
                  onPress={() => {
                    payload.onPress(i);
                    selectionAsync();
                    SheetManager.hide("show-all-categories-sheet", {
                      payload: item,
                    });
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelectedChip
                      ? colors.primary
                      : colors.background,
                  }}
                  theme={{
                    roundness: 5,
                    colors: {
                      secondaryContainer: isSelectedChip
                        ? colors.primary
                        : colors.card,
                      onSecondaryContainer: isSelectedChip
                        ? "white"
                        : colors.text,
                    },
                  }}
                >
                  {item.name}
                </Chip>
              </Box>
            );
          })}
        </Box>
      </Box>
    </ActionSheet>
  );
};

export default ShowAllCategoriesSheet;
