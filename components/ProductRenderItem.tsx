import { ProductTypes } from "@/src/types";
import { formatCurrency } from "@/src/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { memo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Avatar,
  Card,
  Divider,
  HelperText,
  Icon,
  IconButton,
  Text,
} from "react-native-paper";
import * as Haptics from "expo-haptics";
import CustomImage from "./CustomImage";

export const ProductRenderItem = memo(
  ({
    item,
    index,
    onLongPress,
    isEditingMode,
    onPress,
    isSelected,
  }: {
    item: ProductTypes;
    index: number;
    isEditingMode: boolean;
    onLongPress: () => void;
    onPress: (id: string) => void;
    isSelected: boolean;
  }) => {
    let { dark, colors } = useTheme();

    const { height, width } = useWindowDimensions();

    const PADDING = 15;
    const GAP = 25;
    const IMAGE_SIZE = (width - PADDING * 2 - GAP) / 2;
    // const IMAGE_SIZE = (width - PADDING * 2) * 0.2;

    // return (
    //   <TouchableOpacity
    //     style={{
    //       flexDirection: "row",
    //       minHeight: IMAGE_SIZE,
    //       alignItems: "center",
    //       backgroundColor: colors.card,
    //       gap: 10,
    //     }}
    //   >
    //     <View style={{}}>
    //       {item.product_image && (
    //         <CustomImage
    //           height={IMAGE_SIZE}
    //           width={IMAGE_SIZE}
    //           source={{ uri: item.product_image }}
    //           resizeMode="cover"

    //         />
    //       )}
    //     </View>
    //     <View>
    //       <Text variant="headlineSmall" style={{ color: colors.text }}>
    //         {item.product_name}
    //       </Text>
    //       <Text variant="titleMedium" style={{ color: colors.text }}>
    //         {formatCurrency(+item.product_invoice)} |{"  "}
    //         {formatCurrency(+item.product_invoice)}
    //       </Text>
    //     </View>
    //   </TouchableOpacity>
    // );

    return (
      <View style={{ flex: 1, marginTop: 5, padding: 5 }}>
        <Card
          style={{
            flex: 1,
            borderRadius: 10,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onLongPress={onLongPress}
          onPress={() => {
            if (isEditingMode) {
              onPress?.(item.id);
              return;
            }
            Haptics.selectionAsync();
            router.navigate({
              pathname: "/productDetails",
              params: {
                ...item,
                last_updated_at: item.last_updated_at
                  ?.toDate()
                  .toLocaleString(),
              },
            });
          }}
          mode="contained"
          theme={{
            colors: {
              surfaceVariant: colors.card,
            },
          }}
        >
          {item.product_image && (
            <CustomImage
              width={IMAGE_SIZE}
              height={IMAGE_SIZE * 0.6}
              source={{ uri: item.product_image }}
              resizeMode="cover"
            />
          )}

          <Card.Title
            title={item.product_name}
            titleNumberOfLines={2}
            titleStyle={{
              textAlign: "center",
              color: colors.text,
              fontWeight: "bold",
            }}
            // style={{ marginVertical: 0 }}
          />

          <Divider />
          <View style={{ flexDirection: "row", paddingBottom: 15 }}>
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
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  variant="titleMedium"
                >
                  {formatCurrency(+item.product_invoice)}
                </Text>
              </View>
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

              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  variant="titleMedium"
                >
                  {formatCurrency(+item.product_mrp)}
                </Text>
              </View>
            </View>
          </View>
          {isEditingMode && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  padding: 15,
                  alignItems: "flex-end",
                  backgroundColor: dark ? "#0006" : "#fff6",
                },
              ]}
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
            </View>
          )}
        </Card>
      </View>
    );
  }
);
