import React, { useState, useEffect } from 'react';

interface EditableWordProps {
  word: string;
  start: number;
  end: number;
  onSave: (updatedWord: string, updatedStart: number, updatedEnd: number) => void;
}

const EditableWordComponent: React.FC<EditableWordProps> = ({ word, start, end, onSave }) => {
  const [editableWord, setEditableWord] = useState(word);
  const [editableStart, setEditableStart] = useState(start);
  const [editableEnd, setEditableEnd] = useState(end);

  useEffect(() => {
    setEditableWord(word);
    setEditableStart(start);
    setEditableEnd(end);
  }, [word, start, end]);

  const handleSave = () => {
    onSave(editableWord, editableStart, editableEnd);
  };

  return (
    <div className="mt-4 bg-gray-700 p-4 rounded">
      <h3 className="text-lg font-bold mb-2">Edit Current Word</h3>
      <div className="flex flex-col space-y-2">
        <label>
          Word:
          <input
            type="text"
            value={editableWord}
            onChange={(e) => setEditableWord(e.target.value)}
            className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
          />
        </label>
        <label>
          Start Time:
          <input
            type="number"
            value={editableStart}
            onChange={(e) => setEditableStart(parseFloat(e.target.value))}
            className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
            step="0.01"
          />
        </label>
        <label>
          End Time:
          <input
            type="number"
            value={editableEnd}
            onChange={(e) => setEditableEnd(parseFloat(e.target.value))}
            className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
            step="0.01"
          />
        </label>
        <button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-600 focus:outline-none text-white px-4 py-2 rounded mt-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditableWordComponent;