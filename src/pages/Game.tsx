import { Button } from "@/components/ui/button";
import { TableIcon } from "lucide-react";
import { useState, useEffect } from "react";

const options = [
  { id: 1, tile: "option 1" },
  { id: 2, tile: "option 2" },
  { id: 3, tile: "option 3" },
  { id: 4, tile: "option 4" },
  { id: 5, tile: "option 5" },
  { id: 6, tile: "option 6" },
  { id: 7, tile: "option 7" },
  { id: 8, tile: "option 8" },
  { id: 9, tile: "option 9" },
  { id: 10, tile: "option 10" },
  { id: 11, tile: "option 11" },
  { id: 12, tile: "option 12" },
  { id: 13, tile: "option 13" },
  { id: 14, tile: "option 14" },
  { id: 15, tile: "option 15" },
  { id: 16, tile: "option 16" },
].sort(() => Math.random() - 0.5);

export default function Game() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);

  useEffect(() => {
    if (selectedIds.length === 4) {
      // temp 50% chance of success
      if (Math.random() < 0.5) {
        setSolvedIds((prev) => [...prev, ...selectedIds]);
      }

      // Clear selections either way
      setSelectedIds([]);
    }
  }, [selectedIds]);

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
                    {option.tile}
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
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
              >
                {option.tile}
              </div>
            ))}
        </div>
        <div className="mt-4 text-sm text-slate-500">
          Selected: {selectedIds.length}/4
        </div>
      </div>
    </>
  );
}
