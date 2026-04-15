import { ProductCategoryTypes } from "@/src/types";
import { useTheme } from "@react-navigation/native";
import { forwardRef, useMemo } from "react";
import { FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Text } from "./ui/text";
import { Box } from "./ui/box";

const ALL_CATEGORY: ProductCategoryTypes = { id: "", name: "all" };

export const ChipsContainer = forwardRef<
  FlatList,
  {
    categories: ProductCategoryTypes[];
    onPress: (item: ProductCategoryTypes) => void;
    selectedCategory: ProductCategoryTypes;
    productCounts?: Record<string, number>;
  }
>(({ categories, onPress, selectedCategory, productCounts }, ref) => {
  const { dark, colors } = useTheme();

  const sortedCategories = useMemo(() => {
    const filtered = categories.filter((c) => c.name !== "all");
    return [ALL_CATEGORY, ...filtered];
  }, [categories]);

  return (
    <FlatList
      horizontal
      ref={ref}
      data={sortedCategories}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id || "all"}
      contentContainerStyle={{
        gap: 8,
        paddingHorizontal: 15,
        paddingVertical: 4,
      }}
      renderItem={({ item }) => {
        const isSelected =
          item.name === "all"
            ? !selectedCategory.id && selectedCategory.name === "all"
            : selectedCategory?.id === item.id;

        return (
          <RectButton
            style={{ borderRadius: 100 }}
            onPress={() => onPress(item)}
          >
            <Box
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: isSelected
                  ? colors.primary
                  : dark
                    ? "#2c2c2e"
                    : "#e5e5ea",
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : "transparent",
              }}
            >
              <Text
                className="text-sm font-medium capitalize"
                style={{
                  color: isSelected ? "#fff" : colors.text,
                }}
              >
                {item.name}
              </Text>
            </Box>
          </RectButton>
        );
      }}
    />
  );
});
