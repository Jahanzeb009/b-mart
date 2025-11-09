import {
  View,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, Searchbar } from "react-native-paper";
import {
  deleteProducts,
  ErrorLog,
  getCategoriesRealTime,
  getProductsRealTime,
} from "@/src/network";
import { ProductRenderItem } from "@/components/ProductRenderItem";
import * as Haptics from "expo-haptics";
import { ProductCategoryTypes, ProductTypes } from "@/src/types";
import { SheetManager } from "react-native-actions-sheet";
import Fuse from "fuse.js";
import { RectButton } from "react-native-gesture-handler";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDeviceType } from "@/src/utils";
import { Trash2, Plus } from "lucide-react-native";
import { debounce } from "lodash";
import { ChipsContainer } from "@/components/ChipsContainer";
import { VStack } from "@/components/ui/vstack";
import { SkeletonView } from "@/components/SkeletonView";
import { FabButton } from "@/components/FabButton";

// const List = Platform.select({
//   android: FlashList,
//   ios: FlashList,
//   // @ts-ignore
//   web: FlatList,
// });

// const formatData = (
//   data: (ProductTypes | null)[],
//   numColumns: number
// ): (ProductTypes | null)[] => {
//   const newData = [...data];
//   const remainder = newData.length % numColumns;

//   if (remainder !== 0) {
//     const itemsToAdd = numColumns - remainder;
//     for (let i = 0; i < itemsToAdd; i++) {
//       newData.push(null);
//     }
//   }

//   return newData;
// };

const options = {
  keys: ["product_name", "product_invoice", "product_mrp", "product_category"],
  threshold: 0.3,
  includeScore: true,
};

let fuse: Fuse<ProductTypes>;
let originalData: ProductTypes[] = [];

const setupFuse = (data: ProductTypes[]) => {
  originalData = data;
  fuse = new Fuse(data, options);
};

const Home = () => {
  const { colors } = useTheme();

  const inset = useSafeAreaInsets();

  const { currentDevice } = useDeviceType();

  let { width } = useWindowDimensions();
  width -= 30 + 15;

  const [showSearch, setShowSearch] = useState(false);
  const [productList, setProductList] = useState<ProductTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<ProductCategoryTypes[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategoryTypes>({
      id: "all",
      key: "all",
    });

  // const searchProducts = (query: string): ProductTypes[] => {
  //   return;
  // };

  const flatRef = useRef<FlatList>(null);
  const ListRef = useRef<FlashListRef<ProductTypes[]> | null>(null);
  const ScrollViewRef = useRef<ScrollView | null>(null);

  const toggleSelect = (id: string) => {
    Haptics.selectionAsync(); // light tap feedback

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

  useEffect(() => {
    const categoriesSub = getCategoriesRealTime((category) => {
      try {
        setCategories(category);
        AsyncStorage.setItem("@categories", JSON.stringify(category));
      } catch (e) {
        ErrorLog("categoriesSub = getCategoriesRealTime", e);
      } finally {
        setIsLoading(false);
      }
    });
    const productSub = getProductsRealTime(setIsLoadingData, (products) => {
      try {
        setProductList(products);
        setFilterData(products);
        setupFuse(products);
      } catch (e) {
        ErrorLog("productSub = getProductsRealTime", e);
      } finally {
        setIsLoading(false);
        // setIsLoading(false);
      }
    });

    return () => {
      productSub?.();
      categoriesSub?.();
    };
  }, []);

  const [queryText, setQueryText] = useState("");

  const [filterData, setFilterData] = useState<ProductTypes[]>([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      setQueryText(query);
    }, 250),
    []
  );

  // Handle text input change
  const handleSearchChange = (text) => {
    debouncedSearch(text);
  };

  // Filter logic: runs when searchQuery, selectedCategory, or data changes
  useEffect(() => {
    if (!productList.length || !fuse) return;

    let filtered = [...productList];

    // 1. Category filter
    if (selectedCategory && selectedCategory.key !== "all") {
      filtered = filtered.filter(
        (p) => p.product_category === selectedCategory.key.toLowerCase()
      );
    }

    // 2. Search with Fuse.js
    if (queryText.trim()) {
      const result = fuse.search(queryText);
      filtered = result.map((r) => r.item);
    }

    setFilterData(filtered);
    ListRef?.current?.scrollToTop({ animated: true });
  }, [queryText, selectedCategory, productList, ListRef.current]);

  // const debounceSearch = useCallback(
  //   debounce((queryText: string) => {
  //     console.log("queringggggg");
  //     if (queryText.trim()) {
  //       setFilterData(fuse.search(queryText).map((result) => result.item));
  //       return;
  //     }

  //     // if (selectedCategory?.key === "all") {
  //     //   setFilterData(productList);
  //     //   return;
  //     // }

  //     setFilterData(
  //       productList.filter((product) => {
  //         if (selectedCategory.key === "all") return true;
  //         return product.product_category === selectedCategory?.key;
  //       })
  //     );
  //   }, 250),
  //   [productList]
  // );

  // useEffect(() => {
  //   return () => {
  //     debounceSearch.cancel();
  //   };
  // }, [debounceSearch]);

  const onPressFab = async () => {
    Haptics.selectionAsync(); // light tap feedback
    if (isEditingMode) {
      if (!selectedIds.size) return;
      try {
        setIsLoading(true);
        const isDone = await deleteProducts(selectedIds);

        if (isDone) {
          // getProducts();
          setIsEditingMode(false);
        }
      } catch (error) {
        console.log("error deleting product", error);
      } finally {
        setIsLoading(false);
      }
    } else
      router.navigate({
        pathname: "/addProduct",
        params: {
          selectedCategory:
            selectedCategory.key === "all"
              ? JSON.stringify({})
              : JSON.stringify(selectedCategory),
        },
      });
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
    [isEditingMode, categories, selectedIds.size]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight(props) {
            return (
              <View style={{ flexDirection: "row", gap: 10, marginRight: 10 }}>
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
                    <IconButton
                      icon={"close"}
                      size={24}
                      iconColor={colors.text}
                      mode="contained"
                      style={{ margin: 0 }}
                      theme={{
                        colors: {
                          surfaceVariant: colors.background,
                        },
                      }}
                    />
                  </RectButton>
                )}

                <RectButton
                  // activeOpacity={0}
                  style={{
                    borderRadius: 100,
                  }}
                  onPress={async () => {
                    Haptics.selectionAsync();

                    const val = await SheetManager.show(
                      "show-all-categories-sheet",
                      {
                        payload: {
                          categories: [
                            { key: "all", id: "all" },
                            ...categories,
                          ],
                          selectedCategory,
                          onPress(index) {
                            flatRef.current?.scrollToIndex({
                              index,
                              animated: true,
                            });
                          },
                        },
                      }
                    );

                    if (val) setSelectedCategory(val);
                  }}
                >
                  <IconButton
                    icon={"format-list-group"}
                    size={24}
                    style={{ margin: 0 }}
                    mode="contained"
                    iconColor={colors.text}
                    theme={{
                      colors: {
                        surfaceVariant: colors.background,
                      },
                    }}
                  />
                </RectButton>
                <RectButton
                  style={{
                    borderRadius: 100,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowSearch((pre) => !pre);
                    setQueryText("");
                  }}
                >
                  <IconButton
                    icon={!showSearch ? "magnify" : "close"}
                    size={24}
                    iconColor={colors.text}
                    mode="contained"
                    style={{ margin: 0 }}
                    theme={{
                      colors: {
                        surfaceVariant: colors.background,
                      },
                    }}
                  />
                </RectButton>
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
              if (item.key !== "all") {
                setupFuse(
                  productList.filter((pro) => pro.product_category === item.key)
                );
              } else {
                setupFuse(productList);
              }
              Haptics.selectionAsync();
              setSelectedCategory(item);
              if (Platform.OS === "web") {
                ScrollViewRef.current?.scrollTo(0);
              } else {
                ListRef.current?.scrollToTop();
              }
            }}
          />
          {/* <Animated.View entering={FadeInUp} exiting={FadeOutUp}> */}
          {showSearch && (
            <Searchbar
              placeholder="Search Product"
              onChangeText={handleSearchChange}
              // value={queryText}
              placeholderTextColor={"grey"}
              autoFocus
              keyboardAppearance="default"
              style={{
                marginTop: 15,
                marginHorizontal: 15,
                backgroundColor: colors.background,
              }}
              inputStyle={{
                color: colors.text,
              }}
              onClearIconPress={() => {
                setShowSearch(false);
                setFilterData(productList);
                setQueryText("");
              }}
            />
          )}
        </View>

        <View style={{ flex: 1 }}>
          {isLoadingData && (
            <ScrollView scrollEventThrottle={16} decelerationRate={"fast"}>
              <VStack className="flex-wrap flex-row">
                {Array.from({ length: 15 }).map((_, i) => {
                  return <SkeletonView key={i} />;
                })}
              </VStack>
            </ScrollView>
          )}

          {Platform.OS !== "web" ? (
            <FlashList
              ref={ListRef}
              masonry
              numColumns={2}
              data={filterData}
              renderItem={({ index, item }) => renderProduct(item, index)}
              keyExtractor={(item) => item.id.toString()}
              scrollEventThrottle={16}
              decelerationRate={"fast"}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              optimizeItemArrangement
              contentContainerStyle={{ paddingBottom: inset.bottom * 3 }}
            />
          ) : (
            <ScrollView
              ref={ScrollViewRef}
              scrollEventThrottle={16}
              decelerationRate={"fast"}
            >
              <VStack className="flex-wrap flex-row">
                {filterData.map(renderProduct)}
              </VStack>
            </ScrollView>
          )}
        </View>

        <FabButton icon={isEditingMode ? Trash2 : Plus} onPress={onPressFab} />
      </View>
    </>
  );
};

export default Home;
