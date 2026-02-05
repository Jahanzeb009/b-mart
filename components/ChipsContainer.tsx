import { ProductCategoryTypes } from "@/src/types";
import { useTheme } from "@react-navigation/native";
import { forwardRef } from "react";
import { FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Chip } from "react-native-paper";

export const ChipsContainer = forwardRef<
  FlatList,
  {
    categories: ProductCategoryTypes[];
    onPress: (item: ProductCategoryTypes) => void;
    selectedCategory: ProductCategoryTypes;
  }
>(({ categories, onPress, selectedCategory }, ref) => {
  const { colors } = useTheme();

  categories = categories.sort((a, b) => {
    if (a.name === "all") return -1;
    if (b.name === "all") return 1;
    return 0;
  });
  return (
    <FlatList
      horizontal
      ref={ref}
      data={categories}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        gap: 10,
        paddingHorizontal: 15,
        // paddingTop: headerHeight + 15,
      }}
      renderItem={({ item, index }) => {
        const isSelected = selectedCategory.id
          ? selectedCategory?.id === item.id
          : selectedCategory?.name === item.name;
        return (
          <RectButton
            style={{
              borderRadius: 100,
            }}
            onPress={() => onPress(item)}
          >
            <Chip
              textStyle={{ textTransform: "capitalize" }}
              style={{
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
              theme={{
                roundness: 5,
                colors: {
                  secondaryContainer: isSelected ? colors.primary : colors.card,
                  onSecondaryContainer: isSelected ? "white" : colors.text,
                },
              }}
            >
              {item.name}
            </Chip>
          </RectButton>
        );
      }}
    />
  );
});
