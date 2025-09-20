import {
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Vibration,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { router, Stack, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Chip,
  FAB,
  Icon,
  IconButton,
  Searchbar,
} from "react-native-paper";
import { ProductTypes } from "@/src/types";
import { deleteProducts, getCategories, getProductList } from "@/src/network";
import { ProductRenderItem } from "@/components/ProductRenderItem";
import * as Haptics from "expo-haptics";
import { FlashList, MasonryFlashList } from "@shopify/flash-list";
import { useHeaderHeight } from "@react-navigation/elements";
// console.log(isSearchBarAvailableForCurrentPlatform)

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

const Home = () => {
  const { colors } = useTheme();

  const inset = useSafeAreaInsets();

  const headerHeight = useHeaderHeight();

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

  const getProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProductList();
      setProductList(data);
    } catch (e) {
      console.log({ e });
    } finally {
      setIsLoading(false);
    }
  };
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
      getProducts();
      _getCategories();
    }, [])
  );

  const renderProduct = useCallback(
    ({ item, index }: { item: ProductTypes | null; index: number }) => {
      if (!item) return <View style={{ flex: 1 }} />;
      return (
        <ProductRenderItem
          item={item}
          index={index}
          isEditingMode={isEditingMode}
          isSelected={selectedIds.has(item.id)}
          onPress={toggleSelect}
          onLongPress={() => setIsEditingMode((pre) => !pre)}
        />
      );
    },
    [isEditingMode, selectedIds]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft() {
            if (!isEditingMode) return;
            return (
              <View>
                <Button
                  onPress={() => {
                    Haptics.selectionAsync();

                    setIsEditingMode(false);
                    setSelectedIds(new Set());
                  }}
                  theme={{
                    colors: { primary: colors.primary },
                  }}
                >
                  Cancel
                </Button>
              </View>
            );
          },
          headerRight(props) {
            return (
              <View style={{ flexDirection: "row", gap: 10 }}>
                {isLoading && <ActivityIndicator />}
                <Pressable
                  onPress={() => {
                    setShowSearch((pre) => !pre);
                  }}
                >
                  <Icon source={"magnify"} size={24} />
                </Pressable>
              </View>
            );
          },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MasonryFlashList
          data={formatData(productList, 2)}
          numColumns={2}
          contentContainerStyle={{
            padding: 15,
            paddingTop: headerHeight,
          }}
          keyExtractor={(item) => `${item?.id}_product`}
          renderItem={renderProduct}
          estimatedItemSize={20}
          extraData={{ isEditingMode, selectedIds }}
          ListHeaderComponent={() => {
            return (
              <FlatList
                horizontal
                data={[{ key: "All", id: "all" }, ...categories]}
                showsHorizontalScrollIndicator={false}
                // style={{ marginBottom: 10, maxHeight: 50 }}
                contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
                renderItem={({ item }) => {
                  return (
                    <Chip
                      icon={item.key === "add" ? "plus-circle" : undefined}
                      textStyle={{ textTransform: "capitalize" }}
                      onPress={() => {}}
                    >
                      {item.key}
                    </Chip>
                  );
                }}
              />
            );
          }}
        />

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
          onPress={async () => {
            await Haptics.selectionAsync(); // light tap feedback
            if (isEditingMode) {
              if (!selectedIds.size) return;
              try {
                setIsLoading(true);
                const isDone = await deleteProducts(selectedIds);

                if (isDone) {
                  getProducts();
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
                  categories: JSON.stringify(categories),
                },
              });
          }}
        />
      </View>
    </>
  );
};

export default Home;
