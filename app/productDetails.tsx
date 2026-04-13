import {
  View,
  useWindowDimensions,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Divider, HelperText } from "react-native-paper";
import { ProductCategoryTypes, ProductTypes } from "@/src/types";
import { formatCurrency, useDeviceType } from "@/src/utils";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { Box } from "@/components/ui/box";
import { SquarePen } from "lucide-react-native";
import { SheetManager } from "react-native-actions-sheet";
const ProductDetails = () => {
  const { colors } = useTheme();

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

  const updatedAt = new Date(product.updated_at!).toLocaleString();

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerRight: () => {
            return (
              <View
                style={{ flexDirection: "row", gap: 10, paddingHorizontal: 5 }}
              >
                <Pressable
                  onPress={() => {
                    router.navigate({
                      pathname: "/addProduct",
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
                >
                  <SquarePen color={colors.text} size={24} />
                </Pressable>
              </View>
            );
          },
        }}
      />
      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.background,
          flexGrow: 1,
          padding: 15,
        }}
      >
        <Box className="flex items-center gap-3 sm:self-center sm:w-[500px] mt-10">
          <Image
            source={
              product.image
                ? { uri: product.image }
                : require("../assets/images/icon_grey.png")
            }
            className={`mb-6 h-[250px] w-[300px] rounded-lg overflow-hidden`}
            alt="image"
            resizeMode="cover"
            onError={(e) => console.log(e.nativeEvent.error)}
            style={{
              width: "100%",
              aspectRatio: 1.5,
              marginBottom: 15,
              borderRadius: 10,
            }}
          />

          <Text size="3xl" style={{ color: colors.text, fontWeight: "bold" }}>
            {product.name}
          </Text>

          <HelperText type="info" style={{ color: colors.text }}>
            {updatedAt}
          </HelperText>
          <HelperText
            type="info"
            style={{
              color: colors.text,
              textTransform: "capitalize",
              backgroundColor: colors.border,
              borderRadius: 100,
            }}
          >
            {currentCategory.name}
          </HelperText>

          <View style={{ flexDirection: "row", gap: 15 }}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }} size="md">
                Invoice
              </Text>
              <Text
                style={{ color: colors.text, fontWeight: "bold" }}
                size="2xl"
              >
                {formatCurrency(+product.invoice)}
              </Text>
            </View>
            <Divider
              style={{ height: "100%", width: StyleSheet.hairlineWidth }}
            />
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }} size="md">
                MRP
              </Text>
              <Text
                style={{ color: colors.text, fontWeight: "bold" }}
                size="2xl"
              >
                {formatCurrency(+product.mrp)}
              </Text>
            </View>
          </View>

          {!!product.extra_info && (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <HelperText style={{ color: colors.text }} type="info">
                Product Extra Info
              </HelperText>
              <Text
                style={{ color: colors.text, fontWeight: "bold" }}
                size="lg"
              >
                {product.extra_info}
              </Text>
            </View>
          )}

          {!!extra_attachments?.length && (
            <Text
              size="lg"
              className="w-full"
              style={{ color: colors.text, fontWeight: "bold" }}
            >
              Extra Attachments
            </Text>
          )}

          <Box className="flex-row flex-wrap w-full">
            {extra_attachments?.map((item, index) => (
              <Pressable
                onPress={() => {
                  SheetManager.show("image-view-sheet", {
                    payload: {
                      image: item?.image,
                    },
                  });
                }}
                key={index}
                className="w-1/4 p-1 "
              >
                <Box className="rounded-xl overflow-hidden aspect-square justify-center items-center">
                  <Image
                    source={{
                      uri: item?.image,
                    }}
                    style={{ minWidth: 100, height: "100%" }}
                    resizeMode="cover"
                    alt="image"
                  />
                </Box>
              </Pressable>
            ))}
          </Box>
        </Box>
      </ScrollView>
    </>
  );
};

export default ProductDetails;
