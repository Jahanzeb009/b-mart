import {
  View,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { router, Stack, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, Searchbar } from "react-native-paper";
import { deleteProducts, getCategories, getProductList } from "@/src/network";
import { ProductRenderItem } from "@/components/ProductRenderItem";
import * as Haptics from "expo-haptics";
import { ProductCategoryTypes, ProductTypes } from "@/src/types";
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
} from "lucide-react-native";
import { debounce } from "lodash";
import { ChipsContainer } from "@/components/ChipsContainer";
import { VStack } from "@/components/ui/vstack";
import { SkeletonView } from "@/components/SkeletonView";
import { FabButton } from "@/components/FabButton";
import { LinearGradient } from "expo-linear-gradient";
import CustomInput from "@/components/CustomInput";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { formatCurrency } from "@/src/utils";

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

  const [filterData, setFilterData] = useState<ProductTypes[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategoryTypes>({
      id: "",
      name: "all",
    });

  const flatRef = useRef<FlatList>(null);
  const ListRef = useRef<FlashListRef<ProductTypes[]> | null>(null);
  const ScrollViewRef = useRef<ScrollView | null>(null);

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
      setProductList(products);
      setFilterData(products);
      setupFuse(products);
    } catch (e) {
      console.log("_getProducts error ", e);
    } finally {
      setIsLoading(false);
    }
  };
  const _getCategories = async () => {
    try {
      const categories = await getCategories();
      setCategories(categories);
      AsyncStorage.setItem("@categories", JSON.stringify(categories));
    } catch (e) {
      console.log("_getCategories error ", e);
    } finally {
      setIsLoading(false);
    }
  };

  const debounceGetData = useCallback(
    debounce(() => {
      setIsLoading(true);
      _getProducts();
      _getCategories();
    }, 500),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      debounceGetData();
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
    debouncedSearch(text);
  };

  // Filter logic: runs when searchQuery, selectedCategory, or data changes
  useEffect(() => {
    if (!productList.length || !fuse) return;

    let filtered = [...productList];

    // 1. Category filter
    if (selectedCategory && selectedCategory.name !== "all") {
      filtered = filtered.filter((p) => p.category_id === selectedCategory.id);
    }

    // 2. Search with Fuse.js
    if (queryText.trim()) {
      const result = fuse.search(queryText);
      filtered = result.map((r) => r.item);
    }

    setFilterData(filtered);
    ListRef?.current?.scrollToTop({ animated: true });
  }, [queryText, selectedCategory, productList, ListRef.current]);

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
          await _getProducts();
        }
      } catch (error) {
        console.log("error deleting product", error);
      } finally {
        setIsLoading(false);
      }
    } else {
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

  const renderProduct = useCallback(
    (item: ProductTypes, index: number) => {
      return (
        <ProductRenderItem
          key={index}
          item={item}
          categories={categories}
          index={index}
          isEditingMode={isEditingMode}
          isSelected={selectedIds.has(item.id)}
          onPress={toggleSelect}
          onLongPress={() => setIsEditingMode((pre) => !pre)}
        />
      );
    },
    [isEditingMode, categories, selectedIds.size],
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

  // const renderSkeleton = () => (
  //   <VStack className="flex-wrap flex-row">
  //     {Array.from({ length: 6 }).map((_, i) => (
  //       <SkeletonView key={i} />
  //     ))}
  //   </VStack>
  // );

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

  return (
    <>
      <Stack.Screen
        options={{
          headerRight(props) {
            return (
              <View
                style={{
                  gap: 10,
                  paddingHorizontal: 5,
                  flexDirection: "row",
                  paddingRight: Platform.OS === "web" ? 20 : 5,
                }}
              >
                {isLoading && <ActivityIndicator color={colors.text} />}

                {isEditingMode && (
                  <RectButton
                    style={{
                      borderRadius: 100,
                    }}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setIsEditingMode(false);
                      setSelectedIds(new Set());
                    }}
                  >
                    <X size={24} color={colors.text} />
                  </RectButton>
                )}

                <RectButton
                  style={{
                    borderRadius: 100,
                  }}
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
            );
          },
        }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: colors.card, paddingVertical: 10 }}>
          <ChipsContainer
            ref={flatRef}
            categories={categories}
            selectedCategory={selectedCategory}
            onPress={(item) => {
              if (item.name !== "all")
                setupFuse(
                  productList.filter((pro) => pro.category_id === item.id),
                );
              else setupFuse(productList);

              Haptics.selectionAsync();
              setSelectedCategory(item);
              if (Platform.OS === "web") {
                ScrollViewRef.current?.scrollTo(0);
              } else {
                ListRef.current?.scrollToTop();
              }
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
              placeholderTextColor={"grey"}
              keyboardAppearance="default"
              containerStyle={{
                marginTop: 15,
                marginHorizontal: 15,
                backgroundColor: colors.background,
              }}
              pressableStyle={{ flex: undefined }}
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
                <Text
                  className="text-xs font-medium"
                  style={{ color: "#22c55e" }}
                >
                  Total margin: {formatCurrency(totalProfit)}
                </Text>
              )}
            </Box>
          )}

          {/* Selection count bar */}
          {isEditingMode && selectedIds.size > 0 && (
            <Box
              className="px-4 py-2"
              style={{
                backgroundColor: dark
                  ? colors.primary + "20"
                  : colors.primary + "10",
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: colors.primary }}
              >
                {selectedIds.size} selected
              </Text>
            </Box>
          )}
        </View>

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
              renderItem={({ index, item }) => renderProduct(item, index)}
              keyExtractor={(item) => item.id.toString()}
              scrollEventThrottle={16}
              decelerationRate="fast"
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              optimizeItemArrangement
              contentContainerStyle={{ paddingBottom: inset.bottom * 3 }}
            />
          ) : (
            <ScrollView
              ref={ScrollViewRef}
              scrollEventThrottle={16}
              decelerationRate="fast"
            >
              <VStack className="flex-wrap flex-row">
                {filterData.map(renderProduct)}
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
              height: 250,
            }}
          />
        )}

        <FabButton icon={isEditingMode ? Trash2 : Plus} onPress={onPressFab} />
      </View>
    </>
  );
};

export default Home;
