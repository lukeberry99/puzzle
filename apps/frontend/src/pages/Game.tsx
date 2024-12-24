import { Button } from "@/components/ui/button";
import { TableIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";

export default function Game() {
  const [wrongGuess, setWrongGuess] = useState(false);
  const { gameId } = useParams();

  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`game-${gameId}-selected`);
    return saved ? JSON.parse(saved) : [];
  });
  const [solvedIds, setSolvedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`game-${gameId}-solved`);
    return saved ? JSON.parse(saved) : [];
  });
  const [options, setOptions] = useState<Array<{ id: number; title: string }>>(
    [],
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
        setOptions(
          data.tiles
            .map((value: { id: number; title: string }) => ({
              value,
              sort: Math.random(),
            }))
            .sort(
              (
                a: { value: { id: number; title: string }; sort: number },
                b: { value: { id: number; title: string }; sort: number },
              ) => a.sort - b.sort,
            )
            .map(
              ({ value }: { value: { id: number; title: string } }) => value,
            ),
        );
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
        setSolvedIds((prev) => {
          const next = [...prev, ...selectedIds];
          localStorage.setItem(`game-${gameId}-solved`, JSON.stringify(next));
          return next;
        });
        setSelectedIds([]);
        localStorage.setItem(`game-${gameId}-selected`, JSON.stringify([]));
      } else {
        setWrongGuess(true);
        setTimeout(() => {
          setWrongGuess(false);
          setSelectedIds([]);
          localStorage.setItem(`game-${gameId}-selected`, JSON.stringify([]));
        }, 1000);
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
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Play</h1>
          <Button asChild>
            <a href="/">
              <TableIcon /> List
            </a>
          </Button>
        </header>
        {solvedIds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Solved Tiles</h2>
            {connections.map((connection, index) => {
              const connectionTileIds = connection.tiles.map((tile) => tile.id);
              const connectionTiles = options.filter((option) =>
                connectionTileIds.includes(option.id),
              );

              return (
                <div key={index} className="mb-8">
                  <h3 className="text-md font-medium mb-2 text-green-700">
                    {connection.name}
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {connectionTiles.map((option) => (
                      <div
                        key={option.id}
                        className="aspect-square flex items-center justify-center rounded-lg bg-green-500 text-white"
                      >
                        {option.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {options
            .filter((option) => !solvedIds.includes(option.id))
            .map((option) => (
              <div
                key={option.id}
                onClick={() => handleTileClick(option.id)}
                className={`aspect-square flex items-center justify-center rounded-lg transition-colors cursor-pointer
                    ${
                      selectedIds.includes(option.id)
                        ? wrongGuess
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
              >
                {option.title}
              </div>
            ))}
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="mt-4 text-sm text-slate-500">
            Selected: {selectedIds.length}/4
          </div>
          <div className="mt-4 text-sm text-slate-500">
            <Button disabled={selectedIds.length !== 4} onClick={checkTiles}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
