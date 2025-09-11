interface userAPI {
  code: number;
  status: string;
  user: {
    uuid: string;
    name: string;
    email: string;
    emailVerified: string;
    sex: number;
    birthday: string;
    role: string[];
  }
}

export type {
  userAPI
}
