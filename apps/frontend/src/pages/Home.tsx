import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Connection {
  id: number;
  author: string;
  created_at: string;
  difficulty: string;
}

export default function Home() {
  const [recentConnections, setRecentConnections] = useState<Connection[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch(
          "https://connections.lberry.dev/api/games",
        );
        const data = await response.json();
        setRecentConnections(data);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchConnections();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Connections</h1>
          <Button asChild>
            <a href="/create">
              <PlusIcon /> Create
            </a>
          </Button>
        </header>
      </div>
      <div className="container mx-auto mb-8 px-4 py-8">
        <Table className="border rounded-lg">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Author</TableHead>
              <TableHead className="font-semibold">Difficulty</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentConnections.map((conn, idx) => (
              <TableRow
                key={idx}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => (window.location.href = `/game/${conn.id}`)}
              >
                <TableCell className="font-medium">#{conn.id}</TableCell>
                <TableCell>{conn.author}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ring-muted">
                    {conn.difficulty}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(conn.created_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
