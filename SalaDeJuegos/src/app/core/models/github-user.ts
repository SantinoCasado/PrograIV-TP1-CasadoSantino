export interface GithubUser {
    login: string;
    name: string | null;
    bio: string | null;
    avatar_url: string;
    public_repos: number;
    followers: number;
    following: number;
    location: string | null;
    company: string | null;
    html_url: string;
    blog: string;
}
