
const DeleteUserModal = ({ user, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

      {/* Modal */}
      <div className="w-full max-w-md rounded-xl border border-[#e8eef8]/10 bg-[#07111f] p-6 shadow-2xl">

        {/* Header */}
        <h2 className="text-xl font-semibold text-[#e8eef8]">
          Delete User?
        </h2>

        {/* Message */}
        <p className="mt-3 text-sm leading-6 text-[#e8eef8]/60">
          Are you sure you want to delete{" "}
          <span className="font-medium text-[#e8eef8]">
            {user.name}
          </span>
          ?
        </p>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">

          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#e8eef8]/15 px-4 py-2.5 text-sm font-medium text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
          >
            Cancel
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-[#e8eef8] px-4 py-2.5 text-sm font-medium text-[#07111f] transition hover:bg-[#e8eef8]/90"
          >
            Delete User
          </button>

        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;

