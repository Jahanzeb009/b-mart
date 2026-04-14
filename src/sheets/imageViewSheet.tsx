import CustomImage from "@/components/CustomImage";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ImageViewSheet = (props: SheetProps<"image-view-sheet">) => {

  const { colors } = useTheme();

  const { height, width } = useWindowDimensions();

  return (
    <ActionSheet
      gestureEnabled
      id={props.sheetId}
      containerStyle={{
        backgroundColor: 'black',
        minHeight: "70%",
        paddingTop: 15,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        width: Platform.OS === "web"?500: undefined
      }}
      indicatorStyle={{ backgroundColor: colors.border }}
    >
      <CustomImage
        source={{ uri: props.payload?.image }}
        width={Platform.OS === "web" ? 500 : width}
        height={height * 0.7}
        resizeMode="contain"
        style={{ backgroundColor: 'black' }}
      />
    </ActionSheet>
  );
};

export default ImageViewSheet;
