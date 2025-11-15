type Identity = {
  uid: string;
  name: string;
  email: string;
  email_verified: string;
  sex: number;
  birthday: string;
  role: string[];
  profile_picture: string;
}

type SearchedUser = {
  uid: string;
  name: string;
}

export type {
  Identity,
  SearchedUser
}
