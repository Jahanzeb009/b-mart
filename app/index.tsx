import {
  View,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "@react-navigation/native";
import { router, Stack, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip, FAB, IconButton, Searchbar } from "react-native-paper";
import {
  deleteProducts,
  ErrorLog,
  getCategories,
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
import { Box } from "@/components/ui/box";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { Trash2, Plus } from "lucide-react-native";
import { debounce } from "lodash";

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
    const productSub = getProductsRealTime((products) => {
      try {
        setProductList(products);
        setFilterData(products);
        setupFuse(products);
      } catch (e) {
        ErrorLog("productSub = getProductsRealTime", e);
      } finally {
        setIsLoading(false);
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
  }, [queryText, selectedCategory, productList]);

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
              // setFilterData(
              //   productList.filter((product) => {
              //     if (selectedCategory.key === "all") return true;
              //     return product.product_category === selectedCategory?.key;
              //   })
              // );
            }}
          />
          {/* <Animated.View entering={FadeInUp} exiting={FadeOutUp}> */}
          {showSearch && (
            <Searchbar
              placeholder="Search Product"
              onChangeText={
                handleSearchChange
                // setQueryText(text);
                // debounceSearch(text);
              }
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
          {/* </Animated.View> */}
        </View>

        <View style={{ flex: 1 }}>
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

          {/* <List
            data={filterData()}
            key={currentDevice !== "mobile" ? "web_list" : "mobile_list"}
            numColumns={currentDevice !== "mobile" ? 2 : 1}
            keyExtractor={(item): string => item.id}
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
            // renderItem={renderProduct}
            renderItem={({ item }) => {
              return (
                <CardView
                  description={item.product_mrp}
                  uri={item.product_image}
                  title={item.product_name}
                />
              );
            }}
            extraData={{ isEditingMode }}
            // columnWrapperStyle={{gap: }}
            contentContainerStyle={{
              // gap: 10,
              // paddingHorizontal: 10,
              padding: 10,
              paddingBottom: inset.bottom + 100,
            }}
          /> */}
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
        </View>

        {/* <SkeletonView/>

        <GridView/> */}

        <FabButton icon={isEditingMode ? Trash2 : Plus} onPress={onPressFab} />
      </View>
    </>
  );
};

export default Home;

const ChipsContainer = forwardRef<
  FlatList,
  {
    categories: ProductCategoryTypes[];
    onPress: (item: ProductCategoryTypes) => void;
    selectedCategory: ProductCategoryTypes;
  }
>(({ categories, onPress, selectedCategory }, ref) => {
  const { colors } = useTheme();

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
          <RectButton
            style={{
              borderRadius: 100,
            }}
            onPress={() => onPress(item)}
          >
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
});

const FabButton = ({
  onPress,
  icon,
}: {
  onPress: () => void;
  icon: React.ElementType;
}) => {
  const inset = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Fab
      size="lg"
      placement="bottom right"
      isHovered={false}
      isDisabled={false}
      isPressed={false}
      onPress={onPress}
      style={{ marginBottom: inset.bottom, backgroundColor: colors.primary }}
    >
      <FabIcon as={icon} color="white" />
      {/* <FabLabel>Quick start</FabLabel> */}
    </Fab>
  );
};

import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { HStack } from "@/components/ui/hstack";

function SkeletonView() {
  return (
    <Box className="w-[300px] gap-4 p-3 rounded-md bg-background-100">
      <Skeleton variant="sharp" className="h-[100px]" />
      <SkeletonText _lines={3} className="h-2" />
      <HStack className="gap-1 align-middle">
        <Skeleton variant="circular" className="h-[24px] w-[28px] mr-2" />
        <SkeletonText _lines={2} gap={1} className="h-2 w-2/5" />
      </HStack>
    </Box>
  );
}

import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
// import { Image } from "@/components/ui/image";

import { VStack } from "@/components/ui/vstack";
import { useMediaQuery } from "@gluestack-ui/utils/hooks";
import { Image } from "expo-image";

function CardView({ uri, title, description }) {
  const { width } = useWindowDimensions();
  const [isMobile, isTablet, isSmallScreen, isLargeScreen] = useMediaQuery([
    {
      maxWidth: 480,
    },
    // {
    //   minWidth: 481,
    //   maxWidth: 768,
    // },
    // {
    //   minWidth: 769,
    //   maxWidth: 1440,
    // },
    // {
    //   minWidth: 1441,
    // },
  ]);
  return (
    <Card
      className={`lg:w-1/4 md:w-1/3 sm:w-1/2 rounded-lg gap-1 mt-1`}
      style={{ width: isMobile ? width : undefined }}
    >
      <Image
        source={{
          uri: uri, //|| require("../assets/images/icon_grey.png"),
        }}
        className={`h-[300px]    rounded-md`}
        alt="image"
        contentFit="cover"
        style={{
          width: isMobile ? "100%" : undefined,
          height: isMobile ? width / 2 : undefined,
          borderRadius: 10,
        }}
      />
      <Text size="xl" className="font-normal mb-2 text-typography-700">
        {title}
      </Text>
      <Heading size="sm" className="">
        MRP - {description}
      </Heading>
    </Card>
  );
}
