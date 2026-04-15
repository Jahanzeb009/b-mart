import {
  View,
  ActivityIndicator,
  StyleSheet,
  DimensionValue,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import FastImage, { FastImageProps } from "@d11/react-native-fast-image";

const CustomImage = ({
  width,
  height,
  resizeMode,
  source,
  style,
  imageStyle,
}: {
  source: FastImageProps["source"];
  width: DimensionValue;
  height: DimensionValue;
  resizeMode: FastImageProps["resizeMode"];
  style?: View["props"]["style"];
  imageStyle?: FastImageProps["style"];
}) => {
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const { colors } = useTheme();

  const MAX_IMAGE_SIZE = 150;
  const IMAGE_WIDTH = width ? Math.max(MAX_IMAGE_SIZE, +width) : MAX_IMAGE_SIZE;
  const IMAGE_HEIGHT = height
    ? Math.max(MAX_IMAGE_SIZE, +height)
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
      <FastImage
        source={source}
        onLoadStart={() => setIsLoadingImage(true)}
        onLoadEnd={() => setIsLoadingImage(false)}
        style={[{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }, imageStyle]}
        resizeMode={resizeMode}
      />
      {isLoadingImage && (
        <ActivityIndicator style={StyleSheet.absoluteFillObject} />
      )}
    </View>
  );
};

export default CustomImage;
