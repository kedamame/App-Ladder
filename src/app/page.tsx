import { AppLadderShell } from "@/components/app/AppLadderShell";

type HomePageProps = {
  searchParams?: {
    app?: string;
    day?: string;
  };
};

export default function Home({ searchParams }: HomePageProps) {
  return (
    <AppLadderShell
      initialAppId={searchParams?.app}
      initialDay={searchParams?.day}
    />
  );
}
