export interface AuthResponse {
    user: {
        id: number;
        name: string;
        lastName: string;
        username: string;
        email: string;
        password: string;
        isAdmin: boolean;
    },
    access_token: string
}