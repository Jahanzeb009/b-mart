import React, { useState } from "react";
import { createImage } from "@gluestack-ui/core/image/creator";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { Image as ExpoImage } from "expo-image";
import FastImage from "@d11/react-native-fast-image";
import { useTheme } from "@react-navigation/native";
import { Box } from "../box";

// import FastImage from "@d11/react-native-fast-image";

const imageStyle = tva({
  base: "max-w-full",
  variants: {
    size: {
      "2xs": "h-6 w-6",
      xs: "h-10 w-10",
      sm: "h-16 w-16",
      md: "h-20 w-20",
      lg: "h-24 w-24",
      xl: "h-32 w-32",
      "2xl": "h-64 w-64",
      full: "h-full w-full",
      none: "",
    },
  },
});

const UIImage = createImage({
  Root: FastImage,
});

type ImageProps = VariantProps<typeof imageStyle> &
  React.ComponentProps<typeof UIImage>;
const Image = React.forwardRef<
  React.ComponentRef<typeof UIImage>,
  ImageProps & { className?: string }
>(function Image({ size = "md", className, resizeMode, style, ...props }, ref) {
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const { colors } = useTheme();
  return (
    <Box>
      <UIImage
        className={imageStyle({ size, class: className })}
        {...props}
        contentFit={resizeMode}
        ref={ref}
        onLoadStart={() => setIsLoadingImage(true)}
        onLoadEnd={() => setIsLoadingImage(false)}
        // @ts-expect-error : web only
        style={StyleSheet.flatten([
          ...(Platform.OS === "web"
            ? [
                {
                  height: "revert-layer",
                  width: "revert-layer",
                },
              ]
            : [{}]),

          style,
        ])}
      />
      {isLoadingImage && (
        <ActivityIndicator
          style={StyleSheet.flatten([
            StyleSheet.absoluteFillObject,
            { backgroundColor: "#0009" },
          ])}
        />
      )}
    </Box>
  );
});

Image.displayName = "Image";
export { Image };
