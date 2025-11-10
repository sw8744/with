import type ApiInterface from "./apiInterface.ts";
import type {PlanRole} from "../redux/PlanReducer.ts";
import type {FriendInformationType} from "./relationship.ts";

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

type Plan = {
  uid: string;
  name: string;
  host_id: string;
  date_from: string | null;
  date_to: string | null;
  polling_date: string | null;
}

type ListMyPlansRequest = ApiInterface & {
  plans: Array<Plan>;
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

type GetPlanActivitiesRequest = ApiInterface & {
  activities: Array<PlanActivity>
}

type PlanActivity = {
  uid: string;
  name: string;
  description: string;
  place_id: string | null;
  at_date: string;
  at_time: string;
  category: number;
}

type PlanMemberType = FriendInformationType & {
  role: PlanRole;
}

type GetMyVoteRequest = ApiInterface & {
  vote: string[];
}

export type {
  Plan,

  GetGeneralPlanRequest,
  GetVoteStatusRequest,
  GetPlanActivitiesRequest,
  GetMyVoteRequest,
  PlanMemberType,
  PlanActivity,
  ListMyPlansRequest
}
