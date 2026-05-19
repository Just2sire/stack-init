export type GuideEntry = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readTime: string;
};

export const guides: GuideEntry[] = [
  {
    slug: "scaffold-laravel-react",
    title: "How to Scaffold a Laravel + React Project",
    description:
      "Set up a Laravel API backend and a React (Vite) frontend in minutes. Learn how StackInit generates controllers, models, migrations, and routes from a visual schema.",
    date: "2026-05-19",
    tags: ["Laravel", "React", "PHP", "Vite"],
    readTime: "5 min",
  },
  {
    slug: "scaffold-nextjs-prisma",
    title: "How to Scaffold a Next.js App with Prisma",
    description:
      "Generate a full-stack Next.js application with a Prisma schema, typed server actions, and API routes — all wired up from your data models, no boilerplate.",
    date: "2026-05-19",
    tags: ["Next.js", "Prisma", "TypeScript", "Full-stack"],
    readTime: "6 min",
  },
  {
    slug: "scaffold-express-typescript",
    title: "How to Scaffold an Express TypeScript REST API",
    description:
      "Bootstrap a production-ready Express.js API with TypeScript, controllers, services, Prisma ORM, and Swagger docs — generated from your models in under 2 minutes.",
    date: "2026-05-19",
    tags: ["Express", "TypeScript", "REST API", "Node.js"],
    readTime: "5 min",
  },
];
