import {
  View,
  useWindowDimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Divider, HelperText } from "react-native-paper";
import { ProductTypes } from "@/src/types";
import { generateImageUrl } from "@/components/GenerateImageUrl";
import { formatCurrency, useDeviceType } from "@/src/utils";
import CustomButton from "@/components/CustomButton";
import { ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { Box } from "@/components/ui/box";
const ProductDetails = () => {
  const { colors } = useTheme();

  const { width } = useWindowDimensions();

  const { currentDevice } = useDeviceType();

  const product = useLocalSearchParams() as unknown as ProductTypes & {
    categories: { key: string; id: string }[];
  };

  const IMAGE_SIZE = width * 0.8;

  const [showAlertDialog, setShowAlertDialog] = React.useState(false);
  const handleClose = () => setShowAlertDialog(false);

  //   if (currentDevice == "mobile") {
  //     return (
  //       <View
  //         style={{
  //           gap: 15,
  //           marginTop: "10%",
  //           paddingHorizontal: "5%",
  //         }}
  //       >

  // <Button onPress={() => setShowAlertDialog(true)}>
  //         <ButtonText>Open Dialog</ButtonText>
  //       </Button>
  //       <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
  //         <AlertDialogBackdrop />
  //         <AlertDialogContent>
  //           <AlertDialogHeader>
  //             <Heading className="text-typography-950 font-semibold" size="md">
  //               Are you sure you want to delete this post?
  //             </Heading>
  //           </AlertDialogHeader>
  //           <AlertDialogBody className="mt-3 mb-4">
  //             <Text size="sm">
  //               Deleting the post will remove it permanently and cannot be undone.
  //               Please confirm if you want to proceed.
  //             </Text>
  //           </AlertDialogBody>
  //           <AlertDialogFooter className="">
  //             <Button
  //               variant="outline"
  //               action="secondary"
  //               onPress={handleClose}
  //               size="sm"
  //             >
  //               <ButtonText>Cancel</ButtonText>
  //             </Button>
  //             <Button size="sm" onPress={handleClose}>
  //               <ButtonText>Delete</ButtonText>
  //             </Button>
  //           </AlertDialogFooter>
  //         </AlertDialogContent>
  //       </AlertDialog>

  //         <View
  //           style={{
  //             flexDirection: "row",
  //             gap: 15,
  //           }}
  //         >
  //           <View>
  //             {product.product_image ? (
  //               <CustomImage
  //                 height={IMAGE_SIZE}
  //                 width={IMAGE_SIZE}
  //                 resizeMode="cover"
  //                 source={{ uri: generateImageUrl(product.product_image) }}
  //               />
  //             ) : (
  //               <CustomImage
  //                 source={require("../assets/images/icon_grey.png")}
  //                 width={IMAGE_SIZE}
  //                 height={IMAGE_SIZE}
  //                 resizeMode="cover"
  //                 style={{ opacity: 0.3 }}
  //               />
  //             )}
  //           </View>

  //           <View style={{}}>
  //             <Text
  //               variant="headlineLarge"
  //               style={{ color: colors.text, fontWeight: "bold" }}
  //             >
  //               {product.product_name}
  //             </Text>

  //             <HelperText type="info" style={{ color: colors.text }}>
  //               {String(product.last_updated_at)}
  //             </HelperText>

  //             {/* category */}
  //             <HelperText
  //               type="info"
  //               style={{
  //                 color: colors.text,
  //                 textTransform: "capitalize",
  //                 backgroundColor: colors.border,
  //                 alignSelf: "flex-start",
  //                 borderRadius: 100,
  //               }}
  //             >
  //               {product.product_category}
  //             </HelperText>

  //             {/* price section */}
  //             <View style={{ flexDirection: "row", gap: 15 }}>
  //               <View
  //                 style={{
  //                   flex: 1,
  //                   justifyContent: "center",
  //                   alignItems: "center",
  //                 }}
  //               >
  //                 <HelperText style={{ color: colors.text }} type="info">
  //                   Invoice
  //                 </HelperText>
  //                 <Text
  //                   style={{ color: colors.text, fontWeight: "bold" }}
  //                   variant="titleMedium"
  //                 >
  //                   {formatCurrency(+product.product_invoice)}
  //                 </Text>
  //               </View>
  //               <Divider
  //                 style={{ height: "100%", width: StyleSheet.hairlineWidth }}
  //               />
  //               <View
  //                 style={{
  //                   flex: 1,
  //                   justifyContent: "center",
  //                   alignItems: "center",
  //                 }}
  //               >
  //                 <HelperText style={{ color: colors.text }} type="info">
  //                   MRP
  //                 </HelperText>
  //                 <Text
  //                   style={{ color: colors.text, fontWeight: "bold" }}
  //                   variant="titleMedium"
  //                 >
  //                   {formatCurrency(+product.product_mrp)}
  //                   {/* <HelperText type="info">Rs</HelperText> */}
  //                 </Text>
  //               </View>
  //             </View>

  //             {!!product.product_extra_info && (
  //               <View style={{ justifyContent: "center", alignItems: "center" }}>
  //                 <HelperText style={{ color: colors.text }} type="info">
  //                   Product Extra Info
  //                 </HelperText>
  //                 <Text
  //                   style={{ color: colors.text, fontWeight: "bold" }}
  //                   variant="titleMedium"
  //                 >
  //                   {product.product_extra_info}
  //                   {/* <HelperText type="info">Rs</HelperText> */}
  //                 </Text>
  //               </View>
  //             )}
  //           </View>
  //         </View>
  //         <View style={{ width: "100%" }}>
  //           <CustomButton
  //             onPress={() => {
  //               selectionAsync();
  //               router.navigate({
  //                 pathname: "/addProduct",
  //                 params: {
  //                   // @ts-ignore
  //                   isEditing: true,
  //                   ...product,
  //                 },
  //               });
  //             }}
  //             mode="contained"
  //             style={{ width: "100%", borderRadius: 5, padding: 5 }}
  //             theme={{
  //               colors: {
  //                 primary: colors.primary,
  //               },
  //             }}
  //           >
  //             Edit Details
  //           </CustomButton>
  //         </View>
  //       </View>
  //     );
  //   }

  return (
    <>
      <Stack.Screen options={{ title: product.product_name }} />
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
              product.product_image
                ? { uri: generateImageUrl(product.product_image) }
                : require("../assets/images/icon_grey.png")
            }
            className={`mb-6 h-[300px] w-[300px] rounded-md`}
            alt="image"
            resizeMode="cover"
            onError={(e) => console.log(e.nativeEvent.error)}
            style={{ width: "100%", aspectRatio: 1, marginBottom: 15 }}
          />

          {/* {product.product_image ? (
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
        )} */}

          <Text size="3xl" style={{ color: colors.text, fontWeight: "bold" }}>
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
                {formatCurrency(+product.product_invoice)}
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
                {formatCurrency(+product.product_mrp)}
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
                size="lg"
              >
                {product.product_extra_info}
              </Text>
            </View>
          )}

          <View style={{ width: "100%" }}>
            <CustomButton
              onPress={() => {
                router.navigate({
                  pathname: "/addProduct",
                  params: {
                    // @ts-ignore
                    isEditing: true,
                    ...product,
                  },
                });
              }}
              style={{ padding: 10, height: "auto" }}
              className="p-[10px]"
            >
              <ButtonText className="color-white">Edit Details</ButtonText>
            </CustomButton>
          </View>
        </Box>
      </ScrollView>
    </>
  );
};

export default ProductDetails;
