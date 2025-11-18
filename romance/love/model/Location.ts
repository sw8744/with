type Region = {
  uid: string;
  name: string;
  description: string;
  thumbnail: string | undefined;
}

type Place = {
  uid: string;
  name: string;
  description: string;
  coordinate: number[] | undefined;
  address: string | undefined;
  region_uid: string | undefined;
  thumbnail: string | undefined;
  metadata: object;
}

export type {
  Region, Place
}


