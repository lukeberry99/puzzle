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

const recentConnections = [
  { author: "Luke", date: " 2024-12-23", difficulty: "Hard" },
  { author: "Luke", date: " 2024-12-23", difficulty: "Hard" },
  { author: "Luke", date: " 2024-12-23", difficulty: "Hard" },
  { author: "Luke", date: " 2024-12-23", difficulty: "Hard" },
  { author: "Luke", date: " 2024-12-23", difficulty: "Hard" },
];

export default function Home() {
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
                  <a href={`/game/${idx}`}>{conn.author}</a>
                </TableCell>
                <TableCell>
                  <a href={`/game/${idx}`}>{conn.difficulty}</a>
                </TableCell>
                <TableCell>
                  <a href={`/game/${idx}`}>{conn.date}</a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
