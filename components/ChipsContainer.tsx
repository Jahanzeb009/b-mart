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

  return (
    <FlatList
      horizontal
      ref={ref}
      data={[{ key: "all", id: "all" }, ...categories]}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        gap: 10,
        paddingHorizontal: 15,
        // paddingTop: headerHeight + 15,
      }}
      renderItem={({ item, index }) => {
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
                borderColor:
                  selectedCategory?.id === item.id
                    ? colors.primary
                    : colors.border,
              }}
              // theme={{ colors: { primary: colors.primary } }}
              // selectedColor=""
              theme={{
                roundness: 5,
                colors: {
                  secondaryContainer:
                    selectedCategory?.id === item.id
                      ? colors.primary
                      : colors.card,
                  onSecondaryContainer:
                    selectedCategory?.id === item.id ? "white" : colors.text,
                },
              }}
            >
              {item.key}
            </Chip>
          </RectButton>
        );
      }}
    />
  );
});
