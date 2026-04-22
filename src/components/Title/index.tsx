import { Heading } from "tamagui";
import { TitleProps } from "./Title.types";

export default function Title({ text, alignSelf }: TitleProps) {
  return (
    <Heading
      fontSize={24}
      lineHeight="$9"
      fontWeight="700"
      color="#1b5e20"
      alignSelf={alignSelf}
    >
      {text}
    </Heading>
  );
}
