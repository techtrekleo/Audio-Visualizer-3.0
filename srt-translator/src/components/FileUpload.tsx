import { useRef, useState } from 'react';

interface FileUploadProps {
  onFileLoad: (content: string, filename?: string) => void;
  onTextPaste: (content: string) => void;
  subtitleCount: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, onTextPaste, subtitleCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
      setTextInput('');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.srt')) {
      readFile(file);
    } else {
      alert('請上傳 .srt 格式的字幕文件！');
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextPaste(textInput);
      setTextInput('');
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl">📄</span>
        步驟 1: 上傳或貼上 SRT 字幕
      </h2>

      {/* 文件上傳區域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-gray-600 bg-gray-900/30 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-300 mb-4">
            拖放 SRT 文件到這裡，或點擊下方按鈕選擇文件
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold"
          >
            選擇 SRT 文件
          </button>
        </div>
      </div>

      {/* 文本貼上區域 */}
      <div className="mb-4">
        <label className="block text-gray-300 mb-3 font-semibold">
          或直接貼上 SRT 格式文本：
        </label>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="1&#10;00:00:00,000 --> 00:00:05,000&#10;這是第一條字幕&#10;&#10;2&#10;00:00:05,000 --> 00:00:10,000&#10;這是第二條字幕"
          className="w-full h-48 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm resize-none"
        />
        <button
          onClick={handleTextSubmit}
          disabled={!textInput.trim()}
          className="mt-3 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          解析文本
        </button>
      </div>

      {/* 顯示已解析的字幕數量 */}
      {subtitleCount > 0 && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-semibold flex items-center gap-2">
            <span className="text-xl">✅</span>
            成功解析 {subtitleCount} 條字幕！
          </p>
        </div>
      )}
    </div>
  );
};

