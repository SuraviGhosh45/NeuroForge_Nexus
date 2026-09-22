import { useState } from "react";

const UserAddForm = ({ onCancel, onCreateUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectRole, setSelectRole] = useState("");

  const roles = [
    "Admin",
    "Project Lead",
    "Project Manager",
    "Team Lead",
    "Developer",
    "Tester",
    "QA",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      name,
      email,
      role: selectRole,
    };

    onCreateUser(newUser);

    // Reset fields so the modal is clean next time it opens
    setName("");
    setEmail("");
    setSelectRole("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-xl border border-[#e8eef8]/10 bg-[#07111f] p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold text-[#e8eef8]">Add User</h1>
        <p className="mt-1 mb-6 text-sm text-[#e8eef8]/50">
          Add a new user to the system
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="mb-2 block text-sm text-[#e8eef8]/80">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] placeholder:text-[#e8eef8]/30 outline-none focus:border-[#e8eef8]/40"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm text-[#e8eef8]/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] placeholder:text-[#e8eef8]/30 outline-none focus:border-[#e8eef8]/40"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="mb-2 block text-sm text-[#e8eef8]/80">
              Role
            </label>
            <select
              id="role"
              value={selectRole}
              onChange={(e) => setSelectRole(e.target.value)}
              required
              className="w-full rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-[#e8eef8]/15 px-4 py-2.5 text-sm text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#e8eef8] px-4 py-2.5 text-sm font-medium text-[#07111f] transition hover:bg-[#e8eef8]/90"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddForm;