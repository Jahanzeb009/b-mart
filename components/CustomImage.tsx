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

  return (
    <View
      style={[
        {
          width,
          height,
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
        style={[{ width, height }, imageStyle]}
        resizeMode={resizeMode}
      />
      {isLoadingImage && (
        <ActivityIndicator style={StyleSheet.absoluteFillObject} />
      )}
    </View>
  );
};

export default CustomImage;
