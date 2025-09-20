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
import { saveProduct, updateProduct } from "@/src/network";
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
    category: "",
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
  // Alert.prompt("Product Name", "Enter the name of the product:", [
  //   {
  //     text: "Cancel",
  //     onPress: () => console.log("Cancel Pressed"),
  //     style: "cancel",
  //   },
  //   {
  //     text: "OK",
  //     onPress: (name) => {
  //       // setProductInfo((pre) => ({ ...pre, product_name: name }));
  //       console.log({ name });
  //     },
  //   },
  // ]);
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
        <Pressable
          style={({ pressed }) => ({
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={async () => {
            try {
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
              }}
            >
              <MaterialCommunityIcons
                name="camera"
                size={40}
                color={colors.text}
              />
            </View>
          )}
        </Pressable>

        <View style={{ gap: 15, paddingHorizontal: 15 }}>
          <TextInput
            ref={productNameRef}
            mode="outlined"
            label={"Product Name"}
            placeholder="Product Name"
            value={productInfo.product_name}
            onChangeText={(name) =>
              setProductInfo((pre) => ({ ...pre, product_name: name }))
            }
            theme={{
              colors: {
                primary: colors.primary,
                background: colors.card,
                onSurface: colors.text,
                outline: "grey",
                onSurfaceVariant: "grey",
              },
            }}
          />

          <View style={{ flexDirection: "row", gap: 15 }}>
            <TextInput
              mode="outlined"
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
              theme={{
                colors: {
                  primary: colors.primary,
                  background: colors.card,
                  onSurface: colors.text,
                  outline: "grey",
                  onSurfaceVariant: "grey",
                },
              }}
            />
            <TextInput
              mode="outlined"
              label={"MRP"}
              placeholder="MRP"
              keyboardType="numeric"
              value={productInfo.product_mrp}
              onChangeText={(price) => {
                // console.log(isNaN(Number(price)) ? 0 : Number(price));
                setProductInfo((pre) => ({
                  ...pre,
                  product_mrp: price.replace(/\D/g, ""),
                }));
              }}
              style={{ flex: 1, color: "white" }}
              theme={{
                colors: {
                  primary: colors.primary,
                  background: colors.card,
                  onSurface: colors.text,
                  outline: "grey",
                  onSurfaceVariant: "grey",
                },
              }}
            />
          </View>

          <MenuItem
            title="Select Category"
            data={[
              {
                title: "Add New",
                id: "add",
                imageColor: colors.primary,

                image: Platform.select({ android: "ic_menu_add", ios: "plus" }),
              },
              ...categories.map((cat) => ({ title: cat.key, id: cat.key })),
            ]}
            onValueSelect={(value) => {
              if (value === "add") {}
              setProductInfo((pre) => ({ ...pre, category: value }));
            }}
          >
            <TextInput
              ref={productNameRef}
              mode="outlined"
              editable={false}
              label={"Category"}
              pointerEvents="none"
              placeholder="Category"
              value={productInfo.category}
              onChangeText={(name) =>
                setProductInfo((pre) => ({ ...pre, product_name: name }))
              }
              theme={{
                colors: {
                  primary: colors.primary,
                  background: colors.card,
                  onSurface: colors.text,
                  outline: "grey",
                  onSurfaceVariant: "grey",
                },
              }}
            />
          </MenuItem>

          <Button
            loading={isLoading}
            onPress={async () => {
              try {
                selectionAsync();
                setIsLoading(true);
                let url = "";
                if (productInfo.product_image) {
                  url = await getDownloadURL(storageRef);
                }
                if (params?.isEditing) {
                  await updateProduct(params.id, {
                    ...productInfo,
                    product_image: url,
                    last_updated_at: Timestamp.now(),
                  });

                  return;
                }

                await saveProduct({
                  ...productInfo,
                  product_image: url,
                  last_updated_at: Timestamp.now(),
                });
              } catch (error) {
                console.log({ error });
              } finally {
                setIsLoading(false);
                router.back();
              }
            }}
            mode="contained"
            theme={{ colors: { primary: colors.primary } }}
            style={{ borderRadius: 5, padding: 5 }}
            labelStyle={{
              flex: 1,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {params?.isEditing ? "update" : "save"}
          </Button>
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
