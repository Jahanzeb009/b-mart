import { View, Text } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { Button, ButtonProps } from "react-native-paper";
import { selectionAsync } from "expo-haptics";

const CustomButton = ({
  style,
  labelStyle,
  onPress,
  ...props
}: ButtonProps) => {
  const { colors } = useTheme();
  return (
    <Button
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
  );
};

export default CustomButton;
