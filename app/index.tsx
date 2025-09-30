import {
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Vibration,
  LayoutAnimation,
  ScrollView,
} from "react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "@react-navigation/native";
import { router, Stack, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Chip,
  FAB,
  HelperText,
  Icon,
  IconButton,
  Searchbar,
  Text,
} from "react-native-paper";
import {
  deleteProducts,
  getCategories,
  getCategoriesRealTime,
  getProductList,
  getProductsRealTime,
} from "@/src/network";
import { ProductRenderItem } from "@/components/ProductRenderItem";
import * as Haptics from "expo-haptics";
import { useHeaderHeight } from "@react-navigation/elements";
import { ProductTypes } from "@/src/types";
import { SheetManager } from "react-native-actions-sheet";
import Fuse from "fuse.js";
import { RectButton } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import StaggeredList from "@mindinventory/react-native-stagger-view";
// console.log(isSearchBarAvailableForCurrentPlatform)
import MasonryList from "@react-native-seoul/masonry-list";
import { collection, onSnapshot } from "@react-native-firebase/firestore";
import { db } from "@/src/network/firebase";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LegendList } from "@legendapp/list";

const formatData = (
  data: (ProductTypes | null)[],
  numColumns: number
): (ProductTypes | null)[] => {
  const newData = [...data];
  const remainder = newData.length % numColumns;

  if (remainder !== 0) {
    const itemsToAdd = numColumns - remainder;
    for (let i = 0; i < itemsToAdd; i++) {
      newData.push(null);
    }
  }

  return newData;
};

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

export const searchProducts = (query: string): ProductTypes[] => {
  if (!query.trim()) return originalData; // return original data
  return fuse.search(query).map((result) => result.item);
};

const Home = () => {
  const { colors } = useTheme();

  const inset = useSafeAreaInsets();

  let { width } = useWindowDimensions();
  width -= 30 + 15;

  const [showSearch, setShowSearch] = useState(false);
  const [productList, setProductList] = useState<ProductTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<{ key: string; id: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<{
    key: string;
    id: string;
  }>({
    id: "all",
    key: "all",
  });

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

  // const getProducts = async () => {
  //   try {
  //     setIsLoading(true);
  //     const data = await getProductList();
  //   } catch (e) {
  //     console.log({ e });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const _getCategories = async () => {
    try {
      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.log("error fetching categories", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // getProducts();
      _getCategories();
    }, [])
  );

  useEffect(() => {
    const categoriesSub = getCategoriesRealTime((category) => {
      try {
        setCategories(category);
        console.log({ category });
        AsyncStorage.setItem("@categories", JSON.stringify(category));
      } catch (e) {
        console.log({ e });
      } finally {
        setIsLoading(false);
      }
    });
    const productSub = getProductsRealTime((products) => {
      try {
        setProductList(products);
        setupFuse(products);
      } catch (e) {
        console.log({ e });
      } finally {
        setIsLoading(false);
      }
    });
    return () => {
      productSub();
      categoriesSub();
    };
  }, []);

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
          onLongPress={() => setIsEditingMode((pre) => !pre)}
        />
      );
    },
    [isEditingMode, categories, selectedIds.size]
  );
  const flatRef = useRef<FlatList>(null);

  const [queryText, setQueryText] = useState("");

  const filterData = useCallback(() => {
    if (queryText) {
      // console.log("running querytext...", { queryText });
      return searchProducts(queryText);
    }

    // console.log({ queryText });

    if (selectedCategory?.key === "all") {
      // console.log(
      // "running selectedCategory?.key === 'all'...",
      // productList.length
      // );
      return productList;
    }
    // console.log("running filter...");
    return productList.filter((product) => {
      return product.product_category === selectedCategory?.key;
    });
  }, [productList, selectedCategory, queryText]);

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

  return (
    <>
      <Stack.Screen
        options={{
          title: "B Mart",
          headerRight(props) {
            return (
              <View style={{ flexDirection: "row", gap: 10 }}>
                {isLoading && <ActivityIndicator color={colors.text} />}

                {isEditingMode && (
                  <RectButton
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
      <Animated.View layout={LinearTransition} style={{ flex: 1 }}>
        <Animated.View
          layout={LinearTransition}
          style={{ backgroundColor: colors.card, paddingVertical: 10 }}
        >
          <ChipsContainer
            ref={flatRef}
            categories={categories}
            selectedCategory={selectedCategory}
            onPress={(item) => {
              Haptics.selectionAsync();
              setSelectedCategory(item);
            }}
          />
          {showSearch && (
            <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
              <Searchbar
                placeholder="Search Product"
                onChangeText={setQueryText}
                value={queryText}
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
                  setQueryText("");
                }}
              />
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View layout={LinearTransition} style={{ flex: 1 }}>
          <FlashList
            data={filterData()}
            keyExtractor={(item): string => item.id}
            // numColumns={2}
            ListEmptyComponent={
              <View
                style={{
                  minHeight: width,

                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text variant="bodyLarge" style={{ color: colors.text }}>
                  No Products Found
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            renderItem={renderProduct}
            extraData={{ isEditingMode }}
            // columnWrapperStyle={{gap: }}
            contentContainerStyle={{
              // gap: 10,
              // paddingHorizontal: 10,
              padding: 10,
              paddingBottom: inset.bottom + 15,
            }}
          />
          {/* <LegendList
            data={filterData()}
            keyExtractor={(item): string => item.id}
            // numColumns={2}
            ListEmptyComponent={
              <View
                style={{
                  minHeight: width,

                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text variant="bodyLarge" style={{ color: colors.text }}>
                  No Products Found
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => renderProduct({ index, item })}
            recycleItems
            extraData={{ isEditingMode }}
            // columnWrapperStyle={{gap: }}
            contentContainerStyle={{
              gap: 10,
              // paddingHorizontal: 10,
              padding: 10,
              paddingBottom: inset.bottom + 15,
            }}
          /> */}
          {/* <MasonryList
            data={filterData()}
            keyExtractor={(item): string => item.id}
            numColumns={2}
            ListEmptyComponent={
              <View
                style={{
                  minHeight: width,

                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text variant="bodyLarge" style={{ color: colors.text }}>
                  No Products Found
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item, i }) => renderProduct({ index: i, item })}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingBottom: inset.bottom + 15,
            }}
          /> */}
        </Animated.View>

        <FAB
          icon={isEditingMode ? "delete" : "plus"}
          style={{
            position: "absolute",
            margin: 16,
            right: 0,
            bottom: inset.bottom,
            borderRadius: 100,
          }}
          color={"white"}
          theme={{
            colors: {
              primaryContainer: colors.primary,
            },
          }}
          onPress={onPressFab}
        />
      </Animated.View>
    </>
  );
};

export default Home;

const ChipsContainer = forwardRef(
  ({ categories, onPress, selectedCategory }, ref) => {
    const { colors } = useTheme();
    // const headerHeight = useHeaderHeight();

    return (
      <FlatList
        horizontal
        ref={ref}
        data={[{ key: "all", id: "all" }, ...categories]}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 10,
          paddingHorizontal: 15,
          // paddingTop: headerHeight + 15,
        }}
        renderItem={({ item, index }) => {
          return (
            <RectButton onPress={() => onPress(item)}>
              <Chip
                textStyle={{ textTransform: "capitalize" }}
                style={{
                  borderWidth: 1,
                  borderColor:
                    selectedCategory?.id === item.id
                      ? colors.primary
                      : colors.border,
                }}
                // theme={{ colors: { primary: colors.primary } }}
                // selectedColor=""
                theme={{
                  roundness: 5,
                  colors: {
                    secondaryContainer:
                      selectedCategory?.id === item.id
                        ? colors.primary
                        : colors.card,
                    onSecondaryContainer:
                      selectedCategory?.id === item.id ? "white" : colors.text,
                  },
                }}
              >
                {item.key}
              </Chip>
            </RectButton>
          );
        }}
      />
    );
  }
);
