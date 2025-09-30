import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Button, ButtonProps } from "react-native-paper";
import { selectionAsync } from "expo-haptics";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const CustomButton = ({
  style,
  labelStyle,
  onPress,
  ...props
}: ButtonProps) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const aniStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(isPressed ? 0.97 : 1),
        },
      ],
    };
  });

  return (
    <Animated.View layout={LinearTransition} style={[{}, aniStyle]}>
      <Button
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        mode="contained"
        theme={{ colors: { primary: colors.primary } }}
        style={[{ borderRadius: 5, padding: 5 }, style]}
        labelStyle={[
          {
            flex: 1,
            fontWeight: "bold",
            textTransform: "uppercase",
          },
          labelStyle,
        ]}
        onPress={(e) => {
          selectionAsync();
          onPress?.(e);
        }}
        {...props}
      >
        {props.children}
      </Button>
    </Animated.View>
  );
};

export default CustomButton;
