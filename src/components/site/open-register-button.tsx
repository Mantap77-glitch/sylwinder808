"use client";

import { Button } from "@/components/ui/button";

type OpenRegisterButtonProps = {
  children?: React.ReactNode;
};

export function OpenRegisterButton({
  children = "Daftar Sekarang",
}: OpenRegisterButtonProps) {
  return (
    <Button
      size="lg"
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event("player:open-register"));
      }}
    >
      {children}
    </Button>
  );
}