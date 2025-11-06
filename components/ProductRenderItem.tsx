import { ProductTypes } from "@/src/types";
import { formatCurrency, useDeviceType } from "@/src/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { memo, useEffect } from "react";
import {
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  Image as RNImage,
} from "react-native";
import * as Haptics from "expo-haptics";
import CustomImage from "./CustomImage";
import Animated from "react-native-reanimated";
import TextTicker from "react-native-text-ticker";
import { useMediaQuery } from "@gluestack-ui/utils/hooks";
import { Image } from "./ui/image";
import { Text } from "./ui/text";
import { Heading } from "./ui/heading";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import FastImage from "@d11/react-native-fast-image";
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
    categories: { key: string; id: string }[];
  }) => {
    let { dark, colors } = useTheme();

    const { height, width } = useWindowDimensions();

    const { currentDevice } = useDeviceType();

    const PADDING = 15;
    const GAP = 0;
    // const IMAGE_SIZE = (width - PADDING * 2 - 10 - 5) / 2;
    const IMAGE_SIZE = width * 0.15;

    const [isMobile, isTablet, isSmallScreen, isLargeScreen] = useMediaQuery([
      {
        maxWidth: 480,
      },
      // {
      //   minWidth: 481,
      //   maxWidth: 768,
      // },
      // {
      //   minWidth: 769,
      //   maxWidth: 1440,
      // },
      // {
      //   minWidth: 1441,
      // },
    ]);

    // const { height, width } = useWindowDimensions();
    let w = width;
    let h = w;

    useEffect(() => {
      if (!item.product_image) return;
      RNImage.getSize(item.product_image, (width, height) => {
        // setSize({ width, height });
        // console.log({ width, height });
        w = width;
        h = height;
      });
    }, [item.product_image]);

    const aspectRatio = w / h;
    const displayWidth = width * 0.4;
    const displayHeight = displayWidth / aspectRatio;

    return (
      <VStack
        className={
          Platform.OS === "web"
            ? "lg:w-1/5 md:w-1/4 sm:w-1/3 w-1/2 rounded-lg gap-1"
            : "w-full rounded-lg gap-1"
        }
      >
        <Card variant="filled" key={index} className={`p-0 m-2`} style={{borderWidth:2,borderColor:'#fff2'}}>
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
                params: {
                  ...item,
                  categories: JSON.stringify(categories),
                  last_updated_at: item.last_updated_at
                    ?.toDate()
                    .toLocaleString(),
                },
              });
            }}
          >
            {(!!item.product_image || Platform.OS === "web") && (
              <Image
                source={
                  item.product_image
                    ? { uri: item.product_image }
                    : require("../assets/images/icon_grey.png")
                }
                className={`mb-[10px] h-[150px] sm:h-[300px] w-full rounded-md`}
                alt="image"
                resizeMode="cover"
                onError={(e) => console.log(e?.nativeEvent?.error)}
                style={{
                  width: "100%",
                  // height: 150,
                  height: displayHeight,
                  // marginBottom: 10,
                  borderRadius: 10,
                }}
              />
            )}
            <Box className="p-2">
              <Heading size="md" className="mb-2">
                {item.product_name}
              </Heading>

              <HStack className="justify-between">
                <VStack className="justify-between align-middle gap-1">
                  <Text className="text-sm font-normal mb-2 text-typography-700">
                    Invoice
                  </Text>
                  <Text className="text-xl font-normal mb-2 text-typography-700">
                    {formatCurrency(+item.product_invoice)}
                  </Text>
                </VStack>
                <VStack className="justify-between gap-1">
                  <Text className="text-sm font-normal mb-2 text-typography-700">
                    MRP
                  </Text>
                  <Text className="text-xl font-normal mb-2 text-typography-700">
                    {formatCurrency(+item.product_mrp)}
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
