import { View, Text } from "react-native";
import React, { forwardRef } from "react";
import { useTheme } from "@react-navigation/native";
import { TextInput, TextInputProps } from "react-native-paper";

interface CustomTextInputProps extends TextInputProps {
  label: string;
}

const CustomInput = forwardRef<any, CustomTextInputProps>(
  ({ label, ...rest }, ref) => {
    const { colors } = useTheme();

    return (
      <TextInput
        ref={ref}
        mode="outlined"
        label={label}
        theme={{
          colors: {
            primary: colors.primary,
            background: colors.card,
            onSurface: colors.text,
            outline: "grey",
            onSurfaceVariant: "grey",
          },
        }}
        {...rest}
      />
    );
  }
);

export default CustomInput;
