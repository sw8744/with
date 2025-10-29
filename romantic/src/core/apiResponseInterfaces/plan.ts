import type ApiInterface from "./apiInterface.ts";
import type {PlanRole} from "../redux/PlanReducer.ts";
import type {FriendInformationType} from "./relationship.ts";

type planAddition = ApiInterface & {
  plan: {
    uid: string;
    name: string;
    host_id: string;
    date_from: string;
    date_to: string;
  }
}

type GetGeneralPlanRequest = ApiInterface & {
  plan: {
    uid: string;
    name: string;
    host_id: string;
    date: {
      polling: string | null;
      from: string | null;
      to: string | null;
    };
    members: Array<{
      uid: string;
      name: string;
      role: number;
    }>;
  }
}

type GetVoteStatusRequest = ApiInterface & {
  poll: {
    pollingOpen: string;
    dateFrom: string;
    dateTo: string;
    voted: number;
    votes: Record<string, number>;
  }
}

type PlanMemberType = FriendInformationType & {
  role: PlanRole;
}

type GetMyVoteRequest = ApiInterface & {
  vote: string[];
}

export type {
  planAddition,
  GetGeneralPlanRequest,
  GetVoteStatusRequest,
  GetMyVoteRequest,
  PlanMemberType
}
