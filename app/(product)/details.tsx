import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { ProductCategoryTypes, ProductTypes } from "@types";
import { formatCurrency } from "@utils";
import { Text } from "@components/ui/text";
import { Image } from "@components/ui/image";
import { Box } from "@components/ui/box";
import { Heading } from "@components/ui/heading";
import { HStack } from "@components/ui/hstack";
import { VStack } from "@components/ui/vstack";
import { SquarePen, TrendingUp } from "lucide-react-native";
import { SheetManager } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProductDetails = () => {
  const { colors, dark } = useTheme();

  const inset = useSafeAreaInsets();

  const product = useLocalSearchParams() as unknown as ProductTypes & {
    categories: string | ProductCategoryTypes[];
  };

  const currentCategory =
    typeof product.categories === "string"
      ? JSON.parse(product.categories)?.find(
          // @ts-ignore
          (_) => _.id === product.category_id,
        )
      : product.categories;

  const extra_attachments: ProductTypes["extra_attachments"] =
    typeof product?.extra_attachments === "string"
      ? JSON.parse(product?.extra_attachments)
      : product?.extra_attachments;

  const updatedAt = new Date(product.updated_at!).toLocaleDateString();

  const invoice = +product.invoice;
  const mrp = +product.mrp;
  const margin = mrp - invoice;
  const marginPercent =
    invoice > 0 ? Math.round(((mrp - invoice) / invoice) * 100) : 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight() {
            return (
              <Pressable
                onPress={() => {
                  router.navigate({
                    pathname: "/(product)/add",
                    params: {
                      // @ts-ignore
                      isEditing: true,
                      ...product,
                      ...(product.extra_attachments
                        ? {
                            extra_attachments: JSON.stringify(
                              product.extra_attachments,
                            ),
                          }
                        : {}),
                    },
                  });
                }}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 5,
                  marginRight: Platform.OS === "web" ? 20 : 5,
                }}
              >
                <SquarePen color={colors.text} size={24} />
              </Pressable>
            );
          },
        }}
      />

      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.background,
          flexGrow: 1,
          paddingBottom: inset.bottom + 15,
        }}
      >
        <Box className="sm:self-center sm:w-[500px]">
          {/* Hero image */}
          <Image
            source={
              product.image
                ? { uri: product.image }
                : require("../../assets/images/icon_grey.png")
            }
            alt="image"
            resizeMode="cover"
            onError={(e) => console.log(e.nativeEvent.error)}
            className="w-full h-[400px]"
            style={{ height: 300 }}
          />

          {/* Content */}
          <Box
            className="p-5 gap-5 -mt-4 rounded-t-3xl"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header row */}
            <Box className="gap-2">
              <HStack className="items-center gap-2">
                {currentCategory && (
                  <Box
                    className="rounded-full px-3 py-1"
                    style={{
                      backgroundColor: dark ? "#2c2c2e" : "#e5e5ea",
                    }}
                  >
                    <Text
                      className="text-xs capitalize font-medium"
                      style={{ color: colors.text }}
                    >
                      {currentCategory.name}
                    </Text>
                  </Box>
                )}
                <Text className="text-xs" style={{ color: colors.text + "50" }}>
                  {updatedAt}
                </Text>
              </HStack>

              <Heading size="2xl" style={{ color: colors.text }}>
                {product.name}
              </Heading>
            </Box>

            {/* Price cards */}
            <HStack className="gap-3">
              <Box
                className="flex-1 rounded-2xl p-4 items-center gap-1"
                style={{ backgroundColor: colors.card }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.text + "60" }}
                >
                  Invoice
                </Text>
                <Heading size="xl" style={{ color: colors.text }}>
                  {formatCurrency(invoice)}
                </Heading>
              </Box>

              <Box
                className="flex-1 rounded-2xl p-4 items-center gap-1"
                style={{ backgroundColor: colors.card }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.text + "60" }}
                >
                  MRP
                </Text>
                <Heading size="xl" style={{ color: colors.text }}>
                  {formatCurrency(mrp)}
                </Heading>
              </Box>
            </HStack>

            {/* Profit card */}
            {margin > 0 && (
              <Box
                className="rounded-2xl p-4 flex-row items-center justify-between"
                style={{
                  backgroundColor: dark ? "#22c55e15" : "#22c55e0c",
                  borderWidth: 1,
                  borderColor: "#22c55e30",
                }}
              >
                <HStack className="items-center gap-2">
                  <TrendingUp color="#22c55e" size={20} />
                  <Text
                    className="text-sm font-medium"
                    style={{ color: "#22c55e" }}
                  >
                    Profit per unit
                  </Text>
                </HStack>
                <HStack className="items-center gap-2">
                  <Heading size="lg" style={{ color: "#22c55e" }}>
                    {formatCurrency(margin)}
                  </Heading>
                  <Box
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: "#22c55e" }}
                    >
                      +{marginPercent}%
                    </Text>
                  </Box>
                </HStack>
              </Box>
            )}

            {/* Extra info */}
            {!!product.extra_info && (
              <Box
                className="rounded-2xl p-4 gap-1"
                style={{ backgroundColor: colors.card }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.text + "60" }}
                >
                  Notes
                </Text>
                <Text className="text-base" style={{ color: colors.text }}>
                  {product.extra_info}
                </Text>
              </Box>
            )}

            {/* Extra attachments */}
            {!!extra_attachments?.length && (
              <Box className="gap-3">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.text + "80" }}
                >
                  Attachments ({extra_attachments.length})
                </Text>
                <Box className="flex-row flex-wrap">
                  {extra_attachments.map((item, index) => (
                    <Pressable
                      key={index}
                      className="p-1 w-1/3 "
                      onPress={() => {
                        SheetManager.show("image-view-sheet", {
                          payload: {
                            image: item?.image,
                          },
                        });
                      }}
                    >
                      <Image
                        source={{ uri: item?.image }}
                        className="w-full h-[150px] rounded-lg "
                        style={{
                          // width: "33%",
                          aspectRatio: 1,
                          borderRadius: 12,
                        }}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </ScrollView>
    </>
  );
};

export default ProductDetails;
