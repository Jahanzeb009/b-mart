import { useEffect, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatCurrency = (number: number) => {
  return currencyFormatter.format(+number);
};

// You can adjust these breakpoints as needed
const MOBILE_MAX_WIDTH = 767;
const TABLET_MAX_WIDTH = 1024;

const { width, height } = Dimensions.get("window");

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "web">(
    getDeviceType(),
  );

  const [dimen, setDimen] = useState({ width, height });

  function getDeviceType() {
    const { width } = Dimensions.get("window");

    if (width <= MOBILE_MAX_WIDTH) return "mobile";
    if (width <= TABLET_MAX_WIDTH) return "tablet";
    return "web";
  }

  useEffect(() => {
    const handler = ({ window: { height, width } }: { window: ScaledSize }) => {
      const type = getDeviceType();
      setDeviceType(type);

      setDimen({ width, height });
    };

    const subscription = Dimensions.addEventListener("change", handler);

    return () => {
      // Remove listener on cleanup (important to prevent leaks)
      subscription.remove();
    };
  }, []);

  return { currentDevice: deviceType, ...dimen };
}
