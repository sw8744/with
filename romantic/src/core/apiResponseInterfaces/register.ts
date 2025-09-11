interface userRegisterAPI {
  code: number;
  status: string;
  jwt: string;
}

interface authOAuthGoogleRegisterInfoAPI {
  code: number;
  status: string;
  content: {
    auth: {
      type: string;
      sub: string;
    }
    name: string;
    email: string;
    email_verified: boolean;
  }
}

export type {
  userRegisterAPI,
  authOAuthGoogleRegisterInfoAPI
}
