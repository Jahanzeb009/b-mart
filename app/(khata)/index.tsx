import { deleteKhata, updateKhata } from "@network";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  RefreshControl,
  SectionList,
} from "react-native";
import { useRealtimeTable } from "@src/hooks/useRealtimeTable";
import { Stack, useFocusEffect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { CheckCheck, NotepadText, Plus, Trash2, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Text } from "@components/ui/text";
import { KhataRenderItem } from "@components/Khata";
import { KhataItemTypes } from "@types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SheetManager } from "react-native-actions-sheet";
import Svg, { Path } from "react-native-svg";

const PENDING_TOGGLE_DELAY_MS = 15*1000; // 15 Sec

type PendingToggle = { targetValue: boolean; startedAt: number };

const KhataList = () => {
  const { colors } = useTheme();
  const inset = useSafeAreaInsets();

  const [custNames, setCustNames] = useState<Set<string>>(new Set());
  // console.log(custNames);

  const {
    data: khataData,
    lastSyncAt,
    isSyncing,
    refresh,
    sync,
    upsertRows,
    removeRows,
  } = useRealtimeTable<KhataItemTypes>({
    table: "khata",
    selectQuery: `*, 
    created_by_user:created_by (username),
    updated_by_user:updated_by (username)
    `,
  });

  useEffect(() => {
    if (khataData.length) {
      const names = new Set(khataData.map((k) => k.cust_name));
      setCustNames(names);
    }
  }, [khataData]);

  const pendingTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());
  const [pendingToggles, setPendingToggles] = useState<
    Map<string, PendingToggle>
  >(() => new Map());

  const khataDataRef = useRef(khataData);
  useEffect(() => {
    khataDataRef.current = khataData;
  }, [khataData]);

  const pendingTogglesRef = useRef(pendingToggles);
  useEffect(() => {
    pendingTogglesRef.current = pendingToggles;
  }, [pendingToggles]);

  const commitToggle = useCallback(
    async (id: string, targetValue: boolean) => {
      pendingTimeoutsRef.current.delete(id);
      setPendingToggles((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      const cur = khataDataRef.current.find((i) => i.id === id);
      if (!cur || cur.is_completed === targetValue) return;
      upsertRows([{ ...cur, is_completed: targetValue }]);
      try {
        await updateKhata({ id, is_completed: targetValue });
      } catch {
        upsertRows([{ ...cur, is_completed: !targetValue }]);
      }
    },
    [upsertRows],
  );

  const handleTogglePending = useCallback(
    (id: string, targetValue: boolean) => {
      Haptics.selectionAsync();
      const existing = pendingTimeoutsRef.current.get(id);
      if (existing) clearTimeout(existing);
      const timeoutId = setTimeout(
        () => commitToggle(id, targetValue),
        PENDING_TOGGLE_DELAY_MS,
      );
      pendingTimeoutsRef.current.set(id, timeoutId);
      setPendingToggles((prev) => {
        const next = new Map(prev);
        next.set(id, { targetValue, startedAt: Date.now() });
        return next;
      });
    },
    [commitToggle],
  );

  const handleCancelPending = useCallback((id: string) => {
    Haptics.selectionAsync();
    const t = pendingTimeoutsRef.current.get(id);
    if (t) clearTimeout(t);
    pendingTimeoutsRef.current.delete(id);
    setPendingToggles((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      sync();
      return () => {
        // Flush any pending toggles when leaving the screen so nothing silently dies.
        const pending = pendingTogglesRef.current;
        pending.forEach((entry, id) => {
          const t = pendingTimeoutsRef.current.get(id);
          if (t) clearTimeout(t);
          commitToggle(id, entry.targetValue);
        });
      };
    }, [sync, commitToggle]),
  );

  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sectionHeaderHeight, setSectionHeaderHeight] = useState(0);

  const khataList = useMemo(() => {
    const khataSectionArr = khataData.reduce(
      (acc, k) => {
        const key = new Date(k.created_at).toDateString();
        const existing = acc.find((_) => _.title === key);

        if (existing) existing.data.push(k);
        else
          acc.push({
            title: key,
            data: [k],
          });

        return acc;
      },
      [] as Array<{
        title: string;
        data: KhataItemTypes[];
      }>,
    );

    const sorted = khataSectionArr.map((k) => ({
      ...k,
      data: k.data.sort((a, b) => {
        if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;

        const _a = new Date(a.created_at);
        const _b = new Date(b.created_at);

        return _b.getTime() - _a.getTime();
      }),
    }));

    sorted.sort((a, b) => {
      const _a = new Date(a.title);
      const _b = new Date(b.title);

      return _b.getTime() - _a.getTime();
    });

    return sorted;
  }, [khataData]);

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
            removeRows(idsToDelete);
            setEditMode(false);
            setSelectedIds(new Set());
            await Promise.all(idsToDelete.map((id) => deleteKhata({ id })));
          },
        },
      ],
    );
  }, [selectedIds, removeRows]);

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
                {isSyncing ? <ActivityIndicator color={colors.text} /> : null}
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    SheetManager.show("add-khata-sheet", {
                      payload: { uniqueCustNames: Array.from(custNames) },
                    });
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
        <View
          style={{ paddingHorizontal: 15, paddingTop: 4, paddingBottom: 6 }}
        >
          <Text size="xs" style={{ color: colors.text + "70" }}>
            {lastSyncAt
              ? `Last updated: ${new Date(lastSyncAt).toLocaleString()}`
              : "Not synced yet"}
          </Text>
        </View>
        <SectionList
          sections={khataList}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={refresh}
              tintColor={colors.text}
            />
          }
          renderSectionHeader={({ section }) => {
            return (
              <>
                <View
                  onLayout={(e) =>
                    setSectionHeaderHeight(e.nativeEvent.layout.height)
                  }
                  style={{
                    backgroundColor: colors.background,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      opacity: 0.8,
                      fontWeight: "bold",
                    }}
                  >
                    {section.title}
                  </Text>
                </View>

                {sectionHeaderHeight > 0 && (
                  <>
                    <Svg
                      width={20}
                      height={20}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: sectionHeaderHeight,
                      }}
                    >
                      <Path
                        d="M0 0 L20 0 Q0 0 0 20 Z"
                        fill={colors.background}
                      />
                    </Svg>
                    <Svg
                      width={20}
                      height={20}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: sectionHeaderHeight,
                      }}
                    >
                      <Path
                        d="M20 0 L0 0 Q20 0 20 20 Z"
                        fill={colors.background}
                      />
                    </Svg>
                  </>
                )}
              </>
            );
          }}
          stickySectionHeadersEnabled
          renderItem={({ item, index, section }) => {
            const pending = pendingToggles.get(item.id);
            return (
              <KhataRenderItem
                item={item}
                index={index}
                totalCount={section.data.length}
                editMode={editMode}
                isSelected={selectedIds.has(item.id)}
                onSelect={() => toggleSelect(item.id)}
                onLongPress={() => handleEnterEditMode(item.id)}
                onPress={() => {
                  Haptics.selectionAsync();
                  SheetManager.show("add-khata-sheet", {
                    payload: { item, uniqueCustNames: Array.from(custNames) },
                  });
                }}
                pendingTarget={pending?.targetValue}
                pendingStartedAt={pending?.startedAt}
                pendingDelayMs={PENDING_TOGGLE_DELAY_MS}
                onTogglePending={(target) =>
                  handleTogglePending(item.id, target)
                }
                onCancelPending={() => handleCancelPending(item.id)}
              />
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: inset.bottom + 15,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>

      {!isSyncing && khataList.length === 0 ? <ListEmptyComponent /> : null}
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
