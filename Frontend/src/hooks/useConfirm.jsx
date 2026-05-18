import toast from 'react-hot-toast'

export function useConfirm() {
  const confirm = ({ message = "Are you sure?", onConfirm, confirmText = "Confirm" }) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm">{message}</p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm border rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm?.()
              toast.dismiss(t.id)
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded"
          >
            {confirmText}
          </button>
        </div>
      </div>
    ))
  }

  return { confirm }
}