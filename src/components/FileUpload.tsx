import { useRef, useState, type ChangeEvent } from 'react'

interface FileUploadProps {
  accept?: string
  onUpload: (file: File) => void
  loading?: boolean
}

export function FileUpload({ accept = '.csv', onUpload, loading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    if (file) onUpload(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      className={`drop-zone ${dragging ? 'dragging' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleChange}
      />
      {loading ? (
        <div className="drop-zone-text">Uploading...</div>
      ) : (
        <div className="drop-zone-text">
          <strong>Click to upload</strong> or drag and drop<br />a <strong>{accept}</strong> file
        </div>
      )}
    </div>
  )
}
