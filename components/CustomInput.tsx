import React, { forwardRef, JSX } from "react";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, TextInput, ViewStyle } from "react-native";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { Input, InputField, InputSlot, UIInput } from "./ui/input";

type CustomTextInputProps = {
  label?: string;
  containerStyle?: ViewStyle;
  pressableStyle?: ViewStyle;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
} & TextInput["props"];

const CustomInput = forwardRef<typeof UIInput.Input, CustomTextInputProps>(
  (
    {
      label,
      containerStyle,
      // pressableStyle,
      style,
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
          style={{ borderColor: colors.border }}
        >
          {leftIcon && <InputSlot className="pl-3">{leftIcon}</InputSlot>}

          <InputField
            ref={ref}
            style={StyleSheet.flatten([
              { color: colors.text, outline: "none" },
              style,
            ])}
            selectionColor={colors.primary}
            placeholderTextColor={colors.text + "50"}
            {...rest}
          />
          {rightIcon && <InputSlot className="pl-3">{rightIcon}</InputSlot>}
        </Input>
      </VStack>
    );
  },
);

export default CustomInput;
