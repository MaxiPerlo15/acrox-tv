"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Program } from "@/domain/programs";
import { programPath } from "@/domain/programs";

type ProgramDirectoryCardProps = {
  program: Program;
};

export default function ProgramDirectoryCard({ program }: ProgramDirectoryCardProps) {
  const [isArtworkUnavailable, setIsArtworkUnavailable] = useState(false);

  return (
    <Link href={programPath(program.slug)} className="program-directory-card" data-program-cover>
      <div className="program-directory-card-art" aria-hidden="true">
        {program.coverLogoSrc && !isArtworkUnavailable ? (
          <Image
            src={program.coverLogoSrc}
            alt=""
            width={320}
            height={320}
            sizes="(max-width: 700px) 100vw, 50vw"
            className="program-directory-card-logo"
            onError={() => setIsArtworkUnavailable(true)}
          />
        ) : (
          <span className="program-directory-card-placeholder">ACROX TV</span>
        )}
      </div>
      <div className="program-directory-card-copy">
        <p>Programa editorial</p>
        <h3>{program.name}</h3>
        <span>{program.summary}</span>
        <strong>Conocer el programa <span aria-hidden="true">↗</span></strong>
      </div>
    </Link>
  );
}
