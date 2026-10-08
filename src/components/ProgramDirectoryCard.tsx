"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Program } from "@/domain/programs";
import { programPath } from "@/domain/programs";

type ProgramDirectoryCardProps = {
  program: Program;
};

export default function ProgramDirectoryCard({ program }: ProgramDirectoryCardProps) {
  const [isArtworkUnavailable, setIsArtworkUnavailable] = useState(false);
  const artworkRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const artwork = artworkRef.current;
    if (!artwork) {
      return;
    }

    const markArtworkUnavailable = () => setIsArtworkUnavailable(true);
    if (artwork.complete && artwork.naturalWidth === 0) {
      markArtworkUnavailable();
    }

    artwork.addEventListener("error", markArtworkUnavailable);
    return () => artwork.removeEventListener("error", markArtworkUnavailable);
  }, []);

  return (
    <Link href={programPath(program.slug)} className="program-directory-card home-projects-teaser-card" data-program-cover data-reveal tabIndex={0}>
      <div className="program-directory-card-art" aria-hidden={!program.coverLogoSrc || isArtworkUnavailable}>
        {program.coverLogoSrc && !isArtworkUnavailable ? (
          <Image
            ref={artworkRef}
            src={program.coverLogoSrc}
            alt={`Logo de ${program.name}`}
            width={320}
            height={320}
            sizes="(max-width: 700px) 100vw, 50vw"
            className="program-directory-card-logo"
            unoptimized
            onError={() => setIsArtworkUnavailable(true)}
          />
        ) : (
          <span className="program-directory-card-placeholder">
            <strong>{program.coverLogoSrc ? "ACROX TV" : program.name}</strong>
            {!program.coverLogoSrc ? <small>Identidad lista para integrar</small> : null}
          </span>
        )}
      </div>
      <div className="program-directory-card-copy home-projects-teaser-copy">
        <div>
          <h3>{program.name}</h3>
          <p>{program.summary}</p>
        </div>
      </div>
    </Link>
  );
}
