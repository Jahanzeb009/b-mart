import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheckBig,
} from "lucide-react-native";
import { Text } from "../ui/text";
import { formatCurrency } from "@utils";
import { KhataItemTypes } from "@types";
import { updateKhata } from "@network";
import { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { calculateTotal } from "@helper";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Box } from "../ui/box";

const KhataRenderItem = ({
  item,
  editMode,
  isSelected,
  onSelect,
  onLongPress,
  onRefresh,
  onPress,
  index,
  totalCount,
}: {
  item: KhataItemTypes;
  index: number;
  editMode: boolean;
  totalCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onLongPress: () => void;
  onPress: () => void;
  onRefresh: (is_completed?: boolean) => void;
}) => {
  console.log(item);

  const [showMoreText, setShowMoreText] = useState(false);

  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [expandedHeight, setExpandedHeight] = useState(0);

  const is_completed = item.is_completed;

  const isPressed = useSharedValue(false);

  const animatedHeight = useSharedValue(0);
  const { colors } = useTheme();

  const updated_at = new Date(item.updated_at).toLocaleString();
  {
    ("\n");
  }
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
    height: animatedHeight.value, // added 15 to show last line
    overflow: "hidden",
  }));

  const animatedPressableStyle = useAnimatedStyle(() => ({
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

  const chevronAniStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(showMoreText ? "180deg" : "0deg", { duration: 300 }),
      },
    ],
  }));

  return (
    <Animated.View style={animatedPressableStyle}>
      <Pressable
        style={{
          flex: 1,
          marginTop: index !== 0 ? 3 : 0,
          backgroundColor: isSelected ? colors.primary + "15" : colors.card,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          borderBottomLeftRadius: index === totalCount - 1 ? 20 : 5,
          borderBottomRightRadius: index === totalCount - 1 ? 20 : 5,
          overflow: "hidden",
        }}
        onPress={() => {
          if (editMode) {
            onSelect();
          } else {
            onPress();
          }
        }}
        onPressIn={() => (isPressed.value = true)}
        onPressOut={() => (isPressed.value = false)}
        delayLongPress={500}
        onLongPress={() => {
          if (!editMode) {
            onLongPress();
          }
        }}
      >
        <HStack className="flex-1 p-3 justify-between items-start">
          {editMode && (
            <View style={{ justifyContent: "center", marginRight: 10 }}>
              {isSelected ? (
                <CheckCircle2 size={22} color={colors.primary} />
              ) : (
                <Circle size={22} color={colors.text + "50"} />
              )}
            </View>
          )}
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
                {/* Measure collapsed height */}
                {Platform.OS !== "web" && (
                  <View
                    style={{
                      position: "absolute",
                      width: "100%",
                      opacity: 0,
                    }}
                    onLayout={(e) => {
                      const h = e.nativeEvent.layout.height;
                      if (h > 0) setCollapsedHeight(h);
                    }}
                  >
                    <Text
                      selectable={false}
                      size="md"
                      style={{
                        color: colors.text + "99",
                      }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>
                )}

                {/* Measure expanded height (all lines) */}
                {Platform.OS !== "web" && (
                  <View
                    style={{
                      position: "absolute",
                      width: "100%",
                      opacity: 0,
                    }}
                    onLayout={(e) => {
                      const h = e.nativeEvent.layout.height;
                      if (h > 0)
                        setExpandedHeight(h + (Platform.OS === "web" ? 20 : 0));
                    }}
                  >
                    <Text
                      selectable={false}
                      size="md"
                      style={{
                        color: colors.text + "99",
                      }}
                    >
                      {item.description}
                    </Text>
                  </View>
                )}

                {/* Visible text — no numberOfLines, height controls clipping */}
                <Text
                  selectable={false}
                  size="md"
                  style={StyleSheet.flatten([
                    {
                      color: colors.text + "99",
                    },
                    // @ts-ignore
                    Platform.OS === "web" && { whiteSpace: "nowrap" },
                  ])}
                >
                  {item.description}
                </Text>
              </Animated.View>
            )}

            <HStack className="justify-between">
              <Text
                selectable={false}
                size="xs"
                style={{ color: colors.text + "99", fontStyle: "italic" }}
              >
                {item.user.username}
              </Text>
              <Text
                selectable={false}
                size="xs"
                style={{ color: colors.text + "60" }}
              >
                {updated_at}
              </Text>
            </HStack>
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

        {expandedHeight > collapsedHeight + 10 && Platform.OS !== "web" && (
          <Pressable
            onPress={() => {
              if (editMode) {
                onSelect();
              } else {
                setShowMoreText((pre) => !pre);
              }
            }}
            hitSlop={{ top: 6, bottom: 6, left: 20, right: 20 }}
          >
            <Box
              style={{
                backgroundColor: colors.border + "50",
                paddingVertical: 5,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Animated.View style={chevronAniStyle}>
                <ChevronDown size={24} color={colors.primary + "99"} />
              </Animated.View>
            </Box>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default KhataRenderItem;

const styles = StyleSheet.create({
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
