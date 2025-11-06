import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { selectionAsync } from "expo-haptics";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Button } from "./ui/button";
import { IButtonProps } from "@gluestack-ui/core/lib/esm/button/creator/types";
import { Spinner } from "./ui/spinner";

const CustomButton = ({
  onPress,
  style,
  children,
  loading,
  ...props
}: IButtonProps & { loading?: boolean }) => {
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
        style={[{ borderRadius: 5, backgroundColor: colors.primary }, style]}
        onPress={(e) => {
          selectionAsync();
          onPress?.(e);
        }}
        children={<>{loading ? <Spinner color={"white"} /> : children}</>}
        {...props}
      />
    </Animated.View>
  );
};

export default CustomButton;
