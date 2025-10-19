import {
  View,
  ActivityIndicator,
  StyleSheet,
  DimensionValue,
  Image,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";

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
  resizeMode: Image["props"]["resizeMode"];
  style?: View["props"]["style"];
  imageStyle?: Image["props"]["style"];
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
      <Image
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
