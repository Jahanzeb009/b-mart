import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ImageSourcePropType,
  DimensionValue,
  ImageResizeMode,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Image, ImageContentFit } from "expo-image";

const CustomImage = ({
  width,
  height,
  resizeMode,
  source,
}: {
  source: ImageSourcePropType;
  width: DimensionValue;
  height: DimensionValue;
  resizeMode: ImageContentFit;
}) => {
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const { colors } = useTheme();

  return (
    <View
      style={{
        width,
        height,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: colors.card,
      }}
    >
      <Image
        source={source}
        onLoadStart={() => setIsLoadingImage(true)}
        onLoadEnd={() => setIsLoadingImage(false)}
        style={{ width, height }}
        contentFit={resizeMode}
      />
      {isLoadingImage && (
        <ActivityIndicator style={StyleSheet.absoluteFillObject} />
      )}
    </View>
  );
};

export default CustomImage;
