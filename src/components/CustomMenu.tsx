import {
  MenuAction,
  MenuComponentRef,
  MenuView,
} from "@react-native-menu/menu";
import { forwardRef } from "react";

const MenuItem = forwardRef<
  MenuComponentRef,
  {
    data: MenuAction[];
    title?: string;
    onValueSelect?: (value: string) => void;
    children: React.ReactNode;
  }
>(({ title, data, onValueSelect, children }, ref) => {
  return (
    <MenuView
      ref={ref}
      title={title}
      // themeVariant=""
      onPressAction={({ nativeEvent }) => onValueSelect?.(nativeEvent.event)}
      actions={data}
      shouldOpenOnLongPress={false}
    >
      {children}
    </MenuView>
  );
});

export default MenuItem;
