export type User = {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};
