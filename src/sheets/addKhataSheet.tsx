import { useTheme } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import ActionSheet, {
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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { supabase } from "../network/supabase";
import type { User as TUser } from "@supabase/supabase-js";

const AddKhataSheet = (props: SheetProps<"add-khata-sheet">) => {
  const { colors } = useTheme();

  const editingItem = props.payload?.item;
  const isEditMode = !!editingItem;

  const [user, setUser] = useState<TUser | null>(null);

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
          <CustomInput
            ref={getRef("cust_name")}
            label="Customer Name"
            placeholder="Enter customer name"
            value={userInput.cust_name}
            leftIcon={<User color={colors.text} />}
            onChangeText={handleUserInput("cust_name")}
            returnKeyType="next"
            onSubmitEditing={() => {
              inputRefs.current?.cust_desc?.focus();
            }}
          />

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
            style={{ backgroundColor: colors.primary }}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ButtonText style={{ color: colors.text }}>
                {isEditMode ? "Update Entry" : "Save Entry"}
              </ButtonText>
            )}
          </Button>
        </HStack>
      </KeyboardAwareScrollView>
    </ActionSheet>
  );
};

export default AddKhataSheet;
