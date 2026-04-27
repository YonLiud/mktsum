export function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-medium">mktsum.</h1>
      <form className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="text"
          placeholder="Username"
          className="border border-(--border) rounded px-3 py-2 bg-transparent outline-none focus:border-[var(--accent)]"
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-(--border) rounded px-3 py-2 bg-transparent outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          className="bg-(--accent) text-white rounded px-3 py-2 font-medium cursor-pointer"
        >
          Log in
        </button>
      </form>
    </div>
  )
}
