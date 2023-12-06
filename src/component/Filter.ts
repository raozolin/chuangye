export type FilterOptions = {
    end_at: number | null,
    start_at: number | null,
    organization_id: number | null,
    priority: number | null,
    status: FilterStatus,
    sender_role: string | null,
}

export type FilterStatus = 'read' | 'unread' | 'confirmed' | 'unconfirmed' | 'done' | 'notdone' | null