import Image from "next/image";

export enum LogoType {
  WHITE_FILL = "white-fill",
  WHITE_STROKE = "white-stroke",
}

const logoMap = new Map([
  [LogoType.WHITE_FILL, "/images/logo/brand_logo_white_fill_cropped.svg"],
  [LogoType.WHITE_STROKE, "/images/logo/brand_logo_white_stroke.svg"],
]);

export function BrandLogo({
  height,
  width,
  type,
}: {
  height: number;
  width: number;
  type: LogoType;
}) {
  return (
    <Image
      src={logoMap.get(type) || "/images/logo/brand_logo_white_fill.svg"}
      alt="brand logo"
      height={height}
      width={width}
    />
  );
}
