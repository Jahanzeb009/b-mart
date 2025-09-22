import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getDownloadURL,
  putFile,
  ref,
  uploadBytes,
} from "@react-native-firebase/storage";
import { Button, TextInput } from "react-native-paper";
import { addCategory, saveProduct, updateProduct } from "@/src/network";
import { getApp } from "@react-native-firebase/app";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDocsFromServer,
  getFirestore,
  Timestamp,
} from "@react-native-firebase/firestore";
import { ProductTypes } from "@/src/types";
import { storage } from "@/src/network/firebase";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { generateImageUrl } from "@/components/GenerateImageUrl";
import CustomImage from "@/components/CustomImage";
import { selectionAsync } from "expo-haptics";
import { MenuAction, MenuView } from "@react-native-menu/menu";
import { SheetManager } from "react-native-actions-sheet";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddProductScreen = () => {
  const { colors } = useTheme();

  const fileNameRef = useRef(`images/products/${Date.now()}.jpg`);
  const storageRef = ref(storage, fileNameRef.current);

  const params = useLocalSearchParams() as unknown as ProductTypes & {
    isEditing: boolean;
    categories?: { key: string; id: string }[];
  };

  const categories =
    typeof params?.categories === "string" ? JSON.parse(params.categories) : [];

  // console.log(params)

  const [productInfo, setProductInfo] = useState<Omit<ProductTypes, "id">>({
    product_image: "",
    product_name: "",
    product_mrp: "",
    product_invoice: "",
    last_updated_at: null,
    product_category: "",
  });

  useEffect(() => {
    if (params?.isEditing) {
      setProductInfo({
        ...params,
        product_image: generateImageUrl(params.product_image),
      });
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const productNameRef = useRef(null);

  return (
    <>
      <Stack.Screen
        options={{
          title: !params.isEditing ? "Add a Product" : "Update Product",
        }}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, gap: 15, marginTop: 30 },
        ]}
      >
        <MenuItem
          title="Select Image Source"
          data={[
            {
              title: "Choose Image",
              id: "choose_image",
              image: Platform.select({
                ios: "photo.on.rectangle",
                android: "ic_gallery",
              }),
              imageColor: colors.text,
            },
            {
              title: "Take Photo",
              id: "take_photo",
              image: Platform.select({
                android: "ic_camera",
                ios: "camera",
              }),
              imageColor: colors.text,
            },
          ]}
          // style={({ pressed }) => ({
          //   alignItems: "center",
          //   alignSelf: "center",
          //   justifyContent: "center",
          //   opacity: pressed ? 0.5 : 1,
          // })}
          onValueSelect={async (val) => {
            try {
              if (val === "take_photo") {
                await ImagePicker.requestCameraPermissionsAsync();

                let result = await ImagePicker.launchCameraAsync({
                  cameraType: ImagePicker.CameraType.back,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.5,
                });

                if (!result.canceled) {
                  // @ts-ignore
                  productNameRef.current?.focus();
                  setProductInfo((pre) => ({
                    ...pre,
                    product_image: result.assets[0].uri,
                  }));

                  await putFile(storageRef, result.assets[0].uri);

                  // setProductInfo((pre) => ({
                  //   ...pre,
                  //   product_image: url,
                  // }));
                }
              } else {
                const preUploadedImage = await SheetManager.show(
                  "uploaded-images-sheet"
                );
                if (preUploadedImage)
                  setProductInfo((pre) => ({
                    ...pre,
                    product_image: preUploadedImage,
                  }));
              }
            } catch (e) {
              console.log({ e });
            }
          }}
        >
          {productInfo.product_image ? (
            <CustomImage
              source={{ uri: productInfo.product_image }}
              width={150}
              height={150}
              style={{ alignSelf: "center" }}
              resizeMode={"contain"}
            />
          ) : (
            <View
              style={{
                width: 150,
                height: 150,
                backgroundColor: colors.card,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <MaterialCommunityIcons
                name="camera"
                size={40}
                color={colors.text}
              />
            </View>
          )}
        </MenuItem>

        <View style={{ gap: 15, paddingHorizontal: 15 }}>
          <CustomInput
            ref={productNameRef}
            label={"Product Name"}
            placeholder="Product Name"
            value={productInfo.product_name}
            onChangeText={(name) =>
              setProductInfo((pre) => ({ ...pre, product_name: name }))
            }
          />

          <View style={{ flexDirection: "row", gap: 15 }}>
            <CustomInput
              label={"Invoice"}
              placeholder="Invoice"
              keyboardType="numeric"
              value={productInfo.product_invoice}
              onChangeText={(price) =>
                setProductInfo((pre) => ({
                  ...pre,
                  product_invoice: price.replace(/\D/g, ""),
                }))
              }
              style={{ flex: 1 }}
            />
            <CustomInput
              label={"MRP"}
              placeholder="MRP"
              keyboardType="numeric"
              value={productInfo.product_mrp}
              onChangeText={(price) => {
                setProductInfo((pre) => ({
                  ...pre,
                  product_mrp: price.replace(/\D/g, ""),
                }));
              }}
              style={{ flex: 1, color: "white" }}
            />
          </View>

          <MenuItem
            title="Select Category"
            data={[
              {
                title: "add new",
                id: "add",
                imageColor: colors.primary,

                image: Platform.select({ android: "ic_menu_add", ios: "plus" }),
              },
              ...categories.map((cat) => ({ title: cat.key, id: cat.key })),
            ]}
            onValueSelect={async (value) => {
              if (value === "add") {
                const val = await SheetManager.show("add-category-sheet");

                if (val) {
                  setProductInfo((pre) => ({ ...pre, product_category: val }));
                  await addCategory(val);
                }
                return;
              }
              setProductInfo((pre) => ({ ...pre, product_category: value }));
            }}
          >
            <CustomInput
              editable={false}
              label={"Category"}
              pointerEvents="none"
              placeholder="Category"
              value={productInfo.product_category}
              onChangeText={(name) =>
                setProductInfo((pre) => ({ ...pre, product_name: name }))
              }
            />
          </MenuItem>

          <CustomButton
            loading={isLoading}
            onPress={async () => {
              try {
                selectionAsync();
                setIsLoading(true);
                const isHttpsUrl = (str: string) => /^https:\/\//i.test(str);
                const isURL = isHttpsUrl(productInfo.product_image);
                let url = "";
                if (productInfo.product_image && !isURL) {
                  url = await getDownloadURL(storageRef);
                }
                if (params?.isEditing) {
                  await updateProduct(params.id, {
                    ...productInfo,
                    product_image: isURL ? productInfo.product_image : url,
                    last_updated_at: Timestamp.now(),
                  });
                  // router.p();
                  router.dismissTo("/");
                  return;
                }

                await saveProduct({
                  ...productInfo,
                  product_image: isURL ? productInfo.product_image : url,
                  last_updated_at: Timestamp.now(),
                });
                router.back();
              } catch (error) {
                console.log({ error });
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {params?.isEditing ? "update" : "save"}
          </CustomButton>
        </View>
      </View>
    </>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

const MenuItem = ({
  title,
  data,
  onValueSelect,
  children,
}: {
  data: MenuAction[];
  title?: string;
  onValueSelect?: (value: string) => void;
  children: React.ReactNode;
}) => {
  return (
    <MenuView
      title={title}
      // themeVariant=""
      onPressAction={({ nativeEvent }) => onValueSelect?.(nativeEvent.event)}
      actions={data}
      shouldOpenOnLongPress={false}
    >
      {children}
    </MenuView>
  );
};
