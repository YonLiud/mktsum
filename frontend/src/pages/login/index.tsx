import { useLogin } from '@/hooks/useLogin'

export function LoginPage() {
  const { error, isLoading, handleSubmit } = useLogin()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-medium">mktsum.</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
        <input
          name="username"
          type="text"
          placeholder="Username"
          className="border border-(--border) rounded px-3 py-2 bg-transparent outline-none focus:border-(--accent)"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border border-(--border) rounded px-3 py-2 bg-transparent outline-none focus:border-(--accent)"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-(--accent) text-white rounded px-3 py-2 font-medium cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
