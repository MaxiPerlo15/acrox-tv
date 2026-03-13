"use client";

import type { ReactNode } from "react";
import { CONTACT_PRESET_EVENT, CONTACT_PRESET_KEY } from "@/domain/contact-preset";
import type { ContactServiceValue } from "@/domain/contact";

type PrefillContactCtaProps = {
  href: string;
  className?: string;
  servicePreset: ContactServiceValue;
  children: ReactNode;
};

const PrefillContactCta = ({ href, className, servicePreset, children }: PrefillContactCtaProps) => {
  const handleClick = () => {
    window.sessionStorage.setItem(CONTACT_PRESET_KEY, servicePreset);
    window.dispatchEvent(
      new CustomEvent(CONTACT_PRESET_EVENT, {
        detail: { service: servicePreset }
      })
    );
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};

export default PrefillContactCta;
