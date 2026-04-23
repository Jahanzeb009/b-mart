import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@components/ui/alert-dialog";
import { Button, ButtonText } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { useTheme } from "@react-navigation/native";
import { VStack } from "../ui/vstack";
import { Text } from "@components/ui/text";
import { HStack } from "@components/ui/hstack";
import { Banknote, FileText, User, X } from "lucide-react-native";
import { ActivityIndicator } from "react-native";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createKhata } from "@network";
import { sendKhataPush } from "@src/network/push";
import { calculateTotal } from "@helper";
import { TextInput } from "react-native";
import ActionSheet, {
  ActionSheetRef,
  ScrollView,
} from "react-native-actions-sheet";
import CustomInput from "../CustomInput";

const AddKhataModal = forwardRef<
  ActionSheetRef,
  {
    showModal: boolean;
    onSave: () => void;
    onClose: () => void;
  }
>(({ showModal, onClose, onSave }, ref) => {
  const { colors } = useTheme();

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
      const result = await createKhata({
        cust_name: userInput.cust_name.trim(),
        description: description.trim(),
      });

      if (result) {
        sendKhataPush({
          cust_name: result.cust_name,
          description: result.description,
        });
        resetForm();
        onSave();
      }
    } catch (e) {
      console.error("Error saving khata:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserInput = (key: keyof typeof userInput) => (value: any) => {
    // if (key === "amount") {
    //     const match = value.match(/[+-]?\d*\.?\d+/)

    //     setUserInput(pre => ({ ...pre, [key]: match ? match[0] : '' }))
    // } else {
    setUserInput((pre) => ({ ...pre, [key]: value }));
    // }
  };

  return (
    <ActionSheet
      ref={ref}
      gestureEnabled
      containerStyle={{
        backgroundColor: colors.card,
        padding: 15,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
      }}
      indicatorStyle={{ backgroundColor: colors.border }}
      onClose={resetForm}
      onOpen={() => {
        setTimeout(() => {
          inputRefs.current["cust_name"]?.focus();
        }, 100);
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading
          size="lg"
          className="text-typography-950"
          style={{ color: colors.text }}
        >
          New Khata Entry
        </Heading>

        <VStack className="gap-5 mt-5">
          {/* Customer Name */}
          <CustomInput
            label="Customer Name"
            placeholder="Enter customer name"
            value={userInput.cust_name}
            leftIcon={<User color={colors.text} />}
            onChangeText={handleUserInput("cust_name")}
            returnKeyType="next"
            onSubmitEditing={() => {
              inputRefs.current?.description?.focus();
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
              <ButtonText style={{ color: colors.text }}>Save Entry</ButtonText>
            )}
          </Button>
        </HStack>
      </ScrollView>
    </ActionSheet>
  );
});

export default AddKhataModal;
