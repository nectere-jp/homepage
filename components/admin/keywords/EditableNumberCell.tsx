interface EditableNumberCellProps {
  isEditing: boolean;
  defaultValue: string;
  displayValue: string;
  placeholder?: string;
  width: string;
  onStartEdit: () => void;
  onCommit: (raw: string) => void;
}

export function EditableNumberCell({
  isEditing,
  defaultValue,
  displayValue,
  placeholder = "—",
  width,
  onStartEdit,
  onCommit,
}: EditableNumberCellProps) {
  return (
    <div className={`min-h-[28px] flex items-center ${width}`}>
      {isEditing ? (
        <input
          type="text"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full ${width} h-7 px-2 py-1 box-border border border-gray-300 rounded text-sm tabular-nums`}
          autoFocus
          onBlur={(e) => onCommit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          className="text-left w-full min-h-[28px] flex items-center py-0.5 -mx-1 px-1 rounded hover:bg-gray-100 cursor-pointer"
        >
          {displayValue}
        </button>
      )}
    </div>
  );
}
