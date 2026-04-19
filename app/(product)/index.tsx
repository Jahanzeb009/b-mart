import {
  View,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "@react-navigation/native";
import { router, Stack, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteProducts, getCategories, getProductList } from "@network";
import { ProductRenderItem } from "@components/ProductRenderItem";
import * as Haptics from "expo-haptics";
import { ProductCategoryTypes, ProductTypes } from "@types";
import { SheetManager } from "react-native-actions-sheet";
import Fuse from "fuse.js";
import { RectButton } from "react-native-gesture-handler";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Trash2,
  Plus,
  NotepadText,
  Brackets,
  X,
  Search,
  Package,
  CheckCheck,
} from "lucide-react-native";
import { debounce } from "lodash";
import { ChipsContainer } from "@components/ChipsContainer";
import { VStack } from "@components/ui/vstack";
import { FabButton } from "@components/FabButton";
import { LinearGradient } from "expo-linear-gradient";
import CustomInput from "@components/CustomInput";
import { Box } from "@components/ui/box";
import { Heading } from "@components/ui/heading";
import { Text } from "@components/ui/text";
import { formatCurrency } from "@utils";

const options = {
  keys: ["name", "invoice", "mrp", "category_id"],
  threshold: 0.3,
  includeScore: true,
};

let fuse: Fuse<ProductTypes>;

const setupFuse = (data: ProductTypes[]) => {
  fuse = new Fuse(data, options);
};

const Home = () => {
  const { colors, dark } = useTheme();

  const inset = useSafeAreaInsets();

  let { width } = useWindowDimensions();
  width -= 30 + 15;

  const [showSearch, setShowSearch] = useState(false);
  const [productList, setProductList] = useState<ProductTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<ProductCategoryTypes[]>([]);
  const [queryText, setQueryText] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategoryTypes>({
      id: "",
      name: "all",
    });

  const flatRef = useRef<FlatList>(null);
  const ListRef = useRef<FlashListRef<ProductTypes[]> | null>(null);
  const ScrollViewRef = useRef<ScrollView | null>(null);
  const needsRefresh = useRef(true);
  const userScrollAction = useRef(false);

  const toggleSelect = (id: string) => {
    Haptics.selectionAsync();

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const _getProducts = async () => {
    try {
      const products = await getProductList();
      products.sort((a, b) => {
        const _a = new Date(a.updated_at!);
        const _b = new Date(b.updated_at!);

        return _b.getTime() - _a.getTime();
      });

      // Merge with existing data to preserve references for unchanged items
      setProductList((prev) => {
        if (!prev.length) return products;

        const prevMap = new Map(prev.map((p) => [p.id, p]));
        let hasChanges = products.length !== prev.length;

        const merged = products.map((p) => {
          const existing = prevMap.get(p.id);
          if (existing && existing.updated_at === p.updated_at) {
            return existing; // preserve reference
          }
          hasChanges = true;
          return p;
        });

        return hasChanges ? merged : prev;
      });
      setIsLoading(false);
    } catch (e) {
      console.log("_getProducts error ", e);
      setIsLoading(false);
    }
  };

  const _getCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(cats)) return prev;
        AsyncStorage.setItem("@categories", JSON.stringify(cats));
        return cats;
      });
      setIsLoading(false);
    } catch (e) {
      console.log("_getCategories error ", e);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (needsRefresh.current) {
        needsRefresh.current = false;
        setIsLoading(true);
        _getProducts();
        _getCategories();
      }
      // Mark for refresh when leaving the screen
      return () => {
        needsRefresh.current = true;
      };
    }, []),
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      setQueryText(query);
    }, 250),
    [],
  );

  // Handle text input change
  const handleSearchChange = (text: string) => {
    userScrollAction.current = true;
    debouncedSearch(text);
  };

  // Re-setup fuse when productList changes
  useEffect(() => {
    if (!productList.length) return;
    setupFuse(productList);
  }, [productList]);

  // Derive filtered data with useMemo instead of state + useEffect
  const filterData = useMemo(() => {
    if (!productList.length) return [];

    let filtered = productList;

    // 1. Category filter
    if (selectedCategory && selectedCategory.name !== "all") {
      filtered = filtered.filter((p) => p.category_id === selectedCategory.id);
    }

    // 2. Search with Fuse.js
    if (queryText.trim() && fuse) {
      const result = fuse.search(queryText);
      filtered = result.map((r) => r.item);
    }

    return filtered;
  }, [queryText, selectedCategory, productList]);

  // Scroll to top only on user-driven actions (search/category change), not data refresh
  useEffect(() => {
    if (!userScrollAction.current) return;
    userScrollAction.current = false;
    if (Platform.OS === "web") {
      ScrollViewRef.current?.scrollTo(0);
    } else {
      ListRef.current?.scrollToTop({ animated: true });
    }
  }, [queryText, selectedCategory]);

  const onPressFab = async () => {
    Haptics.selectionAsync();
    if (isEditingMode) {
      if (!selectedIds.size) return;
      try {
        setIsLoading(true);
        const isDone = await deleteProducts(selectedIds);
        console.log("isDone -> ", JSON.stringify(isDone, null, 2));

        if (isDone) {
          setIsEditingMode(false);
          setSelectedIds(new Set());
          needsRefresh.current = true;
          await _getProducts();
        }
        setIsLoading(false);
      } catch (error) {
        console.log("error deleting product", error);
        setIsLoading(false);
      }
    } else {
      needsRefresh.current = true;
      router.navigate({
        pathname: "/(product)/add",
        params: {
          selectedCategory:
            selectedCategory.name === "all"
              ? JSON.stringify({})
              : JSON.stringify(selectedCategory),
        },
      });
    }
  };

  const onLongPress = useCallback((item: ProductTypes) => {
    setIsEditingMode((pre) => !pre);
    setSelectedIds(new Set([item.id]))
  }, []);

  const handleCancelEditMode = useCallback(() => {
    setIsEditingMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filterData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filterData.map((item) => item.id)));
    }
  }, [filterData, selectedIds.size]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      "Delete Products",
      `Are you sure you want to delete ${selectedIds.size} ${selectedIds.size === 1 ? "product" : "products"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const isDone = await deleteProducts(selectedIds);
              if (isDone) {
                setIsEditingMode(false);
                setSelectedIds(new Set());
                needsRefresh.current = true;
                await _getProducts();
              }
              setIsLoading(false);
            } catch (error) {
              console.log("error deleting product", error);
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, [selectedIds]);

  
  const renderProduct = useCallback(
    ({ item, index }: { item: ProductTypes; index: number }) => {
      return (
        <ProductRenderItem
          item={item}
          categories={categories}
          index={index}
          isEditingMode={isEditingMode}
          isSelected={selectedIds.has(item.id)}
          onPress={toggleSelect}
          onLongPress={onLongPress}
        />
      );
    },
    [isEditingMode, categories, selectedIds],
  );

  // Stats bar
  const totalProducts = filterData.length;
  const totalProfit = filterData.reduce(
    (sum, p) => sum + (+p.mrp - +p.invoice),
    0,
  );

  const renderEmptyState = () => (
    <Box className="flex-1 items-center justify-center py-20 px-10">
      <Box
        className="rounded-full p-5 mb-4"
        style={{ backgroundColor: colors.card }}
      >
        <Package color={colors.text + "40"} size={48} />
      </Box>
      <Heading size="lg" style={{ color: colors.text + "60" }} className="mb-2">
        {queryText ? "No results" : "No products yet"}
      </Heading>
      <Text
        className="text-center"
        style={{ color: colors.text + "40" }}
        size="sm"
      >
        {queryText
          ? `Nothing found for "${queryText}"`
          : "Tap + to add your first product"}
      </Text>
    </Box>
  );

  const onShowAllCategories = async () => {
    Haptics.selectionAsync();

    const val = await SheetManager.show("show-all-categories-sheet", {
      payload: {
        categories,
        selectedCategory,
        onPress(index) {
          flatRef.current?.scrollToIndex({
            index,
            animated: true,
          });
        },
      },
    });

    if (val) setSelectedCategory(val);
  };

  const onSearch = () => {
    Haptics.selectionAsync();
    setShowSearch((pre) => !pre);
    setQueryText("");
  };

  const chips = (
    <View
      style={{
        paddingVertical: 10,
        backgroundColor: colors.card,
      }}
    >
      <ChipsContainer
        ref={flatRef}
        categories={categories}
        selectedCategory={selectedCategory}
        onPress={(item) => {
          Haptics.selectionAsync();
          userScrollAction.current = true;
          setSelectedCategory(item);
        }}
      />

      {showSearch && (
        <CustomInput
          rightIcon={
            <X
              size={24}
              color={colors.text}
              style={{ marginRight: 10 }}
              onPress={onSearch}
            />
          }
          placeholder="Search Product"
          onChangeText={handleSearchChange}
          autoFocus
          keyboardAppearance="default"
          containerStyle={{
            marginTop: 15,
            marginHorizontal: 15,
            backgroundColor: colors.background,
          }}
        />
      )}

      {/* Stats strip */}
      {!isLoading && totalProducts > 0 && (
        <Box
          className="flex-row justify-between px-4 pb-2 pt-2"
          style={{ borderTopWidth: 0 }}
        >
          <Text className="text-xs" style={{ color: colors.text + "60" }}>
            {totalProducts} product{totalProducts !== 1 ? "s" : ""}
            {selectedCategory.name !== "all"
              ? ` in ${selectedCategory.name}`
              : ""}
          </Text>
          {totalProfit > 0 && (
            <Text className="text-xs font-medium" style={{ color: "#22c55e" }}>
              Total margin: {formatCurrency(totalProfit)}
            </Text>
          )}
        </Box>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditingMode ? `${selectedIds.size} Selected` : "B Mart",
          headerTitleAlign: "center",
          headerLeft: isEditingMode
            ? () => (
                <Pressable
                  onPress={handleCancelEditMode}
                  style={{ padding: 5 }}
                >
                  <X size={22} color={colors.text} strokeWidth={2.5} />
                </Pressable>
              )
            : undefined,
          headerRight: () =>
            isEditingMode ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 5,
                  gap: 10,
                }}
              >
                {isLoading && <ActivityIndicator color={colors.text} />}
                <Pressable onPress={handleSelectAll} style={{ padding: 5 }}>
                  <CheckCheck
                    size={22}
                    color={
                      selectedIds.size === filterData.length
                        ? colors.primary
                        : colors.text
                    }
                    strokeWidth={2.5}
                  />
                </Pressable>
                <Pressable
                  onPress={handleDeleteSelected}
                  style={{
                    padding: 5,
                    opacity: selectedIds.size === 0 ? 0.4 : 1,
                  }}
                  disabled={selectedIds.size === 0}
                >
                  <Trash2 size={22} color="#ef4444" strokeWidth={2.5} />
                </Pressable>
              </View>
            ) : (
              <View
                style={{
                  gap: 10,
                  paddingHorizontal: 5,
                  flexDirection: "row",
                  paddingRight: Platform.OS === "web" ? 20 : 5,
                }}
              >
                {isLoading && <ActivityIndicator color={colors.text} />}
                <RectButton
                  style={{ borderRadius: 100 }}
                  onPress={async () => {
                    Haptics.selectionAsync();
                    router.navigate("/(khata)");
                  }}
                >
                  <NotepadText size={24} color={colors.text} />
                </RectButton>
                <RectButton onPress={onShowAllCategories}>
                  <Brackets size={24} color={colors.text} />
                </RectButton>
                {!showSearch && (
                  <RectButton onPress={onSearch}>
                    <Search size={24} color={colors.text} />
                  </RectButton>
                )}
              </View>
            ),
        }}
      />
      <View style={{ flex: 1 }}>
        {chips}

        <View style={{ flex: 1 }}>
          {filterData.length === 0 ? (
            renderEmptyState()
          ) : Platform.OS !== "web" ? (
            <FlashList
              // @ts-ignore
              ref={ListRef}
              masonry
              numColumns={2}
              data={filterData}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              estimatedItemSize={280}
              extraData={isEditingMode ? selectedIds : undefined}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              optimizeItemArrangement
              contentContainerStyle={{
                paddingBottom: 150,
                paddingTop: 10,
              }}
            />
          ) : (
            <ScrollView
              ref={ScrollViewRef}
              scrollEventThrottle={16}
              decelerationRate="fast"
            >
              <VStack className="flex-wrap flex-row">
                {filterData.map((item, index) =>
                  renderProduct({ item, index }),
                )}
              </VStack>
            </ScrollView>
          )}
        </View>

        {Platform.OS !== "web" && (
          <LinearGradient
            colors={["transparent", colors.background]}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 150,
            }}
          />
        )}
      </View>
      {Platform.OS !== "ios" && !isEditingMode && (
        <FabButton icon={Plus} onPress={onPressFab} />
      )}
      {!isEditingMode && (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button icon="plus" onPress={onPressFab} />
        </Stack.Toolbar>
      )}
    </>
  );
};

export default Home;
