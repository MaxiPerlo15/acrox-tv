import type { HomeEnvLinks } from "@/domain/home-content";
import { buildLocalBusinessJsonLd } from "@/domain/home-content";

type HomeJsonLdProps = {
  links: HomeEnvLinks;
};

const HomeJsonLd = ({ links }: HomeJsonLdProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessJsonLd(links)) }}
    />
  );
};

export default HomeJsonLd;
