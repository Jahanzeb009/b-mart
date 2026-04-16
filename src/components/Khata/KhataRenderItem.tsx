import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
import {
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheckBig,
} from "lucide-react-native";
import { Text } from "../ui/text";
import { formatCurrency } from "@utils";
import { KhataItemTypes } from "@types";
import { deleteKhata, updateKhata } from "@network";
import { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { calculateTotal } from "@helper";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Box } from "../ui/box";

const KhataRenderItem = ({
  item,
  onRefresh,
  onDelete,
}: {
  item: KhataItemTypes;
  onRefresh: (is_completed?: boolean) => void;
  onDelete: () => void;
}) => {
  const [showMoreText, setShowMoreText] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState(60);
  const [expandedHeight, setExpandedHeight] = useState(0);

  const is_completed = item.is_completed;

  const isPressed = useSharedValue(false);

  const animatedHeight = useSharedValue(0);
  const { colors } = useTheme();

  const created_at = new Date(item.created_at).toLocaleString();
  const totalAmount = +calculateTotal(item.description)!;

  // Animate height when toggle changes
  useEffect(() => {
    if (collapsedHeight === 0 || expandedHeight === 0) return;
    animatedHeight.value = withTiming(
      showMoreText ? expandedHeight : collapsedHeight,
      { duration: 300 },
    );
  }, [showMoreText, collapsedHeight, expandedHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    height: animatedHeight.value + 15, // added 15 to show last line
    overflow: "hidden",
  }));

  const animatedPressableStyle = useAnimatedStyle(() => ({
    borderRadius: withTiming(isPressed.value ? 10 : 5, { duration: 150 }),
    overflow: "hidden",
    transform: [
      {
        scale: withTiming(isPressed.value ? 0.99 : 1, { duration: 150 }),
      },
    ],
  }));

  const completedStyle = {
    textDecorationLine: is_completed ? "line-through" : "none",
    textDecorationColor: "red",
    textDecorationStyle: "double",
  };

  return (
    <Animated.View style={animatedPressableStyle}>
      <Pressable
        style={StyleSheet.flatten([
          styles.card,
          { flex: 1, backgroundColor: colors.card, borderColor: colors.border },
        ])}
        onPress={() => setShowMoreText((pre) => !pre)}
        onPressIn={() => (isPressed.value = true)}
        onPressOut={() => (isPressed.value = false)}
        delayLongPress={800}
        onLongPress={() => {
          impactAsync(ImpactFeedbackStyle.Medium);
          deleteKhata({ id: item.id });
          onDelete();
        }}
      >
        <HStack className="flex-1 p-3 justify-between items-start">
          <VStack className="flex-1 gap-1">
            <Text
              selectable={false}
              size="lg"
              bold
              // @ts-ignore
              style={StyleSheet.flatten([
                { color: colors.text },
                completedStyle,
              ])}
            >
              {item.cust_name}
            </Text>

            {!!item.description && (
              <Animated.View style={animatedStyle}>
                {/* Measure expanded height (all lines) */}
                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    opacity: 0,
                  }}
                  onLayout={(e) => {
                    const h = e.nativeEvent.layout.height;
                    if (h > 0) setExpandedHeight(h + 20);
                  }}
                >
                  <Text
                    selectable={false}
                    size="sm"
                    style={{
                      color: colors.text + "99",
                    }}
                  >
                    {item.description}
                  </Text>
                </View>

                {/* Visible text — no numberOfLines, height controls clipping */}
                <Text
                  selectable={false}
                  size="md"
                  style={{ color: colors.text + "99" }}
                >
                  {item.description}
                </Text>
              </Animated.View>
            )}

            <Text
              selectable={false}
              size="xs"
              style={{ color: colors.text + "60" }}
            >
              {created_at}
            </Text>
          </VStack>
          <VStack className="items-end gap-2">
            <View
              style={StyleSheet.flatten([
                styles.amountBadge,
                {
                  backgroundColor: totalAmount >= 0 ? "#10b98120" : "#ef444420",
                },
              ])}
            >
              <Text
                selectable={false}
                size="md"
                bold
                style={{ color: totalAmount >= 0 ? "#10b981" : "#ef4444" }}
              >
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                const { is_completed } = item;
                onRefresh?.();
                updateKhata({
                  id: item.id,
                  is_completed: !item.is_completed,
                }).catch(() => {
                  onRefresh?.(is_completed);
                });
              }}
              style={{ padding: 5 }}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              {is_completed ? (
                <CircleCheckBig color={colors.primary} />
              ) : (
                <Circle color={"grey"} />
              )}
            </Pressable>
          </VStack>
        </HStack>

        {expandedHeight > collapsedHeight + 10 && (
          <Box
            style={{
              backgroundColor: colors.border,
              paddingVertical: Platform.OS === "web" ? 10 : 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {showMoreText ? (
              <ChevronUp size={24} color={colors.text + "99"} />
            ) : (
              <ChevronDown size={24} color={colors.text + "99"} />
            )}
          </Box>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default KhataRenderItem;

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
