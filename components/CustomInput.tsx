import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTheme } from "@react-navigation/native";
import { Pressable, TextInput, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./ui/text";

type CustomTextInputProps = {
  label: string;
  containerStyle?: ViewStyle;
  pressableStyle?: ViewStyle;
} & TextInput["props"];

const CustomInput = forwardRef<TextInput, CustomTextInputProps>(
  ({ label, containerStyle, pressableStyle, style, ...rest }, ref) => {
    const { colors } = useTheme();

    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => inputRef.current as TextInput);

    const aniStyle = useAnimatedStyle(() => ({
      borderColor: withTiming(isFocused ? colors.primary : colors.border),
    }));
    return (
      <Animated.View
        style={[
          {
            backgroundColor: colors.card,
            borderRadius: 10,
            borderWidth: 1,
          },
          aniStyle,
          containerStyle,
        ]}
      >
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={[{ flex: 1, padding: 7, gap: 4 }, pressableStyle]}
        >
          {label && (
            <Text
              style={{ color: isFocused ? colors.primary : colors.text + "90" }}
              size="sm"
            >
              {label}
            </Text>
          )}
          <TextInput
            ref={inputRef}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            placeholderTextColor={"grey"}
            style={[
              {
                color: colors.text,
                outline: "transparent",
              },
              style,
            ]}
            {...rest}
          />
        </Pressable>
      </Animated.View>
    );
  }
);

export default CustomInput;
