import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

interface Connection {
  id: number;
  author: string;
  created_at: string;
  difficulty: Difficulty;
}

type Difficulty = "easy" | "medium" | "hard";

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20",
  hard: "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20",
};

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
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 dark:from-violet-500/5 dark:via-fuchsia-500/5 dark:to-cyan-500/5">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Connections
            </h1>
            <Button className="rounded-full" asChild>
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Link>
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentConnections.map((game) => (
                  <TableRow
                    key={game.id}
                    className="hover:bg-violet-500/5 dark:hover:bg-violet-500/10 cursor-pointer transition-colors"
                    onClick={() => (window.location.href = `/game/${game.id}`)}
                  >
                    <TableCell className="font-medium">{game.id}</TableCell>
                    <TableCell>{game.author}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-medium",
                          difficultyColors[game.difficulty],
                        )}
                      >
                        {game.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(game.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
