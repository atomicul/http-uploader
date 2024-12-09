import { useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegTimesCircle } from "react-icons/fa";
import { CgSpinnerTwo } from "react-icons/cg";


import FileAdder, { RefType as FileAdderRef } from "./FileAdder";
import humanFileSize from "./utils/humanReadableFileSize";
import UiFile, { Status } from "./types/UiFile";

const statusIconMap: Map<Status, any> = new Map([
  ["ready", <FaRegCircle />],
  ["uploading", <CgSpinnerTwo className="animate-spin" />],
  ["done", <FaRegCheckCircle />],
  ["error", <FaRegTimesCircle />],
]);

function App() {
  const fileAdderRef = useRef<null | FileAdderRef>(null);
  const [files, setFiles] = useState<UiFile[]>([]);

  const setStatus = (file: UiFile, status: Status) => {
    setFiles((files) => {
      const filesCopy = Array.from(files.map(file => file.clone()));

      const fileToModify = filesCopy.find(f => f.id === file.id)
      if (fileToModify)
        fileToModify.status = status;

      return filesCopy;
    });
  }

  const handleAddFiles = (f: File[]) => {
    setFiles([...files, ...f.map((f) => UiFile.fromFile(f))]);
  }

  const handleRemoveFiles = (file: UiFile) => { setFiles(fs => fs.filter(f => f.id !== file.id)) }

  const handleDrop = (ev: React.DragEvent<HTMLElement>) => {
    ev.preventDefault();

    const files = Array
      .from(ev.dataTransfer.items)
      .map(item => item.getAsFile())
      .filter(file => file !== null);

    handleAddFiles(files);
  }

  const handlePaste = (ev: React.ClipboardEvent<HTMLElement>) => {
    ev.preventDefault();

    const files = Array.from(ev.clipboardData.files);
    handleAddFiles(files);
  }

  const handleUploadFile = async (file: UiFile) => {
    if (!file.uploadable)
      return;

    setStatus(file, "uploading");

    try {
      let url = import.meta.env.VITE_BACKEND_URL;
      url ??= `http://${location.hostname}:${import.meta.env.VITE_BACKEND_PORT ?? 80}`

      const res = await fetch(url + "/" + file.name, {
        method: "POST",
        body: file.file
      })

      if (res.ok) {
        setStatus(file, "done");
      } else {
        setStatus(file, "error");
      }
    } catch {
      setStatus(file, "error");
    }
  }

  const handleUploadAll = () => { files.forEach(f => handleUploadFile(f)) }
  const handleRemoveUploaded = () => { setFiles(files.filter(f => f.status !== "done")); }

  return <main
    onDrop={handleDrop}
    onDragOver={(ev) => { ev.preventDefault() }}
    onPaste={handlePaste}
    className="h-svh p-8 gap-6 overflow-hidden flex flex-col">

    <h1 className="text-xl">File uploader</h1>

    <section className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
      <table className="table table-sm">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Filetype</th>
            <th>Size</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, idx) => (
            <tr key={file.id}>
              <th>{idx + 1}</th>
              <td className="max-w-16 truncate">{file.name}</td>
              <td>{file.file.type || "other"}</td>
              <td>{humanFileSize(file.file.size)}</td>
              <td>{<button onClick={() => handleUploadFile(file)} className="text-xl text-center relative left-1">{statusIconMap.get(file.status)}</button>}</td>
              <td className="relative left-1">
                <button onClick={() => handleRemoveFiles(file)} className="btn btn-xs btn-error btn-link uppercase text-xl">
                  <MdDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
    <div className="flex justify-between">
      <div className="space-x-2">
        <button onClick={handleUploadAll} className={`btn ${files.some(f => f.uploadable) || "btn-disabled"}`}>Upload all files</button>
        <button onClick={handleRemoveUploaded} className={`btn ${files.some(f => f.status === "done") || "btn-disabled"}`}>Remove uploaded</button>
      </div>

      <button
        onClick={() => { fileAdderRef.current?.getFiles().then(files => { handleAddFiles(files) }) }}
        className="btn btn-circle">

        <FaPlus />
      </button>
    </div>

    <FileAdder ref={fileAdderRef} />
  </main >
}

export default App
