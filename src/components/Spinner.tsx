import { useState, useEffect } from "react";
import { Text } from "ink";

interface SpinnerProps {
  message?: string;
}

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function Spinner({ message = "Processing..." }: SpinnerProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 80);

    return () => clearInterval(timer);
  }, []);

  return (
    <Text color="cyan">
      {frames[frameIndex]} {message}
    </Text>
  );
}
