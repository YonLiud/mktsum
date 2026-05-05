import { useMutation } from '@tanstack/react-query'
import { useAuth, useSetAuth } from "@/hooks/useAuth";
import { api } from '@/lib/api';


export function useUpdateUser() {
    const { data: user } = useAuth()
    const setAuth =  useSetAuth()
    return useMutation({
        mutationFn: async (updates: {name? : string; ntfy_topic?: string}) => {
            const res = await api.patch(`/users/${user!.user_id}`, updates)
            if(!res.ok) throw new Error("Failed to modify user")
            return res.json()
        },
        onSuccess: (updatedUser) => setAuth(updatedUser)
    })
}