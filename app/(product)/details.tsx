import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Button,
} from "react-native";
import React, { useRef, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { ProductCategoryTypes, ProductTypes } from "@types";
import { formatCurrency } from "@utils";
import { Text } from "@components/ui/text";
import { Box } from "@components/ui/box";
import { Heading } from "@components/ui/heading";
import { HStack } from "@components/ui/hstack";
import { SquarePen, TrendingUp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurTargetView } from "expo-blur";
import CustomImage from "@/src/components/CustomImage";
import ImageViewer, { ImageViewerSource } from "@/src/components/ImageViewer";
import { LinearGradient } from "expo-linear-gradient";
import { useHeaderHeight } from "@react-navigation/elements";
import { measure } from "react-native-reanimated";

const ProductDetails = () => {
  const { colors, dark } = useTheme();

  const inset = useSafeAreaInsets();
  const blurTargetRef = useRef<View | null>(null);
  const [viewerSource, setViewerSource] = useState<ImageViewerSource | null>(
    null,
  );

  const product = useLocalSearchParams() as unknown as ProductTypes & {
    categories: string | ProductCategoryTypes[];
  };

  const openViewer = (
    image: string | undefined,
    m: ReturnType<typeof measure>,
  ) => {
    if (!image || !m) return;
    setViewerSource({
      image,
      pageX: m.pageX,
      pageY: m.pageY,
      width: m.width,
      height: m.height,
    });
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

  const headerHeight = useHeaderHeight();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: !viewerSource,
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

      <View style={{ flex: 1 }}>
        <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              backgroundColor: colors.background,
              flexGrow: 1,
              paddingBottom: inset.bottom + 15,
            }}
          >
            <Box className="sm:self-center sm:w-[500px]">
              {/* Hero image */}
              <View style={{ flex: 1 }}>
                {Platform.OS === "android" && (
                  <LinearGradient
                    // Background Linear Gradient
                    colors={[
                      "rgba(0,0,0,1)",
                      "rgba(0,0,0,0.6)",
                      "rgba(0,0,0,0.3)",
                      "rgba(0,0,0,0)",
                    ]}
                    locations={[0, 0.3, 0.7, 1]}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: headerHeight,
                      zIndex: 999,
                    }}
                  />
                )}
                <CustomImage
                  source={
                    product.image
                      ? { uri: product.image }
                      : require("../../assets/images/icon_grey.png")
                  }
                  resizeMode="cover"
                  onPress={(m) => openViewer(product?.image, m)}
                  style={{ height: 400, borderRadius: 0 }}
                />
              </View>
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
                    <Text
                      className="text-xs"
                      style={{ color: colors.text + "50" }}
                    >
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
                    <Box className="flex-row flex-wrap -m-1">
                      {extra_attachments.map((item, index) => (
                        <Box key={index} className="w-1/3 p-1">
                          <CustomImage
                            source={{ uri: item?.image }}
                            onPress={(m) => openViewer(item?.image, m)}
                            style={{
                              width: "100%",
                              aspectRatio: 1,
                              borderRadius: 12,
                            }}
                            resizeMode="cover"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </ScrollView>
        </BlurTargetView>
        <ImageViewer
          source={viewerSource}
          onClose={() => setViewerSource(null)}
          blurTarget={blurTargetRef}
        />
      </View>
    </>
  );
};

export default ProductDetails;
