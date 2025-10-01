import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTheme } from "@react-navigation/native";
import { Text } from "react-native-paper";
import { Pressable, TextInput, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type CustomTextInputProps = {
  label: string;
  containerStyle?: ViewStyle;
} & TextInput["props"];

// const CustomInput = forwardRef<TextInputProps["ref"], CustomTextInputProps>(
const CustomInput = forwardRef<TextInput, CustomTextInputProps>(
  ({ label, containerStyle, style, ...rest }, ref) => {
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
          style={{ flex: 1, padding: 7, gap: 4 }}
        >
          {label && (
            <Text
              style={{ color: isFocused ? colors.primary : colors.text + "90" }}
              variant="labelSmall"
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

                // height:'100%'
                // padding: 10,
              },
              style,
            ]}
            // label={label}
            // theme={{
            //   colors: {
            //     primary: colors.primary,
            //     background: colors.card,
            //     onSurface: colors.text,
            //     outline: "grey",
            //     onSurfaceVariant: "grey",
            //   },
            // }}
            {...rest}
          />
        </Pressable>
      </Animated.View>
    );
  }
);

export default CustomInput;
