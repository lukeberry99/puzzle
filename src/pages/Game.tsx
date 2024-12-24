import { Button } from "@/components/ui/button";
import { TableIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "wouter";

export default function Game() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [options, setOptions] = useState<Array<{ id: number; title: string }>>(
    [],
  );
  const [wrongGuess, setWrongGuess] = useState(false);
  const { gameId } = useParams();

  console.log({ gameId });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(`http://localhost:8181/games/${gameId}`);
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
      const response = await fetch("http://localhost:8181/games/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: Number(gameId),
          tile_ids: selectedIds,
        }),
      });

      const data = await response.json();
      if (data.correct) {
        setSolvedIds((prev) => [...prev, ...selectedIds]);
        setSelectedIds([]);
      } else {
        setWrongGuess(true);
        setTimeout(() => {
          setWrongGuess(false);
          setSelectedIds([]);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to check tiles:", error);
      setSelectedIds([]);
    }
  };

  const handleTileClick = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else if (prev.length < 4) {
        return [...prev, id];
      }
      return prev;
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
            <div className="grid grid-cols-4 gap-4">
              {options
                .filter((option) => solvedIds.includes(option.id))
                .map((option) => (
                  <div
                    key={option.id}
                    className="aspect-square flex items-center justify-center rounded-lg bg-green-500 text-white"
                  >
                    {option.title}
                  </div>
                ))}
            </div>
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
