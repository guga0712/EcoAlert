import { Heading } from "tamagui";
import { TitleProps } from "./Title.types";

export default function Title({ text, alignSelf }: TitleProps) {
  return <Heading fontSize={30} lineHeight="$10" fontWeight="700" alignSelf={alignSelf}>
    {text}
  </Heading>
} 