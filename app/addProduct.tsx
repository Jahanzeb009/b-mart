import { Alert, Platform, StyleSheet, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { addCategory, saveProduct, updateProduct } from "@/src/network";
import { Timestamp } from "firebase/firestore";
import { ProductTypes } from "@/src/types";
import { storage } from "@/src/network/firebase";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { generateImageUrl } from "@/components/GenerateImageUrl";
import CustomImage from "@/components/CustomImage";
import { selectionAsync } from "expo-haptics";
import {
  MenuAction,
  MenuComponentRef,
  MenuView,
} from "@react-native-menu/menu";
import { SheetManager } from "react-native-actions-sheet";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import MenuItem from "@/components/CustomMenu";

const AddProductScreen = () => {
  const { colors } = useTheme();

  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const getRef = (name: string) => (ref: TextInput | null) => {
    inputRefs.current[name] = ref;
  };

  const menuRef = useRef<MenuComponentRef>(null);
  const fileNameRef = useRef(`images/products/${Date.now()}.jpg`);
  const storageRef = ref(storage, fileNameRef.current);

  const params = useLocalSearchParams() as unknown as ProductTypes & {
    isEditing: boolean;
    selectedCategory?: { key: string; id: string };
  };

  const selectImageMenuData = [
    // {
    //   title: "Choose Image",
    //   id: "choose_image",
    //   image: Platform.select({
    //     ios: "photo.on.rectangle",
    //     android: "ic_gallery",
    //   }),
    //   imageColor: colors.text,
    // },
    {
      title: "Pick Photo",
      id: "pick_photo",
      image: Platform.select({
        ios: "photo",
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
  ];

  const selectedCategory =
    typeof params?.selectedCategory === "string"
      ? JSON.parse(params.selectedCategory)
      : params?.selectedCategory;

  const [categories, setCategories] = useState<{ key: string; id: string }[]>(
    []
  );

  const [productInfo, setProductInfo] = useState<Omit<ProductTypes, "id">>({
    product_image: "",
    product_name: "",
    product_mrp: "",
    product_invoice: "",
    last_updated_at: null,
    product_category: selectedCategory?.key ?? "",
    product_extra_info: "",
  });

  const getCategories = async () => {
    let _categories = await AsyncStorage.getItem("@categories");
    if (_categories) {
      _categories = JSON.parse(_categories);

      // @ts-ignore
      setCategories(_categories);
    }

    // setCategories([]);
  };

  useEffect(() => {
    getCategories();

    if (params?.isEditing) {
      setProductInfo({
        last_updated_at: Timestamp.now(),
        product_category: params.product_category,
        product_invoice: params.product_invoice,
        product_mrp: params.product_mrp,
        product_name: params.product_name,
        product_extra_info: params?.product_extra_info ?? "",
        product_image: generateImageUrl(params.product_image),
      });

      inputRefs.current?.product_name?.focus();
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProduct = async () => {
    try {
      const { product_name, product_invoice, product_mrp, product_category } =
        productInfo;

      if (
        !product_name.length ||
        !product_category.length ||
        !product_invoice.length ||
        !product_mrp.length
      ) {
        if (Platform.OS === "web") {
          alert(`Missing\nFill all the details`);
        } else {
          Alert.alert("Missing", "Fill all the details");
        }
        return;
      }

      selectionAsync();
      setIsLoading(true);
      const isHttpsUrl = (str: string) => /^https:\/\//i.test(str);
      const isURL = isHttpsUrl(productInfo.product_image);
      let product_image_url = "";
      if (productInfo.product_image && !isURL) {
        // await putFile(storageRef, productInfo.product_image);
        let base64String = productInfo.product_image;

        // Remove the data URL prefix if present
        if (base64String.startsWith("data:image")) {
          base64String = base64String.replace(
            /^data:image\/[a-z]+;base64,/,
            ""
          );
        }

        const response = await fetch(productInfo.product_image);
        const blob = await response.blob();

        await uploadBytesResumable(storageRef, blob);
        product_image_url = await getDownloadURL(storageRef);
      }
      console.log({ product_image_url });
      if (params?.isEditing) {
        await updateProduct(params.id, {
          ...productInfo,
          product_image: product_image_url || productInfo.product_image,
          last_updated_at: Timestamp.now(),
        });
        router.dismissTo("/");
        return;
      }

      await saveProduct({
        ...productInfo,
        product_image: product_image_url,
        last_updated_at: Timestamp.now(),
      });
      router.back();
    } catch (error) {
      console.log({ error });
    } finally {
      setIsLoading(false);
    }
  };

  const onImageSelect = async (val: string) => {
    try {
      if (val === "take_photo") {
        await ImagePicker.requestCameraPermissionsAsync();

        let result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.back,
          allowsEditing: true,
          quality: 0.5,
          base64: true,
        });

        if (!result.canceled) {
          // @ts-ignore
          inputRefs.current?.product_name.focus();
          setProductInfo((pre) => ({
            ...pre,
            product_image: `data:${
              result.assets[0].mimeType ?? "image/png"
            };base64,${result.assets[0].base64!}`,
          }));
        }
      } else if (val === "pick_photo") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [4, 3],
          base64: true,
          quality: 1,
        });

        if (!result.canceled) {
          // @ts-ignore
          inputRefs.current?.product_name.focus();
          setProductInfo((pre) => ({
            ...pre,
            product_image: `data:${
              result.assets[0].mimeType ?? "image/png"
            };base64,${result.assets[0].base64!}`,
          }));
        }
      }
      //  else {
      //   const preUploadedImage = await SheetManager.show(
      //     "uploaded-images-sheet"
      //   );
      //   if (preUploadedImage)
      //     setProductInfo((pre) => ({
      //       ...pre,
      //       product_image: preUploadedImage,
      //     }));
      // }
    } catch (e) {
      console.log({ e });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: !params.isEditing ? "Add a Product" : "Update Product",
        }}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={15}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background, gap: 15, marginTop: 30 },
        ]}
      >
        <View style={{ alignSelf: "center" }}>
          <MenuItem
            title="Select Image Source"
            data={selectImageMenuData}
            onValueSelect={onImageSelect}
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
        </View>

        <View style={{ gap: 15, paddingHorizontal: 15 }}>
          <CustomInput
            ref={getRef("product_name")}
            label={"Product Name"}
            placeholder="Product Name"
            value={productInfo.product_name}
            returnKeyType="next"
            onSubmitEditing={() => inputRefs.current?.invoice?.focus()}
            onChangeText={(name) =>
              setProductInfo((pre) => ({ ...pre, product_name: name }))
            }
          />

          <View style={{ flexDirection: "row", gap: 15 }}>
            <CustomInput
              ref={getRef("invoice")}
              label={"Invoice"}
              placeholder="Invoice"
              keyboardType="numeric"
              value={productInfo.product_invoice}
              returnKeyType="next"
              onSubmitEditing={() => {
                inputRefs.current?.mrp?.focus();
              }}
              onChangeText={(price) =>
                setProductInfo((pre) => ({
                  ...pre,
                  product_invoice: price.replace(/[^\d.]/g, ""),
                }))
              }
              containerStyle={{ flex: 1 }}
            />
            <CustomInput
              ref={getRef("mrp")}
              label={"MRP"}
              placeholder="MRP"
              keyboardType="numeric"
              value={productInfo.product_mrp}
              returnKeyType="next"
              onSubmitEditing={() => {
                inputRefs.current?.extra_info?.focus();
              }}
              onChangeText={(price) => {
                setProductInfo((pre) => ({
                  ...pre,
                  product_mrp: price.replace(/[^\d.]/g, ""),
                }));
              }}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <MenuItem
            ref={menuRef}
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

          <CustomInput
            ref={getRef("extra_info")}
            label={"Extra Info"}
            placeholder="Extra Info"
            value={productInfo.product_extra_info}
            returnKeyType="done"
            onSubmitEditing={() => handleSaveProduct()}
            onChangeText={(value) => {
              setProductInfo((pre) => ({
                ...pre,
                product_extra_info: value,
              }));
            }}
          />

          <CustomButton loading={isLoading} onPress={handleSaveProduct}>
            {params?.isEditing ? "update" : "save"}
          </CustomButton>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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
