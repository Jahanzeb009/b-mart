import CustomImage from "@/components/CustomImage";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ImageViewSheet = (props: SheetProps<"image-view-sheet">) => {
  const [categoryName, setCategoryName] = useState("");

  const inset = useSafeAreaInsets();
  const { colors } = useTheme();

  const { height, width } = useWindowDimensions();

  return (
    <ActionSheet
      gestureEnabled
      id={props.sheetId}
      containerStyle={{
        backgroundColor: colors.border,
        minHeight: "70%",
        paddingTop: 15,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
      }}
      indicatorStyle={{ backgroundColor: colors.card }}
    >
      <CustomImage
        source={{ uri: props.payload?.image }}
        width={width}
        height={height * 0.7}
        resizeMode="contain"
        style={{ backgroundColor: colors.border }}
      />
    </ActionSheet>
  );
};

export default ImageViewSheet;
