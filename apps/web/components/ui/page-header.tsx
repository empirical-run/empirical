import React from "react";
import { BrandLogo, LogoType } from "./brand-logo";
import { Separator } from "./separator";
import Link from "next/link";
import SharePlaygroundButton from "../share-playground-btn";
import { Dataset } from "@empiricalrun/types";
import { RunResult } from "../../types";

export function PageHeader({
  dataset,
  runs,
}: {
  dataset: Dataset;
  runs: RunResult[];
}) {
  return (
    <header className="sm:p-1 border-b flex flex-row items-center sticky top-0 z-20 bg-black">
      <section className="flex py-1 px-1 sm:px-3 font-bold">
        <Link href="https://www.empirical.run">
          <BrandLogo width={24} height={24} type={LogoType.WHITE_FILL} />
        </Link>
      </section>
      <Separator orientation="vertical" className=" h-6" />
      <div className="flex w-full flex-1 ml-2">
        <span className=" text-sm text-muted-foreground">
          Compare and evaluate AI models across all the scenarios that matter
        </span>
      </div>
      <section className="flex flex-row space-x-4 items-center justify-end">
        <SharePlaygroundButton dataset={dataset} runs={runs} />
      </section>
    </header>
  );
}
