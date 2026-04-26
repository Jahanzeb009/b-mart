import React, { RefObject, useEffect } from "react";
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { BlurView } from "expo-blur";
import CustomImage from "@/src/components/CustomImage";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const TARGET_W = SCREEN_W;
const TARGET_H = SCREEN_H / 2;
const TARGET_X = 0;
const TARGET_Y = (SCREEN_H - TARGET_H) / 2;

const TIMING = { duration: 300 };
const BLUR_INTENSITY = 60;

export type ImageViewerSource = {
  image: string;
  pageX: number;
  pageY: number;
  width: number;
  height: number;
};

type Props = {
  source: ImageViewerSource | null;
  onClose: () => void;
  blurTarget?: RefObject<View | null>;
};

const ImageViewer = ({ source, onClose, blurTarget }: Props) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (source) progress.value = withTiming(1, TIMING);
  }, [source, progress]);

  const close = () => {
    progress.value = withTiming(0, TIMING, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const blurStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const imageStyle = useAnimatedStyle(() => {
    const sx = source?.pageX ?? 0;
    const sy = source?.pageY ?? 0;
    const sw = source?.width ?? 0;
    const sh = source?.height ?? 0;
    return {
      position: "absolute",
      left: interpolate(progress.value, [0, 1], [sx, TARGET_X]),
      top: interpolate(progress.value, [0, 1], [sy, TARGET_Y]),
      width: interpolate(progress.value, [0, 1], [sw, TARGET_W]),
      height: interpolate(progress.value, [0, 1], [sh, TARGET_H]),
      borderRadius: interpolate(progress.value, [0, 1], [12, 0]),
    };
  });

  if (!source) return null;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={close}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
        <BlurView
          tint="systemMaterialDark"
          intensity={BLUR_INTENSITY}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={blurTarget}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={imageStyle}>
        <CustomImage
          source={{ uri: source.image }}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { backgroundColor: "transparent" }]}
        />
      </Animated.View>
    </Pressable>
  );
};

export default ImageViewer;
