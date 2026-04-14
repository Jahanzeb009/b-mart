import { TABLES } from "@/src/network/contants";
import { supabase } from "@/src/network/supabase";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { NotepadText, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { AddKhataModal, KhataRenderItem } from "@/components/Khata";
import { KhataItemTypes } from "@/src/types";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const KhataList = () => {
  const { colors } = useTheme();
  const inset = useSafeAreaInsets();

  const [khataList, setKhataList] = useState<KhataItemTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchKhataList = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.khata)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching khata:", error.message);
        return;
      }

      if (!data) return;

      const sortedData = data.sort((a, b) => {
        // Step 1: sort by completion status
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1; // incomplete first
        }

        // Step 2: sort by created_at (newest first)
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setKhataList(sortedData ?? []);
    } catch (e) {
      console.error("fetchKhataList error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKhataList();
  }, []);

  const handleRefresh = useCallback((id: string, is_completed?: boolean) => {
    setKhataList((pre) =>
      pre
        .map((_) =>
          _.id === id
            ? {
                ..._,
                is_completed: is_completed ?? !_.is_completed,
              }
            : _,
        )
        .sort((a, b) => {
          if (a.is_completed && !b.is_completed) return 1;
          if (!a.is_completed && b.is_completed) return -1;
          return 0;
        }),
    );
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Khata Book",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "center",
                paddingHorizontal: 5,
                gap: 8,
              }}
            >
              {isLoading ? <ActivityIndicator color={colors.text} /> : null}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowModal(true);
                }}
                style={styles.headerButton}
              >
                <Plus size={20} color={colors.text} strokeWidth={2.5} />
              </Pressable>
            </View>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Animated.FlatList
          data={khataList}
          renderItem={({ item }) => (
            <KhataRenderItem
              item={item}
              onRefresh={(is_completed) => handleRefresh(item.id, is_completed)}
              onDelete={() => {
                setKhataList((pre) => pre.filter((_) => _.id !== item.id));
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 15,
            gap: 10,
            paddingBottom: inset.bottom + 15,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>

      {!isLoading && khataList.length === 0 ? <ListEmptyComponent /> : null}

      <AddKhataModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => {
          setShowModal(false);
          fetchKhataList();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    aspectRatio: 1,
    padding: 5,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default KhataList;

const ListEmptyComponent = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{ ...styles.emptyContainer, ...StyleSheet.absoluteFillObject }}
    >
      <View
        style={{ ...styles.emptyIcon, backgroundColor: colors.primary + "15" }}
      >
        {/* lucide icons can be added here if needed */}
        <NotepadText size={40} color={colors.text} />
      </View>
      <Text size="lg" bold style={{ color: colors.text, marginTop: 16 }}>
        No Khata Entries
      </Text>
      <Text
        size="sm"
        style={{ color: colors.text + "80", marginTop: 4, textAlign: "center" }}
      >
        Tap the + button to add your first entry
      </Text>
    </View>
  );
};
