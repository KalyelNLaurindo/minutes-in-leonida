import { createFileRoute } from "@tanstack/react-router";
import LeonidaApp from "@/app/LeonidaApp";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minutes in Leonida — Sua vez de jogar" },
      {
        name: "description",
        content:
          "Gerencie turnos de 20 minutos entre amigos, com sorteio, alertas e histórico local.",
      },
      { property: "og:title", content: "Minutes in Leonida" },
      {
        property: "og:description",
        content: "O relógio da sua noite em Leonida. Um controle, a vez de todo mundo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeonidaApp,
});
