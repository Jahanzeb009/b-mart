import React, {
  forwardRef,
  JSX,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTheme } from "@react-navigation/native";
import { Platform, Pressable, TextInput, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./ui/text";

type CustomTextInputProps = {
  label?: string;
  containerStyle?: ViewStyle;
  pressableStyle?: ViewStyle;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
} & TextInput["props"];

const CustomInput = forwardRef<TextInput, CustomTextInputProps>(
  (
    {
      label,
      containerStyle,
      pressableStyle,
      style,
      leftIcon,
      rightIcon,
      ...rest
    },
    ref,
  ) => {
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
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          },
          aniStyle,
          containerStyle,
        ]}
      >
        {leftIcon && <View style={{ paddingLeft: 10 }}>{leftIcon}</View>}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={[
            {
              flex: 1,
              gap: Platform.select({
                web: 5,
                default: 0,
              }),
              paddingBottom: Platform.select({
                web: 5,
                default: 0,
              }),
              paddingTop: 5,
              paddingLeft: !!leftIcon ? 0 : 8,
            },
            pressableStyle,
          ]}
        >
          {label && (
            <Text
              style={{
                color: isFocused ? colors.primary : colors.text + "90",
                fontWeight: "bold",
              }}
              size="xs"
            >
              {label}
            </Text>
          )}
          <TextInput
            ref={inputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor={"grey"}
            selectionColor={colors.primary}
            style={[
              {
                color: colors.text,
                outline: "none",
                paddingVertical: Platform.select({
                  android: 5,
                  ios: 8,
                }),
              },
              style,
            ]}
            {...rest}
          />
        </Pressable>
        {rightIcon}
      </Animated.View>
    );
  },
);

export default CustomInput;
