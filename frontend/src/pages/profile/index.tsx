import { useAuth } from "@/hooks/useAuth";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useState } from "react";

export function ProfilePage() {
    const {data: user} = useAuth()
    const {mutate: updateUser, isPending} = useUpdateUser()
    const [isEditing, setIsEditing] = useState(false)
    const [form, setForm] = useState({name: user?.name ?? '', ntfy_topic: user?.ntfy_topic ?? ''})

    if(!user) return null

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-4">
            <h1 className="text-3xl font-medium">profile.</h1>
            <p className="text-sm opacity-50 mt-1">{user.username}</p>
            {isEditing ? (
                <>
                    <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="border border-current/20 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-current/40"
                        placeholder="name"
                    />
                    <input
                        value={form.ntfy_topic}
                        onChange={e => setForm(f => ({ ...f, ntfy_topic: e.target.value }))}
                        className="border border-current/20 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-current/40"
                        placeholder="ntfy topic"
                    />
                    <div className="flex gap-3">
                        <button onClick={() => setIsEditing(false)} className="text-xs opacity-40 underline cursor-pointer">
                            cancel
                        </button>
                        <button onClick={() => updateUser(form, {onSuccess: () => setIsEditing(false)})} disabled={isPending} className="text-xs underline cursor-pointer">
                            {isPending ? 'saving...' : 'save'}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p>{user?.name}</p>
                    <p>{user?.ntfy_topic ?? 'no ntfy topic set'}</p>
                    <button onClick={() => setIsEditing(true)} className="text-xs opacity-40 underline cursor-pointer w-fit">
                        edit
                    </button>
                </>
            )}
        </div>
    )
}