import { useState } from "react";

const EditUserForm = ({ user, onCancel, onSave }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      fullName,
      email,
    };

    onSave(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

      <div className="w-full max-w-lg rounded-xl border border-[#e8eef8]/10 bg-[#07111f] p-6 shadow-2xl">

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#e8eef8]">
            Edit User
          </h2>

          <p className="mt-1 text-sm text-[#e8eef8]/50">
            Update user information
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="mb-5">
            <label
              htmlFor="edit-name"
              className="mb-2 block text-sm font-medium text-[#e8eef8]/80"
            >
              Full Name
            </label>

            <input
              id="edit-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-[#e8eef8]/40 focus:ring-2 focus:ring-[#e8eef8]/10"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="edit-email"
              className="mb-2 block text-sm font-medium text-[#e8eef8]/80"
            >
              Email
            </label>

            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-[#e8eef8]/40 focus:ring-2 focus:ring-[#e8eef8]/10"
            />
          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-[#e8eef8]/15 px-4 py-2.5 text-sm font-medium text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-[#e8eef8] px-4 py-2.5 text-sm font-medium text-[#07111f] transition hover:bg-[#e8eef8]/90"
            >
              Save Changes
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default EditUserForm;