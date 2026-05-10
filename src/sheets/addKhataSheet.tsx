import { useTheme } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import ActionSheet, {
  ScrollView,
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heading } from "../components/ui/heading";
import { VStack } from "../components/ui/vstack";
import CustomInput from "../components/CustomInput";
import { Banknote, FileText, User } from "lucide-react-native";
import { calculateTotal } from "../helper";
import { HStack } from "../components/ui/hstack";
import { Button, ButtonText } from "../components/ui/button";
import { sendKhataPush } from "../network/push";
import { createKhata, updateKhata } from "../network";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { supabase } from "../network/supabase";
import type { User as TUser } from "@supabase/supabase-js";
import { Text } from "../components/ui/text";

const AddKhataSheet = (props: SheetProps<"add-khata-sheet">) => {
  const { colors } = useTheme();

  const uniqueCustNames = props.payload?.uniqueCustNames ?? [];
  const editingItem = props.payload?.item;
  const isEditMode = !!editingItem;

  const [user, setUser] = useState<TUser | null>(null);

  const [isCustInputFocused, setIsCustInputFocused] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [userInput, setUserInput] = useState({
    cust_name: "",
    description: "",
  });

  const [totalAmount, setTotalAmount] = useState("0");

  const inputRefs = useRef<Record<string, any>>({});

  const getRef = (name: string) => (ref: any) => {
    inputRefs.current[name] = ref;
  };
  const inset = useSafeAreaInsets();

  const resetForm = () => {
    setUserInput({
      cust_name: "",
      description: "",
    });
    setTotalAmount("0");
  };

  const handleSave = async () => {
    const { cust_name, description } = userInput;

    if (!cust_name.trim()) return;

    setIsSaving(true);
    try {
      if (isEditMode && editingItem) {
        if (!user?.id) {
          Alert.alert(
            "Authentication Error!",
            "Session expired, Please login again!",
          );
          return;
        }

        const result = await updateKhata({
          id: editingItem.id,
          cust_name: cust_name.trim(),
          description: description.trim(),
          updated_by: user.id,
        });
        if (result) {
          resetForm();
          SheetManager.hide("add-khata-sheet");
        }
      } else {
        if (!user?.id) {
          Alert.alert(
            "Authentication Error!",
            "Session expired, Please login again!",
          );
          return;
        }

        const result = await createKhata({
          cust_name: cust_name.trim(),
          description: description.trim(),
          created_by: user.id,
        });
        if (result) {
          sendKhataPush({
            cust_name: result.cust_name,
            description: result.description,
          });
          resetForm();
          SheetManager.hide("add-khata-sheet");
        }
      }
    } catch (e) {
      console.error("Error saving khata:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserInput = (key: keyof typeof userInput) => (value: any) => {
    setUserInput((pre) => ({ ...pre, [key]: value }));
  };

  const onClose = () => {
    SheetManager.hide("add-khata-sheet");
  };

  return (
    <ActionSheet
      gestureEnabled
      id={props.sheetId}
      keyboardHandlerEnabled={false}
      containerStyle={{
        backgroundColor: colors.background,
        // minHeight: "70%",
        paddingBottom: inset.bottom,
        paddingHorizontal: 15,
        paddingTop: 15,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        // width: Platform.OS === "web" ? 500 : undefined,
      }}
      indicatorStyle={{ backgroundColor: colors.border }}
      onClose={resetForm}
      onOpen={() => {
        if (editingItem) {
          setUserInput({
            cust_name: editingItem.cust_name ?? "",
            description: editingItem.description ?? "",
          });
          calculateTotal(editingItem.description ?? "", (sum) => {
            setTotalAmount(sum);
          });
          setTimeout(() => {
            inputRefs.current.cust_desc?.focus();
          }, 100);
        } else {
          setTimeout(() => {
            inputRefs.current.cust_name?.focus();
          }, 100);
        }
      }}
    >
      <KeyboardAwareScrollView
        bottomOffset={15}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Heading
          size="lg"
          className="text-typography-950"
          style={{ color: colors.text }}
        >
          {isEditMode ? "Update Khata Entry" : "New Khata Entry"}
        </Heading>

        <VStack className="gap-5 mt-5">
          {/* Customer Name */}
          {/* <View> */}
          <CustomInput
            ref={getRef("cust_name")}
            label="Customer Name"
            // suggestions={uniqueCustNames.filter((n) =>
            //   n.toLowerCase().includes(userInput.cust_name.toLowerCase()),
            // )}
            // onPressSuggestion={(sugg) => {
            //   setUserInput((prev) => ({
            //     ...prev,
            //     cust_name: sugg,
            //   }));
            // }}
            onFocus={() => setIsCustInputFocused(true)}
            onBlur={() => setIsCustInputFocused(false)}
            placeholder="Enter customer name"
            value={userInput.cust_name}
            leftIcon={<User color={colors.text} />}
            onChangeText={handleUserInput("cust_name")}
            returnKeyType="next"
            onSubmitEditing={() => {
              inputRefs.current?.cust_desc?.focus();
            }}
          />
          {/* {userInput.cust_name.trim().length > 0 &&
              uniqueCustNames.some((n) =>
                n.toLowerCase().includes(userInput.cust_name.toLowerCase()),
              ) && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    paddingVertical: 8,
                    alignItems: "center",
                  }}
                >
                  {uniqueCustNames
                    .filter((n) =>
                      n
                        .toLowerCase()
                        .includes(userInput.cust_name.toLowerCase()),
                    )
                    .map((n, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          setUserInput((prev) => ({
                            ...prev,
                            cust_name: n,
                          }));
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginRight: 8,
                          borderRadius: 16,
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ color: colors.text }}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              )} */}
          {/* </View> */}

          {/* Total Amount */}
          <CustomInput
            label="Total Amount"
            placeholder="0"
            value={totalAmount}
            editable={false}
            leftIcon={<Banknote color={colors.text} />}
          />

          {/* Description */}
          <CustomInput
            ref={getRef("cust_desc")}
            label="Description"
            multiline
            textAlignVertical="top"
            style={{ minHeight: 100 }}
            containerStyle={{ alignItems: "flex-start" }}
            placeholder="Items, notes, or details..."
            value={userInput.description}
            leftIcon={
              <FileText color={colors.text} style={{ marginTop: 15 }} />
            }
            onChangeText={(value) => {
              handleUserInput("description")(value);
              calculateTotal(value, (sum) => {
                setTotalAmount(sum);
              });
            }}
          />
        </VStack>

        {/* footer button */}
        <HStack className="justify-end gap-3 mt-6">
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            size="md"
            className="rounded-lg"
            style={{ borderColor: colors.border }}
          >
            <ButtonText style={{ color: colors.text }}>Cancel</ButtonText>
          </Button>
          <Button
            action="primary"
            onPress={handleSave}
            isDisabled={
              !userInput.cust_name.trim() ||
              !userInput.description.trim() ||
              isSaving
            }
            size="md"
            className="rounded-lg"
            style={{ backgroundColor: colors.primary }}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ButtonText style={{ color: "white" }}>
                {isEditMode ? "Update Entry" : "Save Entry"}
              </ButtonText>
            )}
          </Button>
        </HStack>
      </KeyboardAwareScrollView>
      {isCustInputFocused && (
        <KeyboardToolbar>
          <KeyboardToolbar.Content style={{
            borderRadius: 100
          }}>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              style={{                borderRadius: 100,
}}
              contentContainerStyle={{
                gap: 5,
                backgroundColor: colors.background,
              }}
            >
              {uniqueCustNames
                .filter((n) =>
                  n.toLowerCase().includes(userInput.cust_name.toLowerCase()),
                )
                .map((n, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setUserInput((prev) => ({
                        ...prev,
                        cust_name: n,
                      }));
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      alignItems: "center",
                      justifyContent: "center",
                      // marginRight: 8,
                      borderRadius: 100,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.text }}>{n}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </KeyboardToolbar.Content>
        </KeyboardToolbar>
      )}
    </ActionSheet>
  );
};

export default AddKhataSheet;
