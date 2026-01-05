"use client";

import type { BuildState } from "./builder-interface";

interface BuildSummaryProps {
  build: BuildState;
}

export function BuildSummary({ build }: BuildSummaryProps) {
  const calculateTotalPrice = () => {
    let total = 0;
    if (build.cpu?.price) total += build.cpu.price;
    if (build.gpu?.price) total += build.gpu.price;
    if (build.motherboard?.price) total += build.motherboard.price;
    if (build.ram?.price) total += build.ram.price;
    if (build.psu?.price) total += build.psu.price;
    if (build.case?.price) total += build.case.price;
    if (build.cooler?.price) total += build.cooler.price;
    build.storage.forEach(s => total += (s.price || 0));
    return total;
  };

  const parts = [
    { label: "CPU", value: build.cpu?.name, price: build.cpu?.price },
    { label: "GPU", value: build.gpu?.name, price: build.gpu?.price },
    { label: "Motherboard", value: build.motherboard?.name, price: build.motherboard?.price },
    { label: "RAM", value: build.ram?.name, price: build.ram?.price },
    { label: "Storage", value: build.storage.map(s => s.name).join(", ") || null, price: build.storage.reduce((sum, s) => sum + (s.price || 0), 0) || undefined },
    { label: "PSU", value: build.psu?.name, price: build.psu?.price },
    { label: "Case", value: build.case?.name, price: build.case?.price },
    { label: "Cooler", value: build.cooler?.name, price: build.cooler?.price },
  ];

  return (
    <div className="p-6 bg-[#1c1917] border border-[#292524] rounded-xl">
      <h3 className="font-semibold mb-4">Parts List</h3>

      <div className="space-y-2">
        {parts.map((part) => (
          <div key={part.label} className="flex items-center justify-between py-2 border-b border-[#292524] last:border-0">
            <div>
              <span className="text-sm text-stone-400">{part.label}</span>
              {part.value && (
                <p className="text-sm font-medium truncate max-w-[200px]">{part.value}</p>
              )}
            </div>
            {part.price && (
              <span className="text-sm font-medium text-[#c678dd]">${part.price.toFixed(2)}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#292524]">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-[#ff4b4b]">${calculateTotalPrice().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
