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

//@ts-expect-error enum 다이죠부
enum Role {
  CORE_USER = "core:user",

  PLACE_ADD = "place:add",
  PLACE_EDIT = "place:edit",
  PLACE_DELETE = "place:delete",

  REGION_ADD = "region:add",
  REGION_EDIT = "region:edit",
  REGION_DELETE = "region:delete",

  THEME_EDIT = "theme:edit",

  IMAGE_UPLOAD = "image:upload",

  ROOT = "core:root"
}

type SearchedUser = {
  uid: string;
  name: string;
}

export type {
  Identity,
  SearchedUser,
}
export {
  Role
}
