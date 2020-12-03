export interface AuthResponse {
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
        password: string;
    },
    access_token: string
}