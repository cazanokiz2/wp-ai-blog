"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { OutlineItem } from "@/lib/types";

interface OutlineEditorProps {
  items: OutlineItem[];
  onChange: (items: OutlineItem[]) => void;
}

export default function OutlineEditor({ items, onChange }: OutlineEditorProps) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered);
  };

  const updateText = (id: string, text: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const toggleLevel = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, level: item.level === "h2" ? "h3" : "h2" } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([
      ...items,
      { id: `item-${Date.now()}`, level: "h2", text: "새 섹션" },
    ]);
  };

  return (
    <div className="space-y-2">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="outline">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        snapshot.isDragging ? "bg-indigo-50 border-indigo-300 shadow-md" : "bg-white border-gray-200"
                      } ${item.level === "h3" ? "ml-6" : ""}`}
                    >
                      <span {...drag.dragHandleProps} className="text-gray-400 cursor-grab text-lg">⠿</span>
                      <button
                        onClick={() => toggleLevel(item.id)}
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          item.level === "h2"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.level.toUpperCase()}
                      </button>
                      <input
                        value={item.text}
                        onChange={(e) => updateText(item.id, e.target.value)}
                        className="flex-1 text-sm border-none outline-none bg-transparent"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button
        onClick={addItem}
        className="w-full py-2 text-sm text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        + 항목 추가
      </button>
    </div>
  );
}
