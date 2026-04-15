import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import React from "react";
import { IButtonProps } from "@gluestack-ui/core/lib/esm/button/creator/types";

const CustomAlert = ({
  showAlertDialog,
  title,
  description,
  footer,
  onClose,
}: {
  title: string;
  showAlertDialog: boolean;
  onClose: () => void;
  description: string;
  footer: IButtonProps[];
}) => {
  return (
    <AlertDialog isOpen={showAlertDialog} onClose={onClose} size="md">
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading className="text-typography-950 font-semibold" size="md">
            {title}
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody className="mt-3 mb-4">
          <Text size="sm">{description}</Text>
        </AlertDialogBody>
        <AlertDialogFooter className="">
          {footer?.map((props, index) => {
            return <Button key={index} {...props} />;
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlert;
