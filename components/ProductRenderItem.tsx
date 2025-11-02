import { ProductTypes } from "@/src/types";
import { formatCurrency, useDeviceType } from "@/src/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { memo, useEffect } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Card, Divider, HelperText, Text } from "react-native-paper";
import * as Haptics from "expo-haptics";
import CustomImage from "./CustomImage";
import Animated from "react-native-reanimated";
import TextTicker from "react-native-text-ticker";
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
    categories: { key: string; id: string }[];
  }) => {
    let { dark, colors } = useTheme();

    const { height, width } = useWindowDimensions();

    const { currentDevice } = useDeviceType();

    const PADDING = 15;
    const GAP = 0;
    // const IMAGE_SIZE = (width - PADDING * 2 - 10 - 5) / 2;
    const IMAGE_SIZE = width * 0.15;

    // let w = width;
    // let h = w;

    // useEffect(() => {
    //   if (item.product_image) {
    //     Image.getSize(item.product_image, (width, height) => {
    //       // setSize({ width, height });
    //       // console.log({ width, height });
    //       w = width;
    //       h = height;
    //     });
    //   }
    // }, []);
    // const aspectRatio = w / h;
    // const displayWidth = IMAGE_SIZE;
    // const displayHeight = displayWidth / aspectRatio;

    // if (Platform.OS === "web") {
    //   return (
    //     <Card
    //       mode="contained"
    //       theme={{
    //         colors: {
    //           surfaceVariant: colors.card,
    //         },
    //       }}
    //       onLongPress={onLongPress}
    //       onPress={() => {
    //         if (isEditingMode) {
    //           onPress?.(item.id);
    //           return;
    //         }
    //         Haptics.selectionAsync();
    //         router.navigate({
    //           pathname: "/productDetails",
    //           params: {
    //             ...item,
    //             categories: JSON.stringify(categories),
    //             last_updated_at: item.last_updated_at
    //               ?.toDate()
    //               .toLocaleString(),
    //           },
    //         });
    //       }}
    //       style={{ marginTop: 10 }}
    //       contentStyle={{
    //         flexDirection: "row",
    //         borderWidth: 1,
    //         borderRadius: 10,
    //         gap: 10,
    //         borderColor: colors.primary + 50,
    //         overflow: "hidden",
    //       }}
    //     >
    //       <View>
    //         {item.product_image ? (
    //           <CustomImage
    //             width={IMAGE_SIZE}
    //             height={IMAGE_SIZE}
    //             // width={IMAGE_SIZE}
    //             // height={displayHeight}
    //             source={{ uri: item.product_image }}
    //             resizeMode="contain"
    //             // style={{
    //             //   minHeight: IMAGE_SIZE,
    //             //   minWidth: IMAGE_SIZE,
    //             // }}
    //           />
    //         ) : (
    //           <CustomImage
    //             source={require("../assets/images/icon_grey.png")}
    //             width={IMAGE_SIZE}
    //             height={IMAGE_SIZE}
    //             resizeMode="cover"
    //             // style={{ minHeight: IMAGE_SIZE, minWidth: IMAGE_SIZE }}
    //           />
    //         )}
    //       </View>

    //       <View
    //         style={{
    //           flex: 1,
    //           justifyContent: "center",
    //           // backgroundColor: "blue",
    //         }}
    //       >
    //         {/* title */}
    //         <Text
    //           variant="titleMedium"
    //           style={{
    //             // textAlign: "center",
    //             color: colors.text,
    //             fontWeight: "bold",
    //           }}
    //         >
    //           {item.product_name}
    //         </Text>
    //       </View>

    //       <View
    //         style={{
    //           paddingRight: 15,
    //           justifyContent: "center",
    //           alignItems: "center",
    //         }}
    //       >
    //         <Text
    //           variant="bodySmall"
    //           style={{ color: colors.text, textAlign: "center", opacity: 0.8 }}
    //         >
    //           (MRP)
    //         </Text>
    //         <Text
    //           style={{
    //             color: colors.text,
    //             opacity: 0.9,
    //             fontWeight: "bold",
    //             textAlign: "center",
    //           }}
    //           variant="bodyMedium"
    //         >
    //           {formatCurrency(+item.product_mrp)}
    //         </Text>
    //       </View>

    //       {isEditingMode && (
    //         <View
    //           pointerEvents="none"
    //           style={[
    //             StyleSheet.absoluteFillObject,
    //             {
    //               padding: 15,
    //               alignItems: "flex-end",
    //               backgroundColor: dark ? "#0006" : "#fff6",
    //             },
    //           ]}
    //         >
    //           <MaterialCommunityIcons
    //             size={24}
    //             color={colors.text}
    //             name={
    //               isSelected
    //                 ? "checkbox-marked-circle"
    //                 : "checkbox-blank-circle-outline"
    //             }
    //           />
    //         </View>
    //       )}
    //     </Card>
    //   );
    // }

    return (
      <Card
        mode="contained"
        theme={{
          colors: {
            surfaceVariant: colors.card,
          },
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
              categories: JSON.stringify(categories),
              last_updated_at: item.last_updated_at?.toDate().toLocaleString(),
            },
          });
        }}
        style={{
          marginTop: 10,
          flex: 1,
          marginRight: index % 2 === 0 && currentDevice !== "mobile" ? 10 : 0,
        }}
        contentStyle={{
          flexDirection: "row",
          borderWidth: 1,
          borderRadius: 10,
          gap: 10,
          borderColor: colors.primary + 50,
          overflow: "hidden",
        }}
      >
        <Animated.View>
          {item.product_image ? (
            <CustomImage
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              // width={IMAGE_SIZE}
              // height={displayHeight}
              source={{ uri: item.product_image }}
              resizeMode="contain"
              // style={{
              //   minHeight: IMAGE_SIZE,
              //   minWidth: IMAGE_SIZE,
              // }}
            />
          ) : (
            <CustomImage
              source={require("../assets/images/icon_grey.png")}
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              resizeMode="cover"
              // style={{ minHeight: IMAGE_SIZE, minWidth: IMAGE_SIZE }}
            />
          )}
        </Animated.View>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            // backgroundColor: "blue",
          }}
        >
          {/* title */}
          <Text
            variant="titleMedium"
            style={{
              // textAlign: "center",
              color: colors.text,
              fontWeight: "bold",
            }}
          >
            {item.product_name}
          </Text>
          {/* <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <TextTicker
              style={{
                fontSize: 18,
                textAlign: "center",
                color: colors.text,
                fontWeight: "bold",
              }}
              duration={item.product_name.length * 400}
              loop
              bounce
              repeatSpacer={50}
              marqueeDelay={1000}
            >
              {item.product_name}
            </TextTicker>
          </View> */}

          {/* <View
            style={{ flexDirection: "row", justifyContent: "space-evenly" }}
          >
            <Text style={{ color: colors.text, textAlign: "center" }}>
              Invoice
            </Text>

            <Text
              style={{
                color: colors.text,
                fontWeight: "bold",
                textAlign: "center",
              }}
              variant="bodyMedium"
            >
              {formatCurrency(+item.product_invoice)}
            </Text>

            <Divider
              style={{
                height: "100%",
                width: 1,
                backgroundColor: colors.text,
              }}
            />

            <Text style={{ color: colors.text, textAlign: "center" }}>MRP</Text>

            <Text
              style={{
                color: colors.text,
                fontWeight: "bold",
                textAlign: "center",
              }}
              variant="bodyMedium"
            >
              {formatCurrency(+item.product_mrp)}
            </Text>
          </View>
          */}
        </View>

        <View
          style={{
            paddingRight: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            variant="bodySmall"
            style={{ color: colors.text, textAlign: "center", opacity: 0.8 }}
          >
            (MRP)
          </Text>
          <Text
            style={{
              color: colors.text,
              opacity: 0.9,
              fontWeight: "bold",
              textAlign: "center",
            }}
            variant="bodyMedium"
          >
            {formatCurrency(+item.product_mrp)}
          </Text>
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
    );

    // return (
    //   <View
    //     style={{
    //       flex: 1,
    //       marginTop: 5,
    //       padding: 5,
    //     }}
    //   >
    //     <Card
    //       style={{
    //         flex: 1,
    //         borderRadius: 10,
    //         overflow: "hidden",
    //         borderWidth: 1,
    //         borderColor: colors.border,
    //       }}
    //       onLongPress={onLongPress}
    //       onPress={() => {
    //         if (isEditingMode) {
    //           onPress?.(item.id);
    //           return;
    //         }
    //         Haptics.selectionAsync();
    //         router.navigate({
    //           pathname: "/productDetails",
    //           params: {
    //             ...item,
    //             categories: JSON.stringify(categories),
    //             last_updated_at: item.last_updated_at
    //               ?.toDate()
    //               .toLocaleString(),
    //           },
    //         });
    //       }}
    //       mode="contained"
    //       theme={{
    //         colors: {
    //           surfaceVariant: colors.card,
    //         },
    //       }}
    //     >
    //       {item.product_image && (
    //         <CustomImage
    //           width={IMAGE_SIZE}
    //           height={displayHeight}
    //           source={{ uri: item.product_image }}
    //           resizeMode="contain"
    //         />
    //       )}

    //       <Card.Title
    //         title={item.product_name}
    //         titleNumberOfLines={2}
    //         titleStyle={{
    //           textAlign: "center",
    //           color: colors.text,
    //           fontWeight: "bold",
    //           marginVertical: 5,
    //         }}
    //       />

    //       <Divider />
    //       <View
    //         style={{
    //           flexDirection: "row",
    //           paddingBottom: 15,
    //           gap: 5,
    //           paddingHorizontal: 5,
    //         }}
    //       >
    //         {/* invoice */}
    //         <View
    //           style={{
    //             flex: 1,
    //           }}
    //         >
    //           <HelperText
    //             style={{ color: colors.text, textAlign: "center" }}
    //             type="info"
    //           >
    //             Invoice
    //           </HelperText>
    //           <View
    //             style={{
    //               flex: 1,
    //               justifyContent: "center",
    //               alignItems: "center",
    //             }}
    //           >
    //             <Text
    //               style={{
    //                 color: colors.text,
    //                 fontWeight: "bold",
    //                 textAlign: "center",
    //               }}
    //               variant="titleMedium"
    //             >
    //               {formatCurrency(+item.product_invoice)}
    //             </Text>
    //           </View>
    //         </View>
    //         {/* vertical divider */}
    //         <Divider
    //           style={{ height: "100%", width: StyleSheet.hairlineWidth }}
    //         />
    //         {/* mrp */}
    //         <View
    //           style={{
    //             flex: 1,
    //           }}
    //         >
    //           <HelperText
    //             style={{ color: colors.text, textAlign: "center" }}
    //             type="info"
    //           >
    //             MRP
    //           </HelperText>

    //           <View
    //             style={{
    //               flex: 1,
    //               justifyContent: "center",
    //               alignItems: "center",
    //             }}
    //           >
    //             <Text
    //               style={{
    //                 color: colors.text,
    //                 fontWeight: "bold",
    //                 textAlign: "center",
    //               }}
    //               variant="titleMedium"
    //             >
    //               {formatCurrency(+item.product_mrp)}
    //             </Text>
    //           </View>
    //         </View>
    //       </View>
    //       {isEditingMode && (
    //         <View
    //           pointerEvents="none"
    //           style={[
    //             StyleSheet.absoluteFillObject,
    //             {
    //               padding: 15,
    //               alignItems: "flex-end",
    //               backgroundColor: dark ? "#0006" : "#fff6",
    //             },
    //           ]}
    //         >
    //           <MaterialCommunityIcons
    //             size={24}
    //             color={colors.text}
    //             name={
    //               isSelected
    //                 ? "checkbox-marked-circle"
    //                 : "checkbox-blank-circle-outline"
    //             }
    //           />
    //         </View>
    //       )}
    //     </Card>
    //   </View>
    // );
  }
);
