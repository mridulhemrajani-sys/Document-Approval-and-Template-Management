import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
    const {user} = useAuth()

    return(
        <div className="p-8">
            <h1 className="text-3xl font-bold tracking-tight">
                Welcome, {user?.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
                Select a section to continue
            </p>
        </div>
    )
}