import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { ref } from "firebase/storage";
import {
  addCategory,
  saveProduct,
  updateProduct,
  uploadProductImage,
} from "@/src/network";
import { ProductCategoryTypes, ProductTypes } from "@/src/types";
import { storage } from "@/src/network/firebase";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { selectionAsync } from "expo-haptics";
import { MenuComponentRef } from "@react-native-menu/menu";
import { SheetManager } from "react-native-actions-sheet";
import CustomInput from "@/components/CustomInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import MenuItem from "@/components/CustomMenu";
import CustomAlert from "@/components/CustomAlert";
import { ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Image } from "@/components/ui/image";
import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { Camera, Save } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";

const AddProductScreen = () => {
  const { colors } = useTheme();

  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const inset = useSafeAreaInsets();

  const getRef = (name: string) => (ref: TextInput | null) => {
    inputRefs.current[name] = ref;
  };

  const menuRef = useRef<MenuComponentRef>(null);
  const fileNameRef = useRef(`images/products/${Date.now()}.jpg`);
  // const storageRef = ref(storage, fileNameRef.current);

  const params = useLocalSearchParams() as unknown as ProductTypes & {
    isEditing: boolean;
    selectedCategory?: { key: string; id: string };
  };
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  const selectedCategory =
    typeof params?.selectedCategory === "string"
      ? JSON.parse(params.selectedCategory)
      : params?.selectedCategory;

  const [categories, setCategories] = useState<ProductCategoryTypes[]>([]);

  const [productInfo, setProductInfo] = useState<Omit<ProductTypes, "id">>({
    image: "",
    name: "",
    mrp: "",
    invoice: "",
    category_id: selectedCategory?.key ?? "",
    extra_info: "",
    extra_attachments: [],
  });

  const extra_attachments: (typeof productInfo)["extra_attachments"] =
    typeof productInfo.extra_attachments === "string"
      ? JSON.parse(JSON.parse(productInfo.extra_attachments))
      : productInfo.extra_attachments;

  const getCategories = async () => {
    let _categories = await AsyncStorage.getItem("@categories");
    if (_categories) {
      _categories = JSON.parse(_categories);
      console.log({ selectedCategory });
      // @ts-ignore
      setCategories(_categories);
    }
  };

  useEffect(() => {
    getCategories();

    // assign values to the inputs when editing.
    if (params?.isEditing) {
      setProductInfo({
        category_id: params.category_id,
        invoice: params.invoice,
        mrp: params.mrp,
        name: params.name,
        extra_info: params?.extra_info ?? "",
        extra_attachments:
          typeof params.extra_attachments === "string"
            ? JSON.parse(JSON.parse(params.extra_attachments))
            : (params?.extra_attachments ?? []),
        image: params.image,
      });

      inputRefs.current?.product_name?.focus();
    } else {
      setProductInfo((pre) => ({
        ...pre,
        category_id: selectedCategory?.id ?? "",
      }));
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProduct = async () => {
    try {
      const { name, invoice, mrp, category_id } = productInfo;

      if (
        !name.length ||
        !category_id.length ||
        !invoice.length ||
        !mrp.length
      ) {
        setShowAlertDialog(true);
        return;
      }

      selectionAsync();
      setIsLoading(true);

      const isURL = isHttpsUrl(productInfo.image);
      let product_image_url = "";

      if (productInfo.image && !isURL) {
        let base64 = productInfo.image;

        if (isBase64String(base64)) {
          base64 = removeBase64String(base64);
        }

        const url = await uploadProductImage({
          product_id: params.id,
          base64,
          filename: `${params.id}.png`,
        });

        if (url) product_image_url = url;
      }

      const attachments = [];

      for (let { image: base64 } of productInfo.extra_attachments ?? []) {
        /**
         * while updating product, extra_attachments may contain existing images so if it's URL then we will simply push that url to attachemnts.
         * */
        if (isHttpsUrl(base64)) {
          attachments.push({ image: base64 });
          continue;
        }

        // remove any base64 string starting elements as per the supabase requirements
        if (isBase64String(base64)) {
          base64 = removeBase64String(base64);
        }

        const filename = `${Date.now()}.png`;

        // upload the image then insert image url again.
        const url = await uploadProductImage({
          product_id: params.id,
          base64,
          filename,
        });

        if (url) attachments.push({ image: url });
      }

      const product_update_response = await updateProduct({
        id: params.id,
        image: product_image_url || productInfo.image,
        category_id: productInfo.category_id,
        extra_attachments: attachments,
        extra_info: productInfo.extra_info,
        invoice: productInfo.invoice,
        mrp: productInfo.mrp,
        name: productInfo.name,
      });
      console.log(
        "product_update_response -> ",
        JSON.stringify(product_update_response, null, 2),
      );

      if (product_update_response && product_update_response?.error) {
        Alert.alert("Error", product_update_response?.error?.message);
        return;
      }

      router.dismissTo("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const { name, invoice, mrp, category_id } = productInfo;

      if (
        !name.length ||
        !category_id.length ||
        !invoice.length ||
        !mrp.length
      ) {
        setShowAlertDialog(true);
        return;
      }

      selectionAsync();
      setIsLoading(true);

      const product_id = Crypto.randomUUID();

      // check if product image selected
      let product_image_url = "";

      if (productInfo.image) {
        let base64 = productInfo.image;

        // remove any base64 string starting elements as per the supabase requirements
        if (isBase64String(base64)) {
          base64 = removeBase64String(base64);
        }
        // upload the image then insert image url again.
        const url = await uploadProductImage({
          product_id,
          base64,
          filename: `product_image.png`,
          // filename: `${product_id}.png`,
        });
        if (url) product_image_url = url;
      }

      const attachments = [];

      for (let { image: base64 } of productInfo.extra_attachments ?? []) {
        // remove any base64 string starting elements as per the supabase requirements
        if (isBase64String(base64)) {
          base64 = removeBase64String(base64);
        }

        const filename = `${Date.now()}.png`;

        // upload the image then insert image url again.
        const url = await uploadProductImage({
          product_id,
          base64,
          filename,
        });

        if (url) attachments.push({ image: url });
      }

      const product_response = await saveProduct({
        id: product_id,
        category_id: productInfo.category_id,
        extra_attachments: attachments,
        extra_info: productInfo.extra_info,
        invoice: productInfo.invoice,
        mrp: productInfo.mrp,
        name: productInfo.name,
        image: product_image_url,
      });
      console.log(JSON.stringify(product_response, null, 2));

      if (product_response && product_response?.error) {
        Alert.alert("Error", product_response?.error?.message);
        return;
      }

      router.back();
    } catch (error) {
      console.log({ error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setShowAlertDialog(false);
    inputRefs.current?.product_name?.focus();
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
          const asset = result.assets[0];
          // @ts-ignore
          inputRefs.current?.product_name.focus();
          setProductInfo((pre) => ({
            ...pre,
            image: `data:${
              asset.mimeType ?? "image/png"
            };base64,${asset.base64!}`,
          }));
        }
      } else if (val === "pick_photo") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          base64: true,
          quality: 1,
        });

        if (!result.canceled) {
          const asset = result.assets[0];
          // @ts-ignore
          inputRefs.current?.product_name.focus();
          setProductInfo((pre) => ({
            ...pre,
            image: `data:${
              asset.mimeType ?? "image/png"
            };base64,${asset.base64!}`,
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
      //       image: preUploadedImage,
      //     }));
      // }
    } catch (e) {
      console.log({ e });
    }
  };

  const onAttachmentImageDelete = (currentImage: string) => {
    if (!Array.isArray(productInfo.extra_attachments)) {
      return;
    }

    setProductInfo((pre) => ({
      ...pre,
      extra_attachments: pre.extra_attachments?.filter(
        (_) => _?.image !== currentImage,
      ),
    }));
  };

  const onAttachmentSelect = async (val: string) => {
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
          const asset = result.assets[0];
          // @ts-ignore
          inputRefs.current?.product_name.focus();
          setProductInfo((pre) => ({
            ...pre,
            extra_attachments: [
              ...(Array.isArray(pre.extra_attachments)
                ? pre.extra_attachments
                : []),
              {
                image: `data:${
                  asset.mimeType ?? "image/png"
                };base64,${asset.base64!}`,
              },
            ],
          }));
        }
      } else if (val === "pick_photo") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          base64: true,
          quality: 1,
        });

        if (!result.canceled) {
          const asset = result.assets[0];
          // @ts-ignore
          inputRefs.current?.product_name.focus();
          setProductInfo((pre) => ({
            ...pre,
            extra_attachments: [
              // @ts-ignore
              ...pre.extra_attachments,
              {
                image: `data:${
                  asset.mimeType ?? "image/png"
                };base64,${asset.base64!}`,
              },
            ],
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
      //       image: preUploadedImage,
      //     }));
      // }
    } catch (e) {
      console.log({ e });
    }
  };

  const MenuData = [
    {
      title: "add new",
      id: "add",
      imageColor: colors.primary,

      image: Platform.select({
        android: "ic_menu_add",
        ios: "plus",
      }),
    },
    ...categories.map((cat) => ({ title: cat.name, id: cat.id })),
  ];

  const onMenuSelect = async (value: string) => {
    if (value === "add") {
      const val = await SheetManager.show("add-category-sheet");
      if (val) {
        // @ts-ignore
        const { data, error } = await addCategory(val);
        console.log({ data });
        if (error) {
          Alert.alert("Error", error?.details);
        } else if (data) {
          setCategories((pre) => {
            const tmp = [...pre];
            tmp.push(data);
            return tmp;
          });
          setProductInfo((pre) => ({
            ...pre,
            category_id: data?.id,
          }));
        }
      }
      return;
    }
    setProductInfo((pre) => ({
      ...pre,
      category_id: value,
    }));
  };

  const currentCategory = categories.find((_) => {
    if (params?.isEditing || !!productInfo.category_id) {
      return _.id === productInfo.category_id;
    }

    return _.id === selectedCategory.id;
  })?.name;

  return (
    <>
      <Stack.Screen
        options={{
          title: !params.isEditing ? "Add a Product" : "Update Product",
          headerRight(props) {
            return (
              <View
                style={{
                  paddingHorizontal: 5,
                  marginRight: Platform.OS === "web" ? 20 : 5,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Pressable
                    onPress={
                      params.isEditing ? handleUpdateProduct : handleSaveProduct
                    }
                  >
                    <Save color={colors.text} size={24} />
                  </Pressable>
                )}
              </View>
            );
          },
        }}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={15}
        contentContainerStyle={StyleSheet.flatten([
          styles.container,
          {
            backgroundColor: colors.background,
            gap: 15,
            marginTop: 30,
            paddingBottom: inset.bottom,
          },
        ])}
      >
        <VStack className="gap-[15px]  sm:w-[500px] sm:self-center">
          <Box className="self-center">
            <MenuItem
              title="Select Image Source"
              data={selectImageMenuData(colors)}
              onValueSelect={onImageSelect}
            >
              {productInfo?.image ? (
                <Image
                  source={{
                    uri: productInfo.image,
                  }}
                  className={`mb-6 h-[300px] w-[300px] rounded-sm`}
                  alt="image"
                  resizeMode="cover"
                  onError={(e) => console.log(e)}
                  style={{
                    width: 150,
                    aspectRatio: 1,
                    marginBottom: 15,
                    borderRadius: 10,
                  }}
                />
              ) : (
                <Box
                  className={`mb-6 h-[200px] w-[200px] items-center justify-center rounded-lg`}
                  style={{
                    backgroundColor: colors.card,
                  }}
                >
                  {/* @ts-ignore */}
                  <Icon as={Camera} size={40} color={colors.text} />
                </Box>
              )}
            </MenuItem>
          </Box>

          <Box className="gap-2.5 px-5">
            <CustomInput
              // @ts-ignore
              ref={getRef("product_name")}
              label={"Product Name"}
              placeholder="Product Name"
              value={productInfo.name}
              returnKeyType="next"
              onSubmitEditing={() => inputRefs.current?.invoice?.focus()}
              onChangeText={(name) =>
                setProductInfo((pre) => ({ ...pre, name: name }))
              }
            />

            <Box className="flex-row gap-2.5">
              <CustomInput
                // @ts-ignore
                ref={getRef("invoice")}
                label={"Invoice"}
                placeholder="Invoice"
                keyboardType="numeric"
                leftIcon={
                  <Text style={{ color: colors.text + "70" }}>PKR</Text>
                }
                value={productInfo.invoice}
                returnKeyType="next"
                onSubmitEditing={() => {
                  inputRefs.current?.mrp?.focus();
                }}
                onChangeText={(price) =>
                  setProductInfo((pre) => ({
                    ...pre,
                    invoice: price.replace(/[^\d.]/g, ""),
                  }))
                }
                containerStyle={{ flex: 1 }}
              />
              <CustomInput
                // @ts-ignore
                ref={getRef("mrp")}
                label={"MRP"}
                placeholder="MRP"
                leftIcon={
                  <Text style={{ color: colors.text + "70" }}>PKR</Text>
                }
                keyboardType="numeric"
                value={productInfo.mrp}
                returnKeyType="next"
                onSubmitEditing={() => {
                  inputRefs.current?.extra_info?.focus();
                }}
                onChangeText={(price) => {
                  setProductInfo((pre) => ({
                    ...pre,
                    mrp: price.replace(/[^\d.]/g, ""),
                  }));
                }}
                containerStyle={{ flex: 1 }}
              />
            </Box>

            <MenuItem
              ref={menuRef}
              title="Select Category"
              data={MenuData}
              onValueSelect={onMenuSelect}
            >
              <CustomInput
                editable={false}
                label={"Category"}
                pointerEvents="none"
                placeholder="Category"
                value={currentCategory}
              />
            </MenuItem>

            <CustomInput
              // @ts-ignore
              ref={getRef("extra_info")}
              label={"Extra Info"}
              placeholder="Extra Info"
              value={productInfo.extra_info}
              multiline
              textAlignVertical="top"
              containerStyle={{ minHeight: 150 }}
              style={{ paddingTop: 10 }}
              onSubmitEditing={() =>
                params.isEditing ? handleUpdateProduct() : handleSaveProduct()
              }
              onChangeText={(value) => {
                setProductInfo((pre) => ({
                  ...pre,
                  extra_info: value,
                }));
              }}
            />

            <Text>Extra Attachments</Text>

            <Box className="flex-row flex-wrap w-full">
              <Box className="p-1 w-1/4">
                <MenuItem
                  title="Select Image Source"
                  data={selectImageMenuData(colors)}
                  onValueSelect={onAttachmentSelect}
                >
                  <Box
                    className="aspect-square rounded-xl justify-center items-center overflow-hidden"
                    style={{ backgroundColor: colors.card }}
                  >
                    {/* @ts-ignore */}
                    <Icon as={Camera} size={40} color={colors.text} />
                  </Box>
                </MenuItem>
              </Box>
              {extra_attachments?.map((item, index) => (
                <Box key={index} className="p-1 w-1/4">
                  <TouchableOpacity
                    className="flex-1 them rounded-xl  overflow-hidden aspect-square justify-center items-center"
                    onPress={() => onAttachmentImageDelete(item?.image)}
                  >
                    <Image
                      source={{
                        uri: item?.image,
                      }}
                      style={{ minWidth: 100, height: "100%" }}
                      resizeMode="cover"
                      alt="image"
                    />
                  </TouchableOpacity>
                </Box>
              ))}
            </Box>
          </Box>
        </VStack>

        <CustomAlert
          showAlertDialog={showAlertDialog}
          title="Missing"
          description="Fill all the details"
          onClose={handleCloseAlert}
          footer={[
            {
              children: <ButtonText>Okay</ButtonText>,
              onPress: handleCloseAlert,
            },
          ]}
        />
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

const isBase64String = (str: string) => {
  return str.startsWith("data:image");
};

const removeBase64String = (str: string) => {
  return str.replace(/^data:image\/[a-z]+;base64,/, "");
};

const selectImageMenuData = (colors: any) => [
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

const isHttpsUrl = (str: string) => /^https:\/\//i.test(str);
