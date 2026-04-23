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
            gap: Platform.select({
              web: 10,
              default: 5,
            }),
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

// import React, { forwardRef, JSX } from "react";
// import { useTheme } from "@react-navigation/native";
// import {
//   StyleProp,
//   StyleSheet,
//   TextInput,
//   TextStyle,
//   ViewStyle,
// } from "react-native";
// import { Text } from "./ui/text";
// import { VStack } from "./ui/vstack";
// import { Input, InputField, InputSlot, UIInput } from "./ui/input";

// type CustomTextInputProps = {
//   label?: string;
//   containerStyle?: ViewStyle;
//   leftIcon?: JSX.Element;
//   rightIcon?: JSX.Element;
//   inputStyle?: StyleProp<ViewStyle>;
//   inputFieldStyle?: StyleProp<TextStyle>;
// } & TextInput["props"];

// const CustomInput = forwardRef<typeof UIInput.Input, CustomTextInputProps>(
//   (
//     {
//       label,
//       containerStyle,
//       inputStyle,
//       inputFieldStyle,
//       leftIcon,
//       rightIcon,
//       ...rest
//     },
//     ref,
//   ) => {
//     const { colors } = useTheme();

//     return (
//       <VStack className="gap-1.5" style={containerStyle}>
//         {!!label && (
//           <Text size="sm" bold style={{ color: colors.text }}>
//             {label}
//           </Text>
//         )}
//         <Input
//           variant="outline"
//           size="lg"
//           style={StyleSheet.flatten([
//             { borderColor: colors.border },
//             inputStyle,
//           ])}
//         >
//           {leftIcon && <InputSlot className="pl-3">{leftIcon}</InputSlot>}

//           <InputField
//             ref={ref}
//             className="placeholder:text-gray-400 dark:placeholder:text-gray-600"
//             style={StyleSheet.flatten([
//               { color: colors.text, outline: "none" },
//               inputFieldStyle,
//             ])}
//             selectionColor={colors.primary}
//             {...rest}
//           />
//           {rightIcon && <InputSlot className="pl-3">{rightIcon}</InputSlot>}
//         </Input>
//       </VStack>
//     );
//   },
// );

// export default CustomInput;
