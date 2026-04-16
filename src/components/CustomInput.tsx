import React, { forwardRef, JSX } from "react";
import { useTheme } from "@react-navigation/native";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { Input, InputField, InputSlot, UIInput } from "./ui/input";

type CustomTextInputProps = {
  label?: string;
  containerStyle?: ViewStyle;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  inputStyle?: StyleProp<ViewStyle>;
  inputFieldStyle?: StyleProp<TextStyle>;
} & TextInput["props"];

const CustomInput = forwardRef<typeof UIInput.Input, CustomTextInputProps>(
  (
    {
      label,
      containerStyle,
      inputStyle,
      inputFieldStyle,
      leftIcon,
      rightIcon,
      ...rest
    },
    ref,
  ) => {
    const { colors } = useTheme();

    return (
      <VStack className="gap-1.5" style={containerStyle}>
        {!!label && (
          <Text size="sm" bold style={{ color: colors.text }}>
            {label}
          </Text>
        )}
        <Input
          variant="outline"
          size="lg"
          style={StyleSheet.flatten([
            { borderColor: colors.border },
            inputStyle,
          ])}
        >
          {leftIcon && <InputSlot className="pl-3">{leftIcon}</InputSlot>}

          <InputField
            ref={ref}
            className="placeholder:text-gray-400 dark:placeholder:text-gray-600"
            style={StyleSheet.flatten([
              { color: colors.text, outline: "none" },
              inputFieldStyle,
            ])}
            selectionColor={colors.primary}
            {...rest}
          />
          {rightIcon && <InputSlot className="pl-3">{rightIcon}</InputSlot>}
        </Input>
      </VStack>
    );
  },
);

export default CustomInput;
