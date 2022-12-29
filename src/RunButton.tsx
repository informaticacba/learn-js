import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { SxProps, Theme } from "@mui/system";

interface IProps {
  onRun: () => void;
  sx: SxProps<Theme>;
}

function RunButton({ onRun, sx }: IProps) {
  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      if (ev.altKey && ev.key === "Enter") onRun();
    };

    const eventType = "keydown";
    document.addEventListener(eventType, listener);
    return () => document.removeEventListener(eventType, listener);
  }, [onRun]);

  return (
    <Button onClick={onRun} sx={sx}>
      Run (alt+enter)
    </Button>
  );
}

export default RunButton;
