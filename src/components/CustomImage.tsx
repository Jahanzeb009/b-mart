import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import FastImage, { FastImageProps } from "@d11/react-native-fast-image";
import Animated, { measure, useAnimatedRef } from "react-native-reanimated";
import { runOnJS, runOnUI } from "react-native-worklets";

type Props = {
  source: FastImageProps["source"];
  resizeMode?: FastImageProps["resizeMode"];
  style?: View["props"]["style"];
  imageStyle?: FastImageProps["style"];
  onPress?: (m: ReturnType<typeof measure>) => void;
};

const CustomImage = ({
  source,
  resizeMode = "cover",
  onPress,
  style,
  imageStyle,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const imageRef = useAnimatedRef<Animated.View>();

  const handlePress = () => {
    if (!onPress) return;
    runOnUI(() => {
      const m = measure(imageRef);
      runOnJS(onPress)(m);
    })();
  };

  const content = (
    <Animated.View
      ref={imageRef}
      style={[styles.container, { backgroundColor: colors.card }, style]}
    >
      <FastImage
        source={source}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={[StyleSheet.absoluteFill, imageStyle]}
        resizeMode={resizeMode}
      />
      {isLoading && (
        <ActivityIndicator style={StyleSheet.absoluteFill} />
      )}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      {content}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 10,
  },
});

export default CustomImage;
