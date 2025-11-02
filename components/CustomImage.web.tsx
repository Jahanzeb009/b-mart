import {
  View,
  ActivityIndicator,
  StyleSheet,
  DimensionValue,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Image, ImageContentFit } from "expo-image";
const CustomImage = ({
  width,
  height,
  resizeMode,
  source,
  style,
  imageStyle,
}: {
  source: Image["props"]["source"];
  width: DimensionValue;
  height: DimensionValue;
  resizeMode: ImageContentFit;
  style?: View["props"]["style"];
  imageStyle?: Image["props"]["style"];
}) => {
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const { colors } = useTheme();

  const MAX_IMAGE_SIZE = 150;
  const IMAGE_WIDTH = width ? Math.min(MAX_IMAGE_SIZE, +width) : MAX_IMAGE_SIZE;
  const IMAGE_HEIGHT = height
    ? Math.min(MAX_IMAGE_SIZE, +height)
    : MAX_IMAGE_SIZE;

  return (
    <View
      style={[
        {
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: colors.card,
        },
        style,
      ]}
    >
      <Image
        source={source}
        onLoadStart={() => setIsLoadingImage(true)}
        onLoadEnd={() => setIsLoadingImage(false)}
        style={[{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }, imageStyle]}
        contentFit={resizeMode}
      />
      {isLoadingImage && (
        <ActivityIndicator style={StyleSheet.absoluteFillObject} />
      )}
    </View>
  );
};

export default CustomImage;
