import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../network/supabase";

type Row = {
  id: string;
  updated_at?: string | null;
  created_at?: string | null;
};

type Options = {
  table: string;
  selectQuery?: string;
  cacheKey?: string;
};

export function useRealtimeTable<T extends Row>({
  table,
  selectQuery = "*",
  cacheKey,
}: Options) {
  const storageKey = cacheKey ?? `cache:${table}`;
  const tsKey = `${storageKey}:lastSyncAt`;

  const [data, setData] = useState<T[]>([]);

  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const dataRef = useRef<T[]>([]);
  const tsRef = useRef<string | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    tsRef.current = lastSyncAt;
  }, [lastSyncAt]);

  const persist = useCallback(
    async (rows: T[], ts: string | null) => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(rows));
        if (ts) await AsyncStorage.setItem(tsKey, ts);
      } catch (e) {
        console.log("[useRealtimeTable] persist error", e);
      }
    },
    [storageKey, tsKey],
  );

  const maxTs = (rows: T[], current: string | null): string | null => {
    let max = current;
    for (const r of rows) {
      const ts = r.updated_at ?? r.created_at ?? null;
      if (ts && (!max || ts > max)) max = ts;
    }
    return max;
  };

  const upsertRows = useCallback(
    (rows: T[]) => {
      if (!rows.length) return;
      const map = new Map(dataRef.current.map((r) => [r.id, r]));
      rows.forEach((r) => map.set(r.id, r));
      const next = Array.from(map.values());
      const ts = maxTs(rows, tsRef.current);
      setData(next);
      setLastSyncAt(ts);
      persist(next, ts);
    },
    [persist],
  );

  const removeRows = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      const set = new Set(ids);
      const next = dataRef.current.filter((r) => !set.has(r.id));
      const ts = new Date().toISOString();
      setData(next);
      setLastSyncAt(ts);
      persist(next, ts);
    },
    [persist],
  );

  const fetchSingleRow = useCallback(
    async (id: string) => {
      const { data: row, error } = await supabase
        .from(table)
        .select(selectQuery)
        .eq("id", id)
        .single();
      if (error || !row) return;
      upsertRows([row as unknown as T]);
    },
    [table, selectQuery, upsertRows],
  );

  const deltaSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      let q = supabase.from(table).select(selectQuery);
      if (tsRef.current) q = q.gt("updated_at", tsRef.current);
      const { data: rows, error } = await q;
      if (error) {
        console.log("[useRealtimeTable] deltaSync error", error.message);
        return;
      }
      if (rows && rows.length > 0) upsertRows(rows as unknown as T[]);
    } finally {
      setIsSyncing(false);
    }
  }, [table, selectQuery, upsertRows]);

  const reconcile = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data: idRows, error } = await supabase
        .from(table)
        .select("id, updated_at");
      if (error) {
        console.log("[useRealtimeTable] reconcile error", error.message);
        return;
      }
      const serverMap = new Map<string, string | null>(
        (idRows ?? []).map((r: any) => [r.id, r.updated_at ?? null]),
      );
      const localMap = new Map<string, string | null>(
        dataRef.current.map((r) => [r.id, r.updated_at ?? null]),
      );

      const toFetch: string[] = [];
      serverMap.forEach((sTs, id) => {
        const lTs = localMap.get(id);
        if (!lTs || (sTs && sTs > lTs)) toFetch.push(id);
      });

      const removedIds = dataRef.current
        .filter((r) => !serverMap.has(r.id))
        .map((r) => r.id);
      if (removedIds.length) removeRows(removedIds);

      if (toFetch.length) {
        const { data: fullRows, error: fErr } = await supabase
          .from(table)
          .select(selectQuery)
          .in("id", toFetch);
        if (!fErr && fullRows && fullRows.length) {
          upsertRows(fullRows as unknown as T[]);
        }
      } else {
        const ts = new Date().toISOString();
        setLastSyncAt(ts);
        persist(dataRef.current, ts);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [table, selectQuery, upsertRows, removeRows, persist]);

  // Hydrate from cache + first delta sync
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cached, cachedTs] = await Promise.all([
          AsyncStorage.getItem(storageKey),
          AsyncStorage.getItem(tsKey),
        ]);
        if (cancelled) return;
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as T[];
            setData(parsed);
            dataRef.current = parsed;
          } catch {}
        }
        if (cachedTs) {
          setLastSyncAt(cachedTs);
          tsRef.current = cachedTs;
        }
      } catch (e) {
        console.log("[useRealtimeTable] hydrate error", e);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageKey, tsKey]);

  useEffect(() => {
    if (!isHydrated) return;
    // Reconcile on cold start so we also catch rows deleted while the app was closed.
    reconcile();
  }, [isHydrated, reconcile]);

  // Sync on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && isHydrated) deltaSync();
    });
    return () => sub.remove();
  }, [isHydrated, deltaSync]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`rt:${table}`)
      .on(
        // @ts-ignore - postgres_changes is a valid event for supabase realtime
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: any) => {
          console.log(`[realtime:${table}] event`, payload.eventType, payload);
          if (payload.eventType === "DELETE") {
            const id = payload.old?.id;
            if (id) removeRows([id]);
          } else {
            const id = payload.new?.id;
            if (id) fetchSingleRow(id);
          }
        },
      )
      .subscribe((status, err) => {
        console.log(
          `[realtime:${table}] subscribe status =`,
          status,
          err ? err.message : "",
        );
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, fetchSingleRow, removeRows]);

  return {
    data,
    setData,
    lastSyncAt,
    isSyncing,
    isHydrated,
    refresh: reconcile,
    sync: deltaSync,
    upsertRows,
    removeRows,
  };
}
