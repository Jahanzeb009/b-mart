import { TABLES } from "@network/contants";
import { supabase } from "@network/supabase";
import { deleteKhata } from "@network";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable, Alert } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { CheckCheck, NotepadText, Plus, Trash2, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Text } from "@components/ui/text";
import { AddKhataModal, KhataRenderItem } from "@components/Khata";
import { KhataItemTypes } from "@types";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const KhataList = () => {
  const { colors } = useTheme();
  const inset = useSafeAreaInsets();

  const [khataList, setKhataList] = useState<KhataItemTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
      setIsLoading(false);
    } catch (e) {
      console.error("fetchKhataList error:", e);
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

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleEnterEditMode = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const handleCancelEditMode = useCallback(() => {
    setEditMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === khataList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(khataList.map((item) => item.id)));
    }
  }, [khataList, selectedIds.size]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      "Delete Entries",
      `Are you sure you want to delete ${selectedIds.size} ${selectedIds.size === 1 ? "entry" : "entries"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const idsToDelete = Array.from(selectedIds);
            setKhataList((pre) => pre.filter((_) => !selectedIds.has(_.id)));
            setEditMode(false);
            setSelectedIds(new Set());
            await Promise.all(idsToDelete.map((id) => deleteKhata({ id })));
          },
        },
      ],
    );
  }, [selectedIds]);

  return (
    <>
      <Stack.Screen
        options={{
          title: editMode
            ? `${selectedIds.size} Selected`
            : "Khata Book",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerLeft: editMode
            ? () => (
                <Pressable
                  onPress={handleCancelEditMode}
                  style={styles.headerButton}
                >
                  <X size={20} color={colors.text} strokeWidth={2.5} />
                </Pressable>
              )
            : undefined,
          headerRight: () =>
            editMode ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 5,
                  gap: 8,
                }}
              >
                <Pressable
                  onPress={handleSelectAll}
                  style={styles.headerButton}
                >
                  <CheckCheck
                    size={20}
                    color={
                      selectedIds.size === khataList.length
                        ? colors.primary
                        : colors.text
                    }
                    strokeWidth={2.5}
                  />
                </Pressable>
                <Pressable
                  onPress={handleDeleteSelected}
                  style={[
                    styles.headerButton,
                    { opacity: selectedIds.size === 0 ? 0.4 : 1 },
                  ]}
                  disabled={selectedIds.size === 0}
                >
                  <Trash2 size={20} color="#ef4444" strokeWidth={2.5} />
                </Pressable>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "center",
                  paddingHorizontal: 5,
                  gap: 8,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text} />
                ) : null}
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
              editMode={editMode}
              isSelected={selectedIds.has(item.id)}
              onSelect={() => toggleSelect(item.id)}
              onLongPress={() => handleEnterEditMode(item.id)}
              onRefresh={(is_completed) => handleRefresh(item.id, is_completed)}
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
