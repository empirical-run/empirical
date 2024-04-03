import React from "react";
import { BrandLogo, LogoType } from "./brand-logo";
import { Separator } from "./separator";
import Link from "next/link";

export function PageHeader() {
  return (
    <header className="sm:p-1 border-b flex flex-row items-center sticky top-0 z-20">
      <section className="flex py-1 px-1 sm:px-3 font-bold">
        <Link href="https://www.empirical.run">
          <BrandLogo width={24} height={24} type={LogoType.WHITE_FILL} />
        </Link>
      </section>
      <Separator orientation="vertical" className=" h-6" />
      <div className="flex w-full flex-1 ml-2">
        <span className=" text-sm">
          compare and evaluate multiple AI model completions on different
          prompts and model
        </span>
      </div>
    </header>
  );
}
