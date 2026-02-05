import { ProductCategoryTypes, ProductTypes } from "@/src/types";
import { formatCurrency, useDeviceType } from "@/src/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { memo, useEffect } from "react";
import { Platform, useWindowDimensions, Image as RNImage } from "react-native";
import * as Haptics from "expo-haptics";
import { useMediaQuery } from "@gluestack-ui/utils/hooks";
import { Image } from "./ui/image";
import { Text } from "./ui/text";
import { Heading } from "./ui/heading";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Pressable } from "./ui/pressable";
import { Box } from "./ui/box";

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
    let { dark, colors } = useTheme();

    const { height, width } = useWindowDimensions();

    let w = width;
    let h = w;

    useEffect(() => {
      if (!item.image) return;
      RNImage.getSize(item.image, (width, height) => {
        w = width;
        h = height;
      });
    }, [item.image]);

    const aspectRatio = w / h;
    const displayWidth = width * 0.4;
    const displayHeight = displayWidth / aspectRatio;

    return (
      <VStack
        className={
          "android:w-full ios:w-full overflow-hidden lg:w-1/5 md:w-1/4 sm:w-1/3 w-1/2 rounded-none gap-1"
        }
      >
        <Card
          variant="filled"
          key={index}
          className={`p-0 m-2`}
          style={{ borderWidth: 2, borderColor: "#fff2" }}
        >
          <Pressable
            onLongPress={onLongPress}
            onPress={() => {
              if (isEditingMode) {
                onPress?.(item.id);
                return;
              }
              Haptics.selectionAsync();
              router.navigate({
                pathname: "/productDetails",
                // @ts-ignore
                params: {
                  ...item,
                  ...(item.extra_attachments
                    ? {
                        extra_attachments: JSON.stringify(
                          item.extra_attachments,
                        ),
                      }
                    : {}),
                  categories: JSON.stringify(categories),
                  updated_at: item.updated_at,
                },
              });
            }}
          >
            {(!!item.image || Platform.OS === "web") && (
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require("../assets/images/icon_grey.png")
                }
                className={`mb-[10px] h-[150px] sm:h-[250px] overflow-hidden w-full rounded-none`}
                alt="image"
                resizeMode="cover"
                onError={(e) =>
                  console.log("image error -> ", e?.nativeEvent?.error)
                }
                style={{
                  width: "100%",
                  overflow: "hidden",
                  height: displayHeight,
                }}
              />
            )}
            <Box className="p-2 gap-2">
              <Heading size="md" className="mb-2">
                {item.name}
              </Heading>

              <HStack className="justify-evenly gap-1">
                <VStack className="justify-between flex items-center w-1/2 align-middle gap-1">
                  <Text className="text-sm font-normal mb-2 text-typography-700">
                    Invoice
                  </Text>
                  <Text className="text-xl font-normal mb-2 text-typography-700">
                    {formatCurrency(+item.invoice)}
                  </Text>
                </VStack>
                <VStack className="justify-between gap-1 items-center w-1/2">
                  <Text className="text-sm font-normal mb-2 text-typography-700">
                    MRP
                  </Text>
                  <Text className="text-xl font-normal mb-2 text-typography-700">
                    {formatCurrency(+item.mrp)}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {isEditingMode && (
              <Box
                pointerEvents="none"
                className="absolute top-0 right-0 bottom-0 left-0 items-end"
                style={{
                  backgroundColor: dark ? "#0006" : "#fff6",
                }}
                // ]}
              >
                <MaterialCommunityIcons
                  size={24}
                  color={colors.text}
                  name={
                    isSelected
                      ? "checkbox-marked-circle"
                      : "checkbox-blank-circle-outline"
                  }
                />
              </Box>
            )}
          </Pressable>
        </Card>
      </VStack>
    );
  },
);
