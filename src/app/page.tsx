import { ListContainer } from "@/src/modules/list/components/list-container";

export const dynamic = "force-dynamic";

type ListPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function ListPage({ searchParams }: ListPageProps) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";

  return <ListContainer key={query} query={query} />;
}
