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
  id: int;
  author: string;
  created_at: string;
  difficulty: string;
}

export default function Home() {
  const [recentConnections, setRecentConnections] = useState<Connection[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch("http://localhost:8181/games");
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentConnections.map((conn, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <a href={`/game/${conn.id}`}>{conn.author}</a>
                </TableCell>
                <TableCell>
                  <a href={`/game/${conn.id}`}>{conn.difficulty}</a>
                </TableCell>
                <TableCell>
                  <TableCell>
                    <a href={`/game/${conn.id}`}>
                      {new Date(conn.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </a>
                  </TableCell>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
