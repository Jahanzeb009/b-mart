import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import { useTheme } from "@react-navigation/native";
import { VStack } from "../ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Banknote, FileText, User, X } from "lucide-react-native";
import { ActivityIndicator } from "react-native";
import { useEffect, useRef, useState } from "react";
import { createKhata } from "@/src/network";
import { calculateTotal } from "@/src/helper";
import { TextInput } from "react-native";

const AddKhataModal = ({
  showModal,
  onClose,
  onSave,
}: {
  showModal: boolean;
  onSave: () => void;
  onClose: () => void;
}) => {
  const { colors } = useTheme();

  const [isSaving, setIsSaving] = useState(false);
  const [userInput, setUserInput] = useState({
    cust_name: "",
    description: "",
    totalAmount: "0",
  });

  const inputRefs = useRef<Record<string, any>>({});

  const getRef = (name: string) => (ref: any) => {
    inputRefs.current[name] = ref;
  };

  // Auto-focus the first input when modal opens
  useEffect(() => {
    if (showModal) {
      // Small timeout to ensure the modal animation has started/finished
      const timer = setTimeout(() => {
        inputRefs.current["cust_name"]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const resetForm = () => {
    setUserInput({
      cust_name: "",
      description: "",
      totalAmount: "0",
    });
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

  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  return (
    <AlertDialog isOpen={showModal} onClose={onClose} size="lg" avoidKeyboard>
      <AlertDialogBackdrop />
      <AlertDialogContent
        className="bg-background-0"
        style={{ backgroundColor: colors.card }}
      >
        <AlertDialogHeader>
          <Heading
            size="lg"
            className="text-typography-950"
            style={{ color: colors.text }}
          >
            New Khata Entry
          </Heading>
          <AlertDialogCloseButton onPress={onClose}>
            <X size={20} color={colors.text} />
          </AlertDialogCloseButton>
        </AlertDialogHeader>

        <AlertDialogBody className="mt-4 mb-6">
          <VStack className="gap-5">
            {/* Customer Name */}
            <VStack className="gap-1.5">
              <Text size="sm" bold style={{ color: colors.text }}>
                Customer Name
              </Text>
              <Input
                variant="outline"
                size="lg"
                style={{ borderColor: colors.border }}
              >
                <InputSlot className="pl-3">
                  <InputIcon as={User} className="text-typography-400" />
                </InputSlot>

                <InputField
                  ref={getRef("cust_name")}
                  placeholder="Enter customer name"
                  value={userInput.cust_name}
                  onChangeText={handleUserInput("cust_name")}
                  style={{ color: colors.text }}
                  placeholderTextColor={colors.text + "50"}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    inputRefs.current?.description?.focus();
                  }}
                />
              </Input>
            </VStack>

            {/* Total Amount */}
            <VStack className="gap-1.5">
              <Text size="sm" bold style={{ color: colors.text }}>
                Total Amount
              </Text>
              <Input
                isReadOnly
                // ref={re=>re.}
                variant="outline"
                size="lg"
                style={{ borderColor: colors.border }}
              >
                <InputSlot className="pl-3">
                  <InputIcon as={Banknote} className="text-typography-400" />
                </InputSlot>
                <InputField
                  value={userInput.totalAmount}
                  style={{ color: colors.text }}
                  placeholderTextColor={colors.text + "50"}
                />
              </Input>
            </VStack>

            {/* Description */}
            <VStack className="gap-1.5">
              <Text size="sm" bold style={{ color: colors.text }}>
                Description
              </Text>
              <Input
                variant="outline"
                size="xl"
                style={{ borderColor: colors.border, height: 200 }}
              >
                <InputSlot
                  className="pl-3"
                  style={{ alignSelf: "flex-start", paddingTop: 12 }}
                >
                  <InputIcon as={FileText} className="text-typography-400" />
                </InputSlot>
                <InputField
                  ref={getRef("description")}
                  placeholder="Items, notes, or details..."
                  value={userInput.description}
                  onChangeText={(value) => {
                    handleUserInput("description")(value);
                    calculateTotal(value, (sum) => {
                      setUserInput((pre) => ({ ...pre, totalAmount: sum }));
                    });
                  }}
                  multiline
                  textAlignVertical="top"
                  style={{ color: colors.text, paddingTop: 10 }}
                  placeholderTextColor={colors.text + "50"}
                />
              </Input>
            </VStack>
          </VStack>
        </AlertDialogBody>

        <AlertDialogFooter>
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
              <ButtonText>Save Entry</ButtonText>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddKhataModal;
