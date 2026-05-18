export default function AdminTable({ columns, data, onEdit, onDelete, deletingId }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">No records found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-semibold
                  text-gray-400 uppercase tracking-wide"
              >
                {col.label}
              </th>
            ))}
            <th className="text-right px-4 py-3 text-xs font-semibold
              text-gray-400 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(row)}
                    className="text-xs text-indigo-600 hover:text-indigo-700
                      border border-indigo-200 hover:border-indigo-400 px-3 py-1.5
                      rounded-lg transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    disabled={deletingId === row.id}
                    className="text-xs text-red-500 hover:text-red-600
                      border border-red-200 hover:border-red-400 px-3 py-1.5
                      rounded-lg transition disabled:opacity-40 cursor-pointer"
                  >
                    {deletingId === row.id ? '...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}