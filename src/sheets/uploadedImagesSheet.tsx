import {
  View,
  Text,
  useWindowDimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useTheme } from "@react-navigation/native";
import { listAll, ref } from "@react-native-firebase/storage";
import { storage } from "../network/firebase";
import CustomImage from "@/components/CustomImage";
import { FlashList } from "@shopify/flash-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelperText, IconButton } from "react-native-paper";

const getAllImageUrls = async (path = "images/products") => {
  try {
    const reference = ref(storage, path);
    const result = await listAll(reference);

    // Get download URLs for each item
    const urls = await Promise.all(
      result.items.map((itemRef) => itemRef.getDownloadURL())
    );

    return urls; // Array of URLs
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
};

const UploadedImagesSheet = (props: SheetProps<"uploaded-images-sheet">) => {
  const { colors } = useTheme();
  const [images, setImages] = useState<{
    last_updated_at: number;
    data: string[];
  }>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFreshImages = async () => {
    try {
      const imagesURLs = await getAllImageUrls();
      setImages({
        last_updated_at: Date.now(),
        data: imagesURLs,
      });
      AsyncStorage.setItem(
        "_images",
        JSON.stringify({ last_updated_at: Date.now(), data: imagesURLs })
      );
    } catch (e) {
      console.log("getFreshImages error -> ", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getImages = async () => {
    try {
      let images = await AsyncStorage.getItem("_images");
      if (images) {
        images = JSON.parse(images);
        setImages(images);
        // console.log(images);
        console.log("images get from local storage");
      } else {
        await getFreshImages();
      }
    } catch (error) {
      console.log("getImages error -> ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getImages();
    // getAllImageUrls()
    //   .then((urls) => {
    //     setImages(urls);
    //     AsyncStorage.setItemAsync(
    //       "images",
    //       JSON.stringify({ last_updated_at: Date.now(), data: urls })
    //     );
    //   })
    //   .finally(() => setIsLoading(false));
  }, []);

  let { width } = useWindowDimensions();

  width -= 30 + 20;

  const IMAGE_SIZE = width / 3;

  const last_updated_at = new Date(
    images.last_updated_at ?? Date.now()
  ).toLocaleString();

  return (
    <ActionSheet
      gestureEnabled
      id={props.sheetId}
      containerStyle={{
        backgroundColor: colors.border,
        paddingTop: 15,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        minHeight: "40%",
      }}
      indicatorStyle={{ backgroundColor: colors.card }}
    >
      <View style={{ minHeight: "100%" }}>
        {isLoading && (
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              gap: 15,
            }}
          >
            <ActivityIndicator size={"large"} color={colors.primary} />
            <Text style={{ color: colors.text }}>Loading Images...</Text>
          </View>
        )}
        <FlashList
          data={images.data}
          numColumns={3}
          bounces={false}
          ListHeaderComponent={() => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 15,
                }}
              >
                <HelperText
                  style={{ fontStyle: "italic", color: colors.text }}
                  type="info"
                >
                  {last_updated_at}
                </HelperText>
                <IconButton
                  icon={"refresh"}
                  iconColor={colors.text}
                  style={{ margin: 0, backgroundColor: colors.card }}
                  onPress={getFreshImages}
                  mode="contained"
                />
              </View>
            );
          }}
          contentContainerStyle={{
            paddingTop: 15,
            // gap: 15,
            paddingHorizontal: 15,
          }}
          estimatedItemSize={200}
          //   columnWrapperStyle={{ gap: 15 }}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                key={index}
                onPress={() =>
                  SheetManager.hide("uploaded-images-sheet", {
                    payload: item,
                  })
                }
                style={{ padding: 5 }}
              >
                <CustomImage
                  source={{ uri: item }}
                  width={IMAGE_SIZE}
                  height={IMAGE_SIZE}
                  resizeMode="cover"
                />
              </Pressable>
            );
          }}
        />
      </View>
    </ActionSheet>
  );
};

export default UploadedImagesSheet;
