"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full form-input text-left flex items-center justify-between cursor-pointer"
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-2" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 glass-card-strong rounded-xl shadow-2xl overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-foreground hover:bg-white/10 transition-all duration-300 border-b border-white/5 last:border-b-0 focus:outline-none focus:bg-white/10"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}