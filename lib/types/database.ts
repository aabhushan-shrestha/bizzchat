export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseRow = Record<string, any>

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'business' | 'customer' | null
                    full_name: string | null
                    email: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    role?: 'business' | 'customer' | null
                    full_name?: string | null
                    email?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    role?: 'business' | 'customer' | null
                    full_name?: string | null
                    email?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            businesses: {
                Row: {
                    id: string
                    owner_id: string
                    business_name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    business_name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    business_name?: string
                    created_at?: string
                }
                Relationships: []
            }
            conversations: {
                Row: {
                    id: string
                    business_id: string
                    customer_id: string
                    created_at: string
                    last_message_at: string | null
                }
                Insert: {
                    id?: string
                    business_id: string
                    customer_id: string
                    created_at?: string
                    last_message_at?: string | null
                }
                Update: {
                    id?: string
                    business_id?: string
                    customer_id?: string
                    created_at?: string
                    last_message_at?: string | null
                }
                Relationships: []
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    created_at: string
                    is_bot: boolean | null
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    created_at?: string
                    is_bot?: boolean | null
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string
                    is_bot?: boolean | null
                }
                Relationships: []
            }
            orders: {
                Row: {
                    id: string
                    business_id: string
                    conversation_id: string | null
                    customer_id: string | null
                    customer_name: string | null
                    address: string | null
                    phone: string | null
                    product_name: string | null
                    form_response_json: Json | null
                    invoice_json: Json | null
                    status: 'pending' | 'delivered'
                    created_at: string
                }
                Insert: {
                    id?: string
                    business_id: string
                    conversation_id?: string | null
                    customer_id?: string | null
                    customer_name?: string | null
                    address?: string | null
                    phone?: string | null
                    product_name?: string | null
                    form_response_json?: Json | null
                    invoice_json?: Json | null
                    status?: 'pending' | 'delivered'
                    created_at?: string
                }
                Update: {
                    id?: string
                    business_id?: string
                    conversation_id?: string | null
                    customer_id?: string | null
                    customer_name?: string | null
                    address?: string | null
                    phone?: string | null
                    product_name?: string | null
                    form_response_json?: Json | null
                    invoice_json?: Json | null
                    status?: 'pending' | 'delivered'
                    created_at?: string
                }
                Relationships: []
            }
            order_form_configs: {
                Row: {
                    id: string
                    business_id: string
                    fields_json: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    business_id: string
                    fields_json?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    business_id?: string
                    fields_json?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Business = Database['public']['Tables']['businesses']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderFormConfig = Database['public']['Tables']['order_form_configs']['Row']

export type ConversationWithDetails = Conversation & {
    businesses?: { business_name: string } | null
    profiles?: { full_name: string | null; email: string | null } | null
    last_message?: string | null
    unread_count?: number
}

export type MessageWithSender = Message & {
    profiles?: { full_name: string | null } | null
}

export type OrderWithDetails = Order & {
    businesses?: { business_name: string } | null
}

export type InvoiceJson = {
    invoice_id: string
    created_at: string
    business: string
    customer: {
        name: string
        address: string
        phone: string
    }
    product: string
    status: 'pending' | 'delivered'
}

export type OrderBotState = {
    active: boolean
    step: number
    customer_name?: string
    address?: string
    phone?: string
    product_name?: string
}
