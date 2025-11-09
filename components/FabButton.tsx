import React from "react";
import { useTheme } from "@react-navigation/native";
import { Fab, FabIcon } from "./ui/fab";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const FabButton = ({
  onPress,
  icon,
}: {
  onPress: () => void;
  icon: React.ElementType;
}) => {
  const inset = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Fab
      size="lg"
      placement="bottom right"
      isHovered={false}
      isDisabled={false}
      isPressed={false}
      onPress={onPress}
      style={{ marginBottom: inset.bottom, backgroundColor: colors.primary }}
    >
      <FabIcon as={icon} color="white" />
    </Fab>
  );
};
