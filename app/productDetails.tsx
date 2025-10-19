import {
  View,
  Image,
  useWindowDimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Divider, HelperText, Text } from "react-native-paper";
import { ProductTypes } from "@/src/types";
import CustomImage from "@/components/CustomImage";
import { generateImageUrl } from "@/components/GenerateImageUrl";
import { selectionAsync } from "expo-haptics";
import { formatCurrency } from "@/src/utils";
import CustomButton from "@/components/CustomButton";

const ProductDetails = () => {
  const { colors } = useTheme();

  const { width } = useWindowDimensions();

  const product = useLocalSearchParams() as unknown as ProductTypes & {
    categories: { key: string; id: string }[];
  };

  const IMAGE_SIZE = width * 0.8;

  return (
    <>
      <Stack.Screen options={{ title: product.product_name }} />
      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.background,
          alignItems: "center",
          gap: 15,
          padding: 15,
          paddingTop: "15%",
        }}
      >
        {product.product_image ? (
          <CustomImage
            height={IMAGE_SIZE}
            width={IMAGE_SIZE}
            resizeMode="cover"
            source={{ uri: generateImageUrl(product.product_image) }}
          />
        ) : (
          <CustomImage
            source={require("../assets/images/icon_grey.png")}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            resizeMode="cover"
            style={{ opacity: 0.3 }}
          />
        )}

        <Text
          variant="bodyLarge"
          style={{ color: colors.text, fontWeight: "bold" }}
        >
          {product.product_name}
        </Text>

        <HelperText type="info" style={{ color: colors.text }}>
          {String(product.last_updated_at)}
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
          {product.product_category}
        </HelperText>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <HelperText style={{ color: colors.text }} type="info">
              Invoice
            </HelperText>
            <Text
              style={{ color: colors.text, fontWeight: "bold" }}
              variant="titleMedium"
            >
              {formatCurrency(+product.product_invoice)}
              {/* <HelperText type="info">Rs</HelperText> */}
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
            <HelperText style={{ color: colors.text }} type="info">
              MRP
            </HelperText>
            <Text
              style={{ color: colors.text, fontWeight: "bold" }}
              variant="titleMedium"
            >
              {formatCurrency(+product.product_mrp)}
              {/* <HelperText type="info">Rs</HelperText> */}
            </Text>
          </View>
        </View>

        {!!product.product_extra_info && (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <HelperText style={{ color: colors.text }} type="info">
              Product Extra Info
            </HelperText>
            <Text
              style={{ color: colors.text, fontWeight: "bold" }}
              variant="titleMedium"
            >
              {product.product_extra_info}
              {/* <HelperText type="info">Rs</HelperText> */}
            </Text>
          </View>
        )}

        <View style={{ width: "100%" }}>
          <CustomButton
            onPress={() => {
              selectionAsync();
              router.navigate({
                pathname: "/addProduct",
                params: {
                  // @ts-ignore
                  isEditing: true,
                  ...product,
                },
              });
            }}
            mode="contained"
            style={{ width: "100%", borderRadius: 5, padding: 5 }}
            theme={{
              colors: {
                primary: colors.primary,
              },
            }}
          >
            Edit Details
          </CustomButton>
        </View>
      </ScrollView>
    </>
  );
};

export default ProductDetails;
