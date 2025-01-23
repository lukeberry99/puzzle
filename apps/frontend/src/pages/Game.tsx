import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ListFilter, Moon, Sun } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";

export default function Game() {
  const [wrongGuess, setWrongGuess] = useState(false);
  const { gameId } = useParams();

  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`game-${gameId}-selected`);
    return saved ? JSON.parse(saved) : [];
  });
  const [solvedGroups, setSolvedGroups] = useState<
    Array<{ ids: number[]; linkText: string }>
  >(() => {
    const saved = localStorage.getItem(`game-${gameId}-solved-groups`);
    return saved ? JSON.parse(saved) : [];
  });

  const solvedIds = useMemo(
    () => solvedGroups.flatMap((group) => group.ids),
    [solvedGroups],
  );
  const [options, setOptions] = useState<Array<{ id: number; title: string }>>(
    () => {
      const saved = localStorage.getItem(`game-${gameId}-tiles`);
      return saved ? JSON.parse(saved) : [];
    },
  );
  const [connections, setConnections] = useState<
    Array<{
      tiles: Array<{ id: number }>;
      name: string;
    }>
  >([]);

  const isGameComplete = useMemo(() => {
    return options.length > 0 && solvedIds.length === options.length;
  }, [options.length, solvedIds.length]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!isGameComplete) return;

      try {
        const response = await fetch(
          `https://connections.lberry.dev/api/games/${gameId}/connections`,
        );
        const data = await response.json();
        setConnections(data.connections);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      }
    };

    fetchConnections();
  }, [isGameComplete, gameId]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          `https://connections.lberry.dev/api/games/${gameId}`,
        );
        const data = await response.json();
        const savedTiles = localStorage.getItem(`game-${gameId}-tiles`);
        if (savedTiles) {
          setOptions(JSON.parse(savedTiles));
        } else {
          // Only shuffle once and save the order
          const shuffledTiles = data.tiles
            .map((value: { id: number; title: string }) => ({
              value,
              sort: Math.random(),
            }))
            .sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort)
            .map(
              ({ value }: { value: { id: number; title: string } }) => value,
            );

          localStorage.setItem(
            `game-${gameId}-tiles`,
            JSON.stringify(shuffledTiles),
          );
          setOptions(shuffledTiles);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };

    fetchOptions();
  }, [gameId]);

  const checkTiles = async () => {
    try {
      const response = await fetch(
        "https://connections.lberry.dev/api/games/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game_id: Number(gameId),
            tile_ids: selectedIds,
          }),
        },
      );

      const data = await response.json();
      if (data.correct) {
        setSolvedGroups((prev) => {
          const next = [
            ...prev,
            { ids: selectedIds, linkText: data.link_text },
          ];
          localStorage.setItem(
            `game-${gameId}-solved-groups`,
            JSON.stringify(next),
          );
          return next;
        });
        setSelectedIds([]);
        localStorage.setItem(`game-${gameId}-selected`, JSON.stringify([]));
      } else {
        setWrongGuess(true);
        // First clear the selection
        setSelectedIds([]);
        localStorage.setItem(`game-${gameId}-selected`, JSON.stringify([]));

        // Keep the error message visible
        setTimeout(() => {
          setWrongGuess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to check tiles:", error);
      setSelectedIds([]);
    }
  };

  const handleTileClick = (id: number) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : prev.length < 4
          ? [...prev, id]
          : prev;
      localStorage.setItem(`game-${gameId}-selected`, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 dark:from-violet-500/5 dark:via-fuchsia-500/5 dark:to-cyan-500/5">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <AnimatePresence>
          {wrongGuess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 rounded-lg bg-red-500/90 p-4 text-center text-sm font-medium text-white shadow-lg"
            >
              Those tiles don't form a group. Try again!
            </motion.div>
          )}
        </AnimatePresence>
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/20 backdrop-blur-sm p-6 shadow-2xl">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Connections
            </h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
              >
                <Link href="/">
                  <ListFilter className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </header>
          {solvedIds.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Solved Tiles</h2>
              {connections.length > 0
                ? // Show connections when we have them
                  connections.map((connection, index) => {
                    const connectionTileIds = connection.tiles.map(
                      (tile) => tile.id,
                    );
                    // Maintain the original order of solved tiles within each connection
                    const connectionTiles = options
                      .filter((option) => connectionTileIds.includes(option.id))
                      .sort(
                        (a, b) =>
                          solvedIds.indexOf(a.id) - solvedIds.indexOf(b.id),
                      );

                    return (
                      <div key={index} className="mb-8">
                        <h3 className="text-md font-medium mb-2 text-green-700">
                          {connection.name}
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          {connectionTiles.map((option) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                duration: 0.5,
                              }}
                              className="h-20 flex items-center justify-center rounded-xl bg-emerald-500/90 dark:bg-emerald-500/80 text-white font-medium text-sm shadow-md"
                            >
                              {option.title}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                : // Show groups of 4 until we get connections
                  solvedGroups.map((group, groupIndex) => {
                    // Get solved tiles in their original order
                    const groupTiles = options.filter((option) =>
                      group.ids.includes(option.id),
                    );

                    return (
                      <div key={groupIndex} className="mb-8">
                        {isGameComplete && (
                          <h3 className="text-md font-medium mb-2 text-green-700">
                            {group.linkText}
                          </h3>
                        )}
                        <div className="grid grid-cols-4 gap-4">
                          {groupTiles.map((option) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                duration: 0.5,
                              }}
                              className="h-20 flex items-center justify-center rounded-xl bg-emerald-500/90 dark:bg-emerald-500/80 text-white font-medium text-sm shadow-md"
                            >
                              {option.title}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {options
                .filter((option) => !solvedIds.includes(option.id))
                .map((word) => (
                  <motion.button
                    key={word.id}
                    onClick={() => handleTileClick(word.id)}
                    className={cn(
                      "relative h-20 rounded-xl text-center text-sm font-medium transition-all",
                      "hover:scale-105 active:scale-95",
                      selectedIds.includes(word.id)
                        ? "bg-violet-600 dark:bg-violet-500 text-white shadow-lg"
                        : "bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md",
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      backgroundColor: selectedIds.includes(word.id)
                        ? "#7c3aed"
                        : "#ffffff",
                    }}
                    transition={{
                      duration: 0.1,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center p-2">
                      {word.title}
                    </span>
                  </motion.button>
                ))}
            </AnimatePresence>
          </div>
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Selected: {selectedIds.length}/4
            </div>
            <div className="flex gap-3">
              <button
                className="rounded-full bg-violet-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                disabled={selectedIds.length !== 4}
                onClick={checkTiles}
              >
                Submit
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(`game-${gameId}-selected`);
                  localStorage.removeItem(`game-${gameId}-solved-groups`);
                  localStorage.removeItem(`game-${gameId}-tiles`);
                  window.location.reload();
                }}
                className="rounded-full bg-gray-100 dark:bg-gray-800 px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
