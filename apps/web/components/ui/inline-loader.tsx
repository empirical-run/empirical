import { MoonLoader } from "react-spinners";

export default function InlineLoader({
  size = 14,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return <MoonLoader color={color} size={size} />;
}
