import { View, Image, useWindowDimensions, StyleSheet } from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Button, Divider, HelperText, Text } from "react-native-paper";
import { ProductTypes } from "@/src/types";
import CustomImage from "@/components/CustomImage";
import { generateImageUrl } from "@/components/GenerateImageUrl";
import { selectionAsync } from "expo-haptics";
import { formatCurrency } from "@/src/utils";

const ProductDetails = () => {
  const { colors } = useTheme();

  const { width } = useWindowDimensions();

  const product = useLocalSearchParams() as unknown as ProductTypes;

  return (
    <View
      style={{
        backgroundColor: colors.background,
        flex: 1,
        alignItems: "center",
        gap: 15,
        padding: 15,
        paddingTop: "15%",
      }}
    >
      <Stack.Screen
        options={{
          title: product.product_name,
        }}
      />

      <CustomImage
        height={width * 0.8}
        width={width * 0.8}
        resizeMode="cover"
        source={{ uri: generateImageUrl(product.product_image) }}
      />

      <Text
        variant="bodyLarge"
        style={{ color: colors.text, fontWeight: "bold" }}
      >
        {product.product_name}
      </Text>

      <HelperText type="info" style={{ color: colors.text }}>
        {String(product.last_updated_at)}
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
        <Divider style={{ height: "100%", width: StyleSheet.hairlineWidth }} />
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

      <Button
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
      </Button>
    </View>
  );
};

export default ProductDetails;
