import { TABLES } from "@network/contants";
import { supabase } from "@network/supabase";
import { deleteKhata } from "@network";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  SectionList,
} from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { CheckCheck, NotepadText, Plus, Trash2, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Text } from "@components/ui/text";
import { KhataRenderItem } from "@components/Khata";
import AddKhataModal from "@components/Khata/AddKhataModal";
import { KhataItemTypes } from "@types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Divider } from "react-native-paper";
import { ActionSheetRef } from "react-native-actions-sheet";

const KhataList = () => {
  const { colors } = useTheme();
  const inset = useSafeAreaInsets();

  const [khataList, setKhataList] = useState<
    { title: string; data: KhataItemTypes[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const actionSheetRef = useRef<ActionSheetRef>(null);

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

      const groupedData: { [key: string]: KhataItemTypes[] } = {};
      sortedData.forEach((item) => {
        const dateKey = new Date(item.created_at).toDateString();
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = [];
        }
        groupedData[dateKey].push(item);
      });

      const finalData = Object.keys(groupedData).map((date) => ({
        title: date,
        data: groupedData[date],
      }));

      setKhataList(finalData);
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
      pre.map((section) => ({
        ...section,
        data: section.data
          .map((item) =>
            item.id === id
              ? {
                  ...item,
                  is_completed: is_completed ?? !item.is_completed,
                }
              : item,
          )
          .sort((a, b) => {
            if (a.is_completed !== b.is_completed) {
              return a.is_completed ? 1 : -1;
            }
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }),
      })),
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

  const allIds = khataList.flatMap((s) => s.data.map((i) => i.id));

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === allIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }, [allIds, selectedIds.size]);

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
            setKhataList((pre) =>
              pre
                .map((section) => ({
                  ...section,
                  data: section.data.filter(
                    (item) => !selectedIds.has(item.id),
                  ),
                }))
                .filter((section) => section.data.length > 0),
            );
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
          title: editMode ? `${selectedIds.size} Selected` : "Khata Book",
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
                      selectedIds.size > 0 && selectedIds.size === allIds.length
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
                {isLoading ? <ActivityIndicator color={colors.text} /> : null}
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    actionSheetRef.current?.show();
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

      <View
        style={{ flex: 1, backgroundColor: colors.background }}
        className="w-full md:w-1/2 max-w-[600] self-center"
      >
        <SectionList
          sections={khataList}
          renderSectionHeader={({ section }) => {
            return (
              <View
                style={{
                  backgroundColor: colors.background,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                  {section.title}
                </Text>
              </View>
            );
          }}
          ItemSeparatorComponent={() => (
            <Divider style={{ backgroundColor: colors.text + "60" }} />
          )}
          renderItem={({ item, index, section }) => (
            <KhataRenderItem
              item={item}
              index={index}
              totalCount={section.data.length}
              editMode={editMode}
              isSelected={selectedIds.has(item.id)}
              onSelect={() => toggleSelect(item.id)}
              onLongPress={() => handleEnterEditMode(item.id)}
              onRefresh={(is_completed) => handleRefresh(item.id, is_completed)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: 15,
            padding: 15,
            paddingBottom: inset.bottom + 15,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>

      {!isLoading && khataList.length === 0 ? <ListEmptyComponent /> : null}

      <AddKhataModal
        ref={actionSheetRef}
        showModal={showModal}
        onClose={() => {
          setShowModal(false);
          actionSheetRef.current?.hide();
        }}
        onSave={() => {
          actionSheetRef.current?.hide();
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
