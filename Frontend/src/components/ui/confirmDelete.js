import toast from 'react-hot-toast'

const confirmDelete = (onConfirm) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <p className="text-sm">Delete this image?</p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            toast.dismiss(t.id)
          }}
          className="px-3 py-1 text-sm border rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            onConfirm()
            toast.dismiss(t.id)
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  ))
}