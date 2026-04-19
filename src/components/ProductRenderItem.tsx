import { ProductCategoryTypes, ProductTypes } from "@types";
import { formatCurrency } from "@utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Image } from "./ui/image";
import { Text } from "./ui/text";
import { Heading } from "./ui/heading";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Pressable } from "./ui/pressable";
import { Box } from "./ui/box";

const getMarginPercent = (invoice: number, mrp: number) => {
  if (!invoice || !mrp || invoice <= 0) return 0;
  return Math.round(((mrp - invoice) / invoice) * 100);
};

export const ProductRenderItem = memo(
  ({
    item,
    index,
    onLongPress,
    isEditingMode,
    onPress,
    isSelected,
    categories,
  }: {
    item: ProductTypes;
    index: number;
    isEditingMode: boolean;
    onLongPress: () => void;
    onPress: (id: string) => void;
    isSelected: boolean;
    categories: ProductCategoryTypes[];
  }) => {
    const { dark, colors } = useTheme();

    const invoice = +item.invoice;
    const mrp = +item.mrp;
    const margin = Math.abs(mrp - invoice);
    const marginPercent = getMarginPercent(invoice, mrp);
    const category = categories.find((c) => c.id === item.category_id);

    const handlePress = useCallback(() => {
      if (isEditingMode) {
        onPress?.(item.id);
        return;
      }
      Haptics.selectionAsync();
      router.navigate({
        pathname: "/(product)/details",
        // @ts-ignore
        params: {
          ...item,
          ...(item.extra_attachments
            ? { extra_attachments: JSON.stringify(item.extra_attachments) }
            : {}),
          categories: JSON.stringify(categories),
          updated_at: item.updated_at,
        },
      });
    }, [isEditingMode, item, categories, onPress]);

    return (
      <VStack className="android:w-full ios:w-full overflow-hidden lg:w-1/5 md:w-1/4 sm:w-1/3 w-1/2">
        <Card
          variant="filled"
          key={index}
          className="p-0 m-[5px] overflow-hidden rounded-xl"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Pressable onLongPress={onLongPress} onPress={handlePress}>
            {/* Image with overlays */}
            <Box className="relative">
              <Image
                source={
                  item.image
                    ? { uri: item.image } //getOptimizedImageUrl(item.image, 10) }
                    : require("../../assets/images/icon_grey.png")
                }
                className="w-full"
                alt="image"
                resizeMode="cover"
                onError={(e) =>
                  console.log("image error -> ", e?.nativeEvent?.error)
                }
                style={{ width: "100%", aspectRatio: 1 }}
              />

              {/* Margin badge */}
              {marginPercent > 0 && (
                <Box
                  className="absolute top-2 right-2 rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor:
                      marginPercent >= 10
                        ? "#16a34a"
                        : marginPercent >= 5
                          ? "#ca8a04"
                          : "#ea580c",
                  }}
                >
                  <Text className="text-xs font-bold" style={{ color: "#fff" }}>
                    +{marginPercent}%
                  </Text>
                </Box>
              )}

              {/* Category pill */}
              {category && (
                <Box
                  className="absolute bottom-2 left-2 rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: dark ? "#000b" : "#fffb" }}
                >
                  <Text
                    className="text-[10px] capitalize font-medium"
                    style={{ color: colors.text }}
                  >
                    {category.name}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Info */}
            <Box className="p-3 gap-2">
              <Heading
                size="sm"
                style={{ color: colors.text }}
                numberOfLines={1}
              >
                {item.name}
              </Heading>

              <HStack className="justify-between items-center">
                <VStack>
                  <Text
                    className="text-[10px]"
                    style={{ color: colors.text + "70" }}
                  >
                    Invoice
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {formatCurrency(invoice)}
                  </Text>
                </VStack>

                <Box
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: colors.border,
                  }}
                />

                <VStack className="items-end">
                  <Text
                    className="text-[10px]"
                    style={{ color: colors.text + "70" }}
                  >
                    MRP
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {formatCurrency(mrp)}
                  </Text>
                </VStack>
              </HStack>

              {/* Profit row */}
              {margin > 0 && (
                <Box
                  className="rounded-lg px-2 py-1.5 border"
                  style={{
                    borderColor: "#22c55e",
                    backgroundColor: "#22c55e30",
                  }}
                >
                  <Text
                    className="text-xs text-center font-semibold"
                    style={{ color: "#22c55e" }}
                  >
                    Profit: {formatCurrency(margin)}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Selection overlay */}
            {isEditingMode && (
              <Box
                pointerEvents="none"
                className="absolute top-0 right-0 bottom-0 left-0 p-2.5 items-end"
                style={{
                  backgroundColor: isSelected
                    ? dark
                      ? "#409cff25"
                      : "#007aff18"
                    : dark
                      ? "#0008"
                      : "#fff8",
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: colors.primary,
                  borderRadius: 12,
                }}
              >
                <Box
                  className="rounded-full items-center justify-center"
                  style={{
                    width: 26,
                    height: 26,
                    backgroundColor: isSelected
                      ? colors.primary
                      : dark
                        ? "#0008"
                        : "#fff8",
                    borderWidth: isSelected ? 0 : 2,
                    borderColor: isSelected
                      ? "transparent"
                      : colors.text + "50",
                  }}
                >
                  {isSelected && (
                    <MaterialCommunityIcons
                      size={16}
                      color="#fff"
                      name="check"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Pressable>
        </Card>
      </VStack>
    );
  },
);
