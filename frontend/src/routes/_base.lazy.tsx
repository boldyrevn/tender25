import { Sidebar } from "@/components/sidebar/Sidebar";
import {
  createLazyFileRoute,
  useMatch,
  useMatches,
} from "@tanstack/react-router";
import React from "react";

const AnimatedOutlet = React.lazy(() =>
  import("@/components/router/animated-outlet").then((m) => ({
    default: m.AnimatedOutlet,
  })),
);

const AnimatePresence = React.lazy(() =>
  import("framer-motion").then((m) => ({ default: m.AnimatePresence })),
);

const Page = () => {
  const matches = useMatches();
  const match = useMatch({ strict: false });
  const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1;
  const nextMatch = matches[nextMatchIndex];

  return (
    <>
      <Sidebar />
      <AnimatePresence mode="popLayout">
        <AnimatedOutlet key={nextMatch.id} />
      </AnimatePresence>
    </>
  );
};

export const Route = createLazyFileRoute("/_base")({
  component: Page,
});
